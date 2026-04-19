import { useCallback, useRef, useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface SpeechAlertOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

type VoiceGender = 'male' | 'female';

export function useSpeechAlert(options: SpeechAlertOptions = {}) {
  const { volume = 1.0 } = options;
  const isSpeakingRef = useRef(false);
  const lastSpokenRef = useRef<string>('');
  const lastSpeakTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [voiceGender, setVoiceGender] = useState<VoiceGender>(() => {
    return (localStorage.getItem('neural_voice_gender') as VoiceGender) || 'female';
  });
  
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem('neural_voice_enabled') !== 'false';
  });

  const changeVoiceGender = useCallback((gender: VoiceGender) => {
    setVoiceGender(gender);
    localStorage.setItem('neural_voice_gender', gender);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    isSpeakingRef.current = false;
  }, []);

  const toggleVoiceEnabled = useCallback((enabled: boolean) => {
    setVoiceEnabled(enabled);
    localStorage.setItem('neural_voice_enabled', String(enabled));
    if (!enabled) {
      stopSpeaking();
    }
  }, [stopSpeaking]);

  // 🎯 SIMPLIFICAR E HUMANIZAR O TEXTO
  const cleanText = useCallback((text: string): string => {
    let cleanText = text
      // Remover emojis
      .replace(/[🚨🐋💎⚠️📊🏦📉⚡🤖💰⛓️🛡️🚀🎭📈🔥🟢🔴⚪⏰🌏]/g, '')
      // Remover endereços de carteira
      .replace(/\(0x[a-f0-9.]+\)/gi, '')
      // Remover valores exatos complexos
      .replace(/\~\$[\d.]+M/g, '')
      .replace(/aproximadamente/gi, 'cerca de')
      .trim();

    // 🎯 ENCURTAR MENSAGENS LONGAS (máximo 150 caracteres para voz)
    if (cleanText.length > 150) {
      // Pegar só a primeira frase importante
      const parts = cleanText.split('.');
      cleanText = parts[0] + '.';
    }

    return cleanText;
  }, []);

  // 🎤 SINTETIZAR VOZ VIA GOOGLE CLOUD TTS (Neural2)
  const speak = useCallback(async (text: string, priority: 'high' | 'normal' = 'normal'): Promise<void> => {
    // 🚫 SE VOZ DESABILITADA
    if (!voiceEnabled) {
      console.log('[TTS] Voz desabilitada pelo usuário');
      return Promise.resolve();
    }

    // 🚫 COOLDOWN: Não falar se falou há menos de 8 segundos (exceto prioridade alta)
    const now = Date.now();
    if (priority !== 'high' && now - lastSpeakTimeRef.current < 8000) {
      console.log('[TTS] Cooldown ativo, aguardando...');
      return Promise.resolve();
    }

    // 🚫 NÃO REPETIR: Evitar falar o mesmo texto 2x seguidas (DESABILITADO para análises)
    if (text === lastSpokenRef.current && priority !== 'high') {
      console.log('[TTS] Mensagem já falada recentemente');
      return Promise.resolve();
    }

    // Se já está falando e a prioridade não é alta, não interromper
    if (isSpeakingRef.current && priority !== 'high') {
      console.log('[TTS] Já está falando, aguardando...');
      return Promise.resolve();
    }

    // Se prioridade alta, cancelar fala atual
    if (priority === 'high' && isSpeakingRef.current) {
      console.log('[TTS] Prioridade alta, cancelando fala atual');
      stopSpeaking();
    }

    return new Promise<void>(async (resolve, reject) => {
      try {
        isSpeakingRef.current = true;
        lastSpokenRef.current = text;
        lastSpeakTimeRef.current = now;

        // Limpar e preparar texto
        const textToSpeak = cleanText(text);
        
        console.log('[TTS] 🎤 Solicitando síntese de voz:', {
          textLength: textToSpeak.length,
          voiceGender,
          priority
        });

        // 🚀 CHAMAR API DO SERVIDOR
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/tts/synthesize`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              text: textToSpeak,
              voiceGender: voiceGender
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[TTS] ❌ Erro na API:', response.status, errorData);
          
          // Se API falhar, mostrar mensagem ao usuário
          if (response.status === 500 && errorData.error?.includes('GOOGLE_TTS_API_KEY')) {
            console.error('[TTS] ⚠️ API Key do Google Cloud TTS não configurada!');
          }
          
          isSpeakingRef.current = false;
          resolve();
          return;
        }

        const data = await response.json();
        
        if (!data.audioContent) {
          console.error('[TTS] ❌ Resposta sem audioContent');
          isSpeakingRef.current = false;
          resolve();
          return;
        }

        console.log('[TTS] ✅ Áudio recebido, reproduzindo...');

        // 🔊 REPRODUZIR ÁUDIO
        // Converter Base64 para Blob
        const audioBlob = base64ToBlob(data.audioContent, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);

        // Criar elemento de áudio
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audioRef.current = audio;

        audio.onended = () => {
          console.log('[TTS] 🎵 Reprodução finalizada');
          URL.revokeObjectURL(audioUrl);
          isSpeakingRef.current = false;
          resolve(); // ✅ Resolver Promise quando terminar
        };

        audio.onerror = (error) => {
          console.error('[TTS] ❌ Erro ao reproduzir áudio:', error);
          URL.revokeObjectURL(audioUrl);
          isSpeakingRef.current = false;
          reject(error);
        };

        await audio.play();
      } catch (error) {
        console.error('[TTS] ❌ Erro ao sintetizar voz:', error);
        isSpeakingRef.current = false;
        reject(error);
      }
    });
  }, [voiceEnabled, voiceGender, volume, cleanText]);

  return { 
    speak, 
    stopSpeaking, 
    voiceGender, 
    changeVoiceGender,
    voiceEnabled,
    toggleVoiceEnabled
  };
}

// 🎯 HELPER: Converter Base64 para Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
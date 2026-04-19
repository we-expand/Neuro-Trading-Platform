import React, { useState } from 'react';
import { Volume2, VolumeX, User, Users, AlertCircle, Key, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useSpeechAlert } from '@/app/hooks/useSpeechAlert';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function VoiceSettings() {
  const { voiceGender, changeVoiceGender, speak, stopSpeaking, voiceEnabled, toggleVoiceEnabled } = useSpeechAlert();
  const [isTesting, setIsTesting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      alert('Por favor, insira uma API Key válida!');
      return;
    }

    try {
      // Salvar no backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/save-google-key`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ apiKey: apiKey.trim() })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsKeySaved(true);
        setTimeout(() => setIsKeySaved(false), 3000);
        alert(`✅ ${data.message}\n\nAgora você pode testar as vozes Neural2 clicando nos cards abaixo!`);
      } else {
        // Erro detalhado
        let errorMessage = `❌ ${data.error || 'Erro ao configurar API Key'}\n\n`;
        
        if (data.details) {
          errorMessage += `Detalhes: ${data.details}\n\n`;
        }
        
        if (data.instructions && Array.isArray(data.instructions)) {
          errorMessage += 'INSTRUÇÕES:\n';
          errorMessage += data.instructions.join('\n');
        }
        
        if (data.hint) {
          errorMessage += `\n\n💡 ${data.hint}`;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao salvar API key:', error);
      alert('❌ Erro ao conectar com o servidor. Verifique sua conexão.');
    }
  };

  const handleToggleVoice = () => {
    const newState = !voiceEnabled;
    toggleVoiceEnabled(newState);
    
    if (newState) {
      speak('Sistema de voz ativado com sucesso.', 'high');
    }
  };

  const testVoice = async (gender: 'male' | 'female') => {
    if (isTesting) return;
    
    setIsTesting(true);
    changeVoiceGender(gender);
    
    const messages = {
      male: 'Olá! Sou o assistente da Neural Day Trader. Bitcoin registrando forte movimento de alta!',
      female: 'Olá! Sou a assistente da Neural Day Trader. Detectamos grande volume institucional entrando no mercado!'
    };
    
    try {
      await speak(messages[gender], 'high');
    } catch (error) {
      console.error('Erro ao testar voz:', error);
    } finally {
      // Delay para permitir que o áudio termine
      setTimeout(() => setIsTesting(false), 3000);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Volume2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Assistente de Voz Neural2</h3>
            <p className="text-xs text-slate-400">Vozes ultra-realistas powered by Google Cloud</p>
          </div>
        </div>

        <button
          onClick={handleToggleVoice}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            voiceEnabled ? 'bg-purple-600' : 'bg-slate-700'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              voiceEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {voiceEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-bold text-slate-300 mb-3 block uppercase tracking-wider">
              Escolha a Voz Neural2:
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* VOZ FEMININA */}
              <button
                onClick={() => testVoice('female')}
                disabled={isTesting}
                className={`relative p-4 rounded-xl border-2 transition-all group ${
                  voiceGender === 'female'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                } ${isTesting ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    voiceGender === 'female' ? 'bg-purple-500/20' : 'bg-white/5'
                  }`}>
                    <User className={`w-6 h-6 ${
                      voiceGender === 'female' ? 'text-purple-400' : 'text-slate-400'
                    }`} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">Feminina Neural2-A</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Natural e clara
                    </div>
                  </div>
                </div>
                
                {voiceGender === 'female' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}

                <div className="mt-3 text-xs text-slate-500 group-hover:text-purple-400 transition-colors text-center">
                  {isTesting ? 'Reproduzindo...' : 'Clique para testar'}
                </div>
              </button>

              {/* VOZ MASCULINA */}
              <button
                onClick={() => testVoice('male')}
                disabled={isTesting}
                className={`relative p-4 rounded-xl border-2 transition-all group ${
                  voiceGender === 'male'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-blue-500/50'
                } ${isTesting ? 'opacity-50 cursor-wait' : ''}`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    voiceGender === 'male' ? 'bg-blue-500/20' : 'bg-white/5'
                  }`}>
                    <Users className={`w-6 h-6 ${
                      voiceGender === 'male' ? 'text-blue-400' : 'text-slate-400'
                    }`} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">Masculina Neural2-B</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Grave e firme
                    </div>
                  </div>
                </div>
                
                {voiceGender === 'male' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}

                <div className="mt-3 text-xs text-slate-500 group-hover:text-blue-400 transition-colors text-center">
                  {isTesting ? 'Reproduzindo...' : 'Clique para testar'}
                </div>
              </button>
            </div>
          </div>

          {/* INFORMAÇÕES */}
          <div className="p-4 bg-purple-950/30 border border-purple-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Volume2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-purple-200 leading-relaxed">
                <p className="font-bold mb-1">🎤 Tecnologia Google Neural2:</p>
                <ul className="space-y-1 text-purple-300/80">
                  <li>• Mesma qualidade do Gemini Live</li>
                  <li>• Vozes indistinguíveis de humanos reais</li>
                  <li>• Entonação, pausas e respiração naturais</li>
                  <li>• Alertas apenas em eventos críticos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AVISO CONFIGURAÇÃO */}
          <div className="p-4 bg-amber-950/30 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 leading-relaxed">
                <p className="font-bold mb-2">⚙️ Configuração necessária (passo a passo):</p>
                <ol className="space-y-2 text-amber-300/90 list-decimal list-inside">
                  <li>
                    <a 
                      href="https://console.cloud.google.com/apis/library/texttospeech.googleapis.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 underline font-medium"
                    >
                      Ativar API Text-to-Speech
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://console.cloud.google.com/apis/library/speech.googleapis.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 underline font-medium"
                    >
                      Ativar API Speech-to-Text
                    </a>
                  </li>
                  <li>
                    Ir em{' '}
                    <a 
                      href="https://console.cloud.google.com/apis/credentials" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 underline font-medium"
                    >
                      Credenciais
                    </a>
                    {' '}→ "Criar credenciais" → "Chave de API"
                  </li>
                  <li className="font-bold text-amber-200">
                    Copiar a chave e colar no campo que apareceu acima ☝️
                  </li>
                </ol>
                <div className="mt-3 p-2 bg-amber-900/30 rounded border border-amber-500/30">
                  <p className="text-amber-200 font-bold text-xs">
                    💡 Dica: Se aparecer "Configure OAuth", ignore - não é necessário para API Key!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CAMPO PARA API KEY */}
          <div className="p-5 bg-green-950/20 border border-green-500/30 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-green-400" />
                <p className="font-bold text-sm text-green-300">🔑 Cole sua API Key aqui:</p>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-black/40 border border-green-500/30 rounded-lg text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-green-500/60 transition-colors"
                />
                {isKeySaved && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                      <Check className="w-3 h-3" />
                      SALVA!
                    </div>
                  </motion.div>
                )}
              </div>
              
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim() || isKeySaved}
                className={`w-full px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                  apiKey.trim() && !isKeySaved
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isKeySaved ? '✅ API Key Salva!' : 'Salvar e Ativar Vozes Neural2'}
              </button>

              <p className="text-xs text-green-400/70 text-center">
                Sua chave será armazenada com segurança e usada apenas para as vozes Neural2
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
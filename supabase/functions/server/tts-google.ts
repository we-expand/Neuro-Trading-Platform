// Google Cloud Text-to-Speech Neural2 - pt-BR

export async function synthesizeSpeech(
  text: string,
  voiceGender: string = 'female',
  apiKey: string
): Promise<string | null> {
  try {
    const voiceName = voiceGender === 'male' ? 'pt-BR-Neural2-B' : 'pt-BR-Neural2-C';
    const ssmlGender = voiceGender === 'male' ? 'MALE' : 'FEMALE';

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'pt-BR',
            name: voiceName,
            ssmlGender,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('[TTS] Google API error:', response.status, err);
      return null;
    }

    const data = await response.json();
    return data.audioContent || null;
  } catch (error) {
    console.error('[TTS] synthesizeSpeech error:', error);
    return null;
  }
}

export async function validateGoogleTTSKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`,
      { method: 'GET' }
    );
    return response.ok;
  } catch {
    return false;
  }
}

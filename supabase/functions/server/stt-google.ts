// Google Cloud Speech-to-Text - pt-BR

export async function transcribeAudio(
  audioBase64: string,
  apiKey: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'pt-BR',
            model: 'latest_short',
            enableAutomaticPunctuation: true,
          },
          audio: { content: audioBase64 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('[STT] Google API error:', response.status, err);
      return null;
    }

    const data = await response.json();
    const results = data.results;

    if (!results || results.length === 0) {
      return null;
    }

    const transcript = results
      .map((r: any) => r.alternatives?.[0]?.transcript || '')
      .join(' ')
      .trim();

    return transcript || null;
  } catch (error) {
    console.error('[STT] transcribeAudio error:', error);
    return null;
  }
}

export async function validateGoogleSTTKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: 'pt-BR' },
          audio: { content: '' },
        }),
      }
    );
    // 400 = bad request (key valid but empty audio) vs 403 = invalid key
    return response.status !== 403;
  } catch {
    return false;
  }
}

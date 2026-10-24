import { countWords } from '../util';

// Primary model from env, then a lighter fallback. On 503/429 we switch model instead of waiting.
const MODELS = [process.env.GEMINI_MODEL || 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Missing GEMINI_API_KEY in .env.local');
  let lastStatus = 0;
  for (const model of MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const j = await res.json();
        const text = (j?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('');
        if (text.trim()) return text;
        lastStatus = 204;
        continue;
      }
      lastStatus = res.status;
      console.error('GEMINI FAIL', res.status, `model=[${model}]`, (await res.text()).slice(0, 200));
    } catch (e) {
      lastStatus = 0;
      console.error('GEMINI ERROR', `model=[${model}]`, e instanceof Error ? e.message : e);
    }
  }
  throw new Error(`Gemini request failed (${lastStatus}). Check the API key, model name and free-tier limits.`);
}
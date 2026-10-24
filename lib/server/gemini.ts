import { countWords } from '../util';

// Primary model from env, then a lighter fallback. On 429/5xx we switch model instead of waiting.
const MODELS = [process.env.GEMINI_MODEL || 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];

// Total time one post may use (both Gemini calls together). Vercel kills the function at 60s.
const BUDGET_MS = 50000;

async function callGemini(prompt: string, deadline: number): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Missing GEMINI_API_KEY in .env.local');
  let lastStatus = 0;

  for (const model of MODELS) {
    const left = deadline - Date.now();
    if (left < 5000) break; // not enough time for another call

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
          }),
          signal: AbortSignal.timeout(Math.min(30000, left)),
        }
      );

      if (res.ok) {
        const j = await res.json();
        const text = (j?.candidates?.[0]?.content?.parts ?? [])
          .map((p: { text?: string }) => p.text ?? '')
          .join('');
        if (text.trim()) return text;
        lastStatus = 204;
        continue;
      }

      lastStatus = res.status;
      const body = await res.text();
      const quota = body.match(/PerDay|PerMinute/g)?.join(',') ?? '';
      const delay = body.match(/"retryDelay":\s*"([^"]+)"/)?.[1] ?? '';
      console.error('GEMINI FAIL', res.status, `model=[${model}]`, `quota=[${quota}]`, `retryDelay=[${delay}]`);
    } catch (e) {
      lastStatus = 0;
      console.error('GEMINI ERROR', `model=[${model}]`, e instanceof Error ? e.message : e);
    }
  }
  throw new Error(`Gemini request failed (${lastStatus}). Check the API key, model name and free-tier limits.`);
}

const prompt = (topic: string, company: string, strict = false) => `You are writing a blog post for the website of "${company}".

Topic: ${topic}

Write about 1,000 words${strict ? ' (at least 1,000 words; the previous attempt was too short, so be thorough)' : ''}. Plain, factual, helpful language for a general reader. Do not invent statistics, awards, prices or claims about ${company}. Do not mention that you are an AI.

Format rules (important):
- Do NOT include the title. Start straight with the introduction paragraph.
- Use "## " for section headings. Write exactly 4 sections after the introduction.
- Include one bulleted list, using "- " at the start of each item.
- Use **bold** sparingly. No numbered lists, tables, links, emojis or code blocks.
- End with a short closing paragraph under the heading "## The short version".`;

function clean(t: string) {
  return t.replace(/^```(?:markdown|md)?\s*/i, '').replace(/```\s*$/, '').replace(/^#\s+.*\n+/, '').trim();
}

/** Writes one post. Retries once if under 700 words, but only if there is time left. */
export async function writePost(topic: string, company: string) {
  const deadline = Date.now() + BUDGET_MS;
  let text = clean(await callGemini(prompt(topic, company), deadline));

  if (countWords(text) < 700 && deadline - Date.now() > 20000) {
    try {
      const retry = clean(await callGemini(prompt(topic, company, true), deadline));
      if (countWords(retry) > countWords(text)) text = retry;
    } catch { /* keep the first attempt */ }
  }

  if (countWords(text) < 300) throw new Error('The generated post was too short');
  return text;
}
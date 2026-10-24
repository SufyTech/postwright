import { countWords } from '../util';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Missing GEMINI_API_KEY in .env.local');
  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
    });
    if (res.ok) {
      const j = await res.json();
      const text = (j?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? '').join('');
      if (!text.trim()) throw new Error('Gemini returned an empty answer');
      return text;
    }
    const errText = await res.text();
    console.error('GEMINI FAIL', res.status, 'model=[' + MODEL + ']', errText.slice(0, 300));
    lastStatus = res.status;
    if (res.status !== 429 && res.status < 500) break; // wrong key / wrong model name: retrying will not help
    await sleep(2000 * (attempt + 1)); // rate limit or server hiccup: wait, then try again
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

/** Writes one post. Retries once if it comes back under 900 words and keeps the longer version. */
export async function writePost(topic: string, company: string) {
  let text = clean(await callGemini(prompt(topic, company)));
  if (countWords(text) < 900) {
    try {
      const retry = clean(await callGemini(prompt(topic, company, true)));
      if (countWords(retry) > countWords(text)) text = retry;
    } catch { /* keep the first attempt */ }
  }
  if (countWords(text) < 300) throw new Error('The generated post was too short');
  return text;
}

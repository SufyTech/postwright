import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { writePost } from '@/lib/server/gemini';
import { countWords } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds. Check your Vercel plan's limit.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Writes ONE post. The screen calls this once per topic, three at a time. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const sb = db();
  const { data: post } = await sb.from('posts').select('id,topic,set_id').eq('id', params.id).single();
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  const { data: set } = await sb.from('blog_sets').select('company').eq('id', post.set_id).single();
  await sb.from('posts').update({ status: 'writing' }).eq('id', post.id);

  const started = Date.now();
  let lastError = 'Failed';

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const body = await writePost(post.topic, set?.company ?? '');
      await sb
        .from('posts')
        .update({ status: 'done', title: post.topic, body, words: countWords(body) })
        .eq('id', post.id);
      return NextResponse.json({ ok: true });
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      console.error(`GENERATE ERROR [${post.topic}] attempt ${attempt}:`, lastError);

      // Stop if we're running out of time (Vercel limit is 60s)
      const elapsed = Date.now() - started;
      if (attempt === 3 || elapsed > 35000) break;
      await sleep(attempt * 3000); // wait 3s, then 6s
    }
  }

  await sb.from('posts').update({ status: 'failed' }).eq('id', post.id);
  return NextResponse.json({ ok: false, error: lastError }, { status: 502 });
}
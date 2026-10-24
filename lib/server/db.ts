import { createClient } from '@supabase/supabase-js';

export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  return createClient(url, key, { auth: { persistSession: false } });
}

export type SetRow = { id: string; company: string; slug: string; logo_url: string | null; color: string; created_at: string };
export type PostRow = { id: string; set_id: string; position: number; topic: string; slug: string; title: string; body: string; words: number; status: 'waiting' | 'writing' | 'done' | 'failed' };

/** Shape used by the screens. Bodies are left empty in lists to keep them light. */
export const toBlogSet = (s: SetRow, posts: Omit<PostRow, 'body'>[]) => ({
  id: s.id, company: s.company, slug: s.slug, logo: s.logo_url, color: s.color, createdAt: s.created_at,
  posts: posts.sort((a, b) => a.position - b.position).map((p) => ({ id: p.id, topic: p.topic, slug: p.slug, title: p.title, body: '', words: p.words, status: p.status })),
});

export const LIST_POST_COLUMNS = 'id,set_id,position,topic,slug,title,words,status';

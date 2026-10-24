'use client';
import { useCallback, useEffect, useState } from 'react';

export type PostStatus = 'waiting' | 'writing' | 'done' | 'failed';
export type Post = { id: string; topic: string; slug: string; title: string; body: string; words: number; status: PostStatus };
export type BlogSet = { id: string; company: string; slug: string; logo: string | null; color: string; createdAt: string; posts: Post[] };

/** Loads all blog sets from the server. Call reload() to refresh. */
export function useSets() {
  const [sets, setSets] = useState<BlogSet[] | null>(null);
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    try {
      const r = await fetch('/api/sets', { cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Request failed');
      setSets(d.sets);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load blog sets.');
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { sets, error, reload };
}

export async function createSet(input: { company: string; color: string; logo: string | null; topics: string[] }): Promise<string> {
  const r = await fetch('/api/sets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Could not create the blog set.');
  return d.id as string;
}

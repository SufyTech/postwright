import { NextResponse } from 'next/server';
import { db, toBlogSet, LIST_POST_COLUMNS, SetRow, PostRow } from '@/lib/server/db';
import { isHex, normHex, slugify } from '@/lib/util';

export const dynamic = 'force-dynamic';
const fail = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });

export async function GET() {
  try {
    const sb = db();
    const { data: sets, error } = await sb.from('blog_sets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const { data: posts, error: e2 } = await sb.from('posts').select(LIST_POST_COLUMNS);
    if (e2) throw e2;
    return NextResponse.json({
      sets: (sets as SetRow[]).map((s) => toBlogSet(s, (posts as Omit<PostRow, 'body'>[]).filter((p) => p.set_id === s.id))),
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Could not load blog sets', 500);
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const company = String(b.company ?? '').trim();
    const color = String(b.color ?? '');
    const topics: string[] = Array.isArray(b.topics) ? b.topics.map((t: unknown) => String(t).trim()).filter(Boolean) : [];
    if (!company) return fail('Enter a company name.');
    if (!isHex(color)) return fail('Enter a 6-digit hex code, like #1F6F8B.');
    if (topics.length < 1 || topics.length > 10) return fail('Add between 1 and 10 topics.');
    if (new Set(topics.map((t) => t.toLowerCase())).size !== topics.length) return fail('Each topic must be different.');

    const sb = db();
    const { data: existing } = await sb.from('blog_sets').select('slug');
    const taken = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
    let slug = slugify(company), n = 2;
    while (taken.has(slug)) slug = `${slugify(company)}-${n++}`;

    const { data: set, error } = await sb.from('blog_sets').insert({ company, slug, color: normHex(color) }).select().single();
    if (error) throw error;

    // Logo: a data URL (new upload) goes to Storage; an existing URL from our own Storage is reused.
    const logo = typeof b.logo === 'string' ? b.logo : '';
    let logoUrl: string | null = null;
    const m = logo.match(/^data:(image\/(?:png|jpeg|svg\+xml));base64,(.+)$/);
    if (m) {
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 2 * 1024 * 1024) { await sb.from('blog_sets').delete().eq('id', set.id); return fail('Logo is over 2 MB.'); }
      const ext = m[1] === 'image/png' ? 'png' : m[1] === 'image/jpeg' ? 'jpg' : 'svg';
      const path = `${set.id}.${ext}`;
      const up = await sb.storage.from('logos').upload(path, buf, { contentType: m[1], upsert: true });
      if (up.error) throw up.error;
      logoUrl = sb.storage.from('logos').getPublicUrl(path).data.publicUrl;
    } else if (logo.startsWith('http') && process.env.SUPABASE_URL && logo.startsWith(process.env.SUPABASE_URL)) {
      logoUrl = logo;
    }
    if (logoUrl) await sb.from('blog_sets').update({ logo_url: logoUrl }).eq('id', set.id);

    const used = new Set<string>();
    const rows = topics.map((topic, i) => {
      let s = slugify(topic), k = 2;
      while (used.has(s)) s = `${slugify(topic)}-${k++}`;
      used.add(s);
      return { set_id: set.id, position: i, topic, slug: s, title: topic };
    });
    const { error: pe } = await sb.from('posts').insert(rows);
    if (pe) throw pe;
    return NextResponse.json({ id: set.id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Could not create the blog set', 500);
  }
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { useSets } from '@/lib/store';
import { generatePost } from '@/lib/generate';

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const { sets, error, reload } = useSets();
  const set = sets?.find((s) => s.id === id);
  const [host, setHost] = useState('postwright.app');
  const [copied, setCopied] = useState(false);
  useEffect(() => setHost(window.location.host), []);
  const anyBusy = !!set && set.posts.some((p) => p.status === 'waiting' || p.status === 'writing');
  useEffect(() => {
    if (!anyBusy) return;
    const t = setInterval(reload, 2000);
    return () => clearInterval(t);
  }, [anyBusy, reload]);

  if (sets && !set)
    return (<><TopBar /><main className="pt-14 px-8 py-16"><p className="text-on-surface-variant">This blog set was not found. <Link href="/" className="text-primary-container hover:underline">Back to blog sets</Link></p></main></>);
  if (!set) return (<><TopBar />{error && <main className="pt-14 px-8 py-16"><p role="alert" className="text-error">{error}</p></main>}</>);


  const live = set.posts.filter((p) => p.status === 'done').length;
  const base = `${host}/c/${set.slug}`;
  const btn = 'inline-flex items-center justify-center px-4 py-2 rounded-[6px] text-helper-text font-label-text transition-colors duration-150';

  return (
    <>
      <TopBar crumbs={[{ label: 'Blog sets', href: '/' }, { label: set.company }]} />
      <main className="w-full pt-14 bg-background min-h-[calc(100vh-56px)]">
        <div className="w-full max-w-[1100px] mx-auto px-space-lg py-10 flex flex-col gap-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg pb-space-xs">
            <div className="flex flex-col gap-space-xs">
              <h1 className="font-page-title text-page-title text-on-surface tracking-tight">{set.company}: {live} {live === 1 ? 'page' : 'pages'} published</h1>
              <div className="flex items-center gap-space-sm pt-0.5">
                <span className="text-body-default text-on-surface-variant font-mono">{base}</span>
                <button type="button" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/c/${set.slug}/${set.posts[0].slug}`); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors text-helper-text font-label-text outline outline-1 -outline-offset-1 outline-outline-variant">
                  <span className="material-symbols-outlined text-[15px] text-outline">content_copy</span>
                  <span>{copied ? 'Copied!' : 'Copy link'}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-space-sm self-start md:self-auto">
              <Link href={`/new?from=${set.id}`} className={`${btn} bg-surface-container-lowest text-on-surface hover:bg-surface-container-low outline outline-1 -outline-offset-1 outline-outline-variant`}>Edit brand</Link>
              <Link href="/new" className={`${btn} bg-primary-container text-on-primary hover:bg-primary`}>Create another blog set</Link>
            </div>
          </div>

          <div className="w-full bg-surface-container-lowest rounded-[6px] overflow-hidden outline outline-1 -outline-offset-1 outline-outline-variant">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low outline outline-1 -outline-offset-1 outline-outline-variant">
                    {['Topic', 'Address', 'Words', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} scope="col" className={`py-3 px-4 font-label-text text-helper-text text-on-surface-variant font-semibold ${i === 2 || i === 4 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {set.posts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors duration-100">
                      <td className="py-3.5 px-4 font-body-strong text-body-strong text-on-surface">{p.topic}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant font-mono text-[13px]">/{p.slug}</td>
                      <td className="py-3.5 px-4 text-on-surface-variant text-right">{p.words ? p.words.toLocaleString('en-US') : '–'}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-helper-text text-on-surface">
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'done' ? 'bg-[#1e7e34]' : p.status === 'failed' ? 'bg-error' : 'bg-outline'}`} />
                          {p.status === 'done' ? 'Live' : p.status === 'failed' ? 'Failed' : p.status === 'writing' ? 'Writing' : 'Waiting'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-space-md text-helper-text">
                          {p.status === 'done' && (
                            <Link href={`/c/${set.slug}/${p.slug}`} target="_blank" className="inline-flex items-center gap-0.5 text-primary-container hover:text-primary font-label-text transition-colors">
                              <span>Open page</span><span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                            </Link>
                          )}
                          <button type="button" disabled={p.status === 'writing'} onClick={() => { generatePost(p.id).then(reload); setTimeout(reload, 500); }} className="text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50">Regenerate</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

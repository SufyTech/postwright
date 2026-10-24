'use client';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { useSets, BlogSet } from '@/lib/store';
import { fmtDate, textOn } from '@/lib/util';

function Status({ s }: { s: BlogSet }) {
  const failed = s.posts.filter((p) => p.status === 'failed').length;
  const busy = s.posts.some((p) => p.status === 'waiting' || p.status === 'writing');
  const [dot, label, cls] = failed ? ['bg-error', `${failed} failed`, 'text-error'] : busy ? ['bg-outline', 'Writing', 'text-on-surface-variant'] : ['bg-[#1e7e34]', 'Live', 'text-on-surface'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-helper-text font-helper-text ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export default function BlogSets() {
  const { sets, error } = useSets();
  return (
    <>
      <TopBar />
      <main className="w-full pt-14 bg-background min-h-[calc(100vh-56px)]">
        <div className="w-full max-w-[1100px] px-8 pt-10 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-page-title text-page-title text-on-surface">Blog sets</h1>
            <Link href="/new" className="h-10 px-4 inline-flex items-center bg-primary-container text-white font-body-strong text-body-default rounded-lg hover:bg-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-container">
              New blog set
            </Link>
          </div>

          {error && <p role="alert" className="mb-4 text-helper-text font-helper-text text-error">{error}</p>}

          {sets && sets.length === 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-8 py-16 flex flex-col items-start">
              <h2 className="font-section-title text-section-title text-on-surface">No blog sets yet.</h2>
              <p className="font-body-default text-body-default text-on-surface-variant mt-1 mb-5">Create your first one to publish a page for each topic.</p>
              <Link href="/new" className="h-10 px-4 inline-flex items-center bg-primary-container text-white font-body-strong text-body-default rounded-lg hover:bg-primary transition-colors">New blog set</Link>
            </div>
          )}

          {sets && sets.length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    {['Company', 'Topics', 'Created', 'Status'].map((h) => (
                      <th key={h} scope="col" className="py-3 px-5 font-label-text text-helper-text text-on-surface-variant">{h}</th>
                    ))}
                    <th scope="col" className="py-3 px-5"><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {sets.map((s) => {
                    const busy = s.posts.some((p) => p.status === 'waiting' || p.status === 'writing');
                    return (
                      <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            {s.logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={s.logo} alt="" className="w-7 h-7 rounded object-contain border border-outline-variant bg-white" />
                            ) : (
                              <div className="w-7 h-7 rounded flex items-center justify-center font-body-strong text-[13px]" style={{ background: s.color, color: textOn(s.color) }}>
                                {s.company.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-body-strong text-body-strong text-on-surface">{s.company}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-on-surface-variant">{s.posts.length} topics</td>
                        <td className="py-3.5 px-5 text-on-surface-variant">{fmtDate(s.createdAt)}</td>
                        <td className="py-3.5 px-5"><Status s={s} /></td>
                        <td className="py-3.5 px-5 text-right">
                          <Link href={busy ? `/sets/${s.id}/generating` : `/sets/${s.id}`} className="font-label-text text-helper-text text-primary-container hover:underline">Open</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

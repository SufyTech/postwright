'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { createSet } from '@/lib/store';
import { isHex, normHex, slugify, textOn } from '@/lib/util';

const MAX = 10;
const MAX_BYTES = 2 * 1024 * 1024;
type Logo = { url: string; name: string; size: number };

export default function NewBlogSet() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<number | null>(null);

  const [company, setCompany] = useState('');
  const [logo, setLogo] = useState<Logo | null>(null);
  const [logoError, setLogoError] = useState('');
  const [color, setColor] = useState('#1F6F8B');
  const [topics, setTopics] = useState<string[]>(['', '', '']);
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // "Edit brand" from the results screen: /new?from=<id> pre-fills the form
  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get('from');
    if (!from) return;
    fetch('/api/sets', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const s = (d.sets ?? []).find((x: { id: string }) => x.id === from);
        if (!s) return;
        setCompany(s.company); setColor(s.color);
        setLogo(s.logo ? { url: s.logo, name: 'logo', size: 0 } : null);
        setTopics(s.posts.map((p: { topic: string }) => p.topic));
      })
      .catch(() => {});
  }, []);

  const filled = topics.map((t) => t.trim()).filter(Boolean);
  const dup = new Set(filled.map((t) => t.toLowerCase())).size !== filled.length;
  const hexOk = isHex(color);
  const canGenerate = company.trim() !== '' && hexOk && filled.length > 0 && !dup;
  const brand = hexOk ? normHex(color) : '#1F6F8B';
  const fg = textOn(brand);

  function onFile(f?: File) {
    if (!f) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(f.type)) return setLogoError('Use a PNG, JPG or SVG file.');
    if (f.size > MAX_BYTES) return setLogoError('File is over 2 MB. Choose a smaller image.');
    setLogoError('');
    const r = new FileReader();
    r.onload = () => setLogo({ url: String(r.result), name: f.name, size: f.size });
    r.readAsDataURL(f);
  }

  async function generate() {
    if (!canGenerate || submitting) return;
    setSubmitting(true); setSubmitError('');
    try {
      const id = await createSet({ company: company.trim(), color: brand, logo: logo?.url ?? null, topics: filled });
      router.push(`/sets/${id}/generating`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not create the blog set.');
      setSubmitting(false);
    }
  }

  function clearForm() {
    setCompany(''); setLogo(null); setLogoError(''); setColor('#1F6F8B'); setTopics(['', '', '']); setPage(0);
  }
  const move = (to: number) => {
    const from = dragFrom.current;
    if (from === null || from === to) return;
    const next = [...topics];
    next.splice(to, 0, next.splice(from, 1)[0]);
    dragFrom.current = to;
    setTopics(next);
  };

  const previewTopics = filled.length ? filled : ['Your first topic appears here'];
  const idx = Math.min(page, previewTopics.length - 1);
  const slugPreview = `${slugify(company || 'your-company')}/${filled.length ? slugify(previewTopics[idx]) : 'your-topic'}`;
  const input = 'h-[38px] px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-default font-body-default text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all';

  return (
    <>
      <TopBar crumbs={[{ label: 'Blog sets', href: '/' }, { label: 'New blog set' }]} />
      <main className="w-full pt-14 bg-background min-h-[calc(100vh-56px)]">
        <div className="w-full flex flex-col lg:flex-row min-h-[calc(100vh-56px)] bg-surface-container-low">
          {/* LEFT: form */}
          <div className="w-full lg:w-[40%] bg-surface-container-lowest border-r border-outline-variant flex flex-col justify-between relative shadow-sm">
            <div className="p-8 max-w-[480px] w-full mx-auto lg:mx-0 lg:ml-auto lg:mr-8 flex-1">
              <header className="mb-6">
                <h1 className="font-page-title text-page-title text-on-surface">New blog set</h1>
                <p className="font-body-default text-body-default text-on-surface-variant mt-1.5 leading-relaxed">Add your brand details and up to 10 topics. We’ll write and publish a page for each.</p>
              </header>

              <section className="mb-6">
                <div className="border-t border-outline-variant pt-5 mb-4"><h2 className="font-section-title text-[15px] leading-5 font-semibold text-on-surface">Brand</h2></div>

                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="font-label-text text-label-text text-on-surface" htmlFor="company-name">Company name</label>
                  <input id="company-name" className={input} placeholder="e.g. Harbor Dental Group" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>

                <div className="flex flex-col gap-1.5 mb-4">
                  <span className="font-label-text text-label-text text-on-surface">Company logo</span>
                  <div className="p-3.5 bg-surface-container-lowest border border-dashed border-outline-variant rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded border border-outline-variant bg-white flex items-center justify-center shrink-0 overflow-hidden">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo.url} alt="Logo preview" className="w-full h-full object-contain" />
                        ) : (
                          <span className="material-symbols-outlined text-[20px] text-outline">image</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-body-strong text-[13px] text-on-surface truncate">{logo ? logo.name : 'No logo yet'}</span>
                        <span className="font-helper-text text-helper-text text-on-surface-variant">{logo && logo.size ? `${Math.max(1, Math.round(logo.size / 1024))} KB` : 'Optional'}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => fileRef.current?.click()} className="font-label-text text-[13px] text-primary-container hover:underline px-2 py-1">
                      {logo ? 'Replace' : 'Upload'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
                  </div>
                  {logoError ? (
                    <p className="font-helper-text text-helper-text text-error mt-0.5">{logoError}</p>
                  ) : (
                    <p className="font-helper-text text-helper-text text-on-surface-variant mt-0.5">Upload logo (PNG, JPG or SVG, max 2 MB)</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-text text-label-text text-on-surface" htmlFor="brand-colour-hex">Brand colour</label>
                  <div className="flex items-center gap-2">
                    <label className="relative w-7 h-7 rounded border border-outline-variant shrink-0 cursor-pointer overflow-hidden" style={{ background: brand }} title="Pick a colour">
                      <input type="color" aria-label="Pick brand colour" value={brand.toLowerCase()} onChange={(e) => setColor(e.target.value.toUpperCase())} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                    <input id="brand-colour-hex" maxLength={7} value={color} onChange={(e) => setColor(e.target.value)} onBlur={() => hexOk && setColor(normHex(color))}
                      className="h-[34px] w-[120px] px-2.5 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-mono text-[13px] text-on-surface focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all" />
                  </div>
                  <p className="font-helper-text text-helper-text text-on-surface-variant mt-0.5">Used for the header, links and buttons on every page.</p>
                  {!hexOk && color.length > 0 && (
                    <p role="alert" className="font-helper-text text-helper-text text-error flex items-center gap-1 bg-error-container/40 border border-error/20 rounded px-2 py-1.5">
                      <span className="material-symbols-outlined text-[14px]">error</span>Enter a 6-digit hex code, like #1F6F8B.
                    </p>
                  )}
                </div>
              </section>

              <section className="mb-6">
                <div className="border-t border-outline-variant pt-5 mb-4 flex items-center justify-between">
                  <h2 className="font-section-title text-[15px] leading-5 font-semibold text-on-surface">Topics</h2>
                  <span className="font-label-text text-[12px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">{filled.length} of {MAX}</span>
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  {topics.map((t, i) => (
                    <div key={i} draggable onDragStart={() => (dragFrom.current = i)} onDragOver={(e) => { e.preventDefault(); move(i); }} onDragEnd={() => (dragFrom.current = null)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus-within:border-primary-container transition-all">
                      <span className="material-symbols-outlined text-[16px] text-outline cursor-grab select-none" aria-hidden>drag_indicator</span>
                      <input aria-label={`Topic ${i + 1}`} value={t} placeholder="Add a topic" onChange={(e) => setTopics(topics.map((x, j) => (j === i ? e.target.value : x)))}
                        className="flex-1 bg-transparent border-none p-0 text-body-default font-body-default text-on-surface placeholder:text-outline focus:outline-none focus:ring-0" />
                      <button type="button" aria-label={`Remove topic ${i + 1}`} onClick={() => setTopics(topics.length > 1 ? topics.filter((_, j) => j !== i) : [''])}
                        className="text-outline hover:text-error transition-colors p-1 flex items-center justify-center rounded">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
                {dup && <p role="alert" className="font-helper-text text-helper-text text-error mb-3">Each topic must be different.</p>}
                {submitError && <p role="alert" className="font-helper-text text-helper-text text-error mb-3">{submitError}</p>}
                <button type="button" disabled={topics.length >= MAX} onClick={() => setTopics([...topics, ''])}
                  className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-primary-container rounded-lg font-label-text text-[13px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest">
                  {topics.length < MAX && <span className="material-symbols-outlined text-[16px]">add</span>}
                  <span>{topics.length >= MAX ? 'Topic limit reached' : 'Add topic'}</span>
                </button>
              </section>
            </div>

            <div className="sticky bottom-0 border-t border-outline-variant bg-surface-container-lowest px-8 py-4 flex items-center justify-between z-10">
              <button type="button" onClick={clearForm} className="font-label-text text-helper-text text-on-surface-variant hover:text-on-surface transition-colors">Clear form</button>
              <button type="button" disabled={!canGenerate || submitting} onClick={generate}
                className="h-10 px-5 bg-primary-container text-white font-body-strong text-body-default rounded-lg hover:bg-primary transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <span>{submitting ? 'Creating…' : filled.length ? `Generate ${filled.length} page${filled.length === 1 ? '' : 's'}` : 'Generate pages'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* RIGHT: live preview */}
          <div className="w-full lg:w-[60%] bg-[#EDF1F5] p-6 lg:p-8 flex flex-col items-center justify-start">
            <div className="w-full max-w-[720px] mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: brand }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: brand }} />
                </span>
                <span className="font-helper-text text-helper-text text-on-surface-variant font-medium">Preview. Updates as you type.</span>
              </div>
              <div className="flex items-center gap-2 text-helper-text font-helper-text text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">devices</span><span>Desktop (1280px standard)</span>
              </div>
            </div>

            <div className="w-full max-w-[720px] bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(28,36,48,0.08)]">
              <div className="h-10 bg-surface-container-low border-b border-outline-variant px-4 flex items-center justify-between select-none">
                <div className="flex items-center gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="w-2.5 h-2.5 rounded-full bg-outline-variant" />)}</div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded px-3 py-1 flex items-center gap-2 max-w-[360px] w-full mx-2">
                  <span className="material-symbols-outlined text-[13px] text-outline">lock</span>
                  <span className="font-mono text-[11px] text-on-surface-variant truncate">postwright.app/{slugPreview}</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-outline">open_in_new</span>
              </div>

              <header className="px-6 py-3.5 flex items-center justify-between" style={{ background: brand, color: fg }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo.url} alt="" className="h-6 w-auto max-w-[96px] object-contain shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-sm flex items-center justify-center text-[11px] font-body-strong shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>{(company || 'Y').charAt(0).toUpperCase()}</div>
                  )}
                  <span className="font-body-strong text-[15px] tracking-tight leading-none truncate">{company || 'Your company'}</span>
                </div>
                <nav className="hidden sm:flex items-center gap-4 text-[12px] font-body-default opacity-90">
                  <span>Services</span><span>About</span><span>Contact</span>
                </nav>
              </header>

              <article className="px-8 py-10 max-w-[580px] mx-auto">
                <h1 className="font-preview-headline text-preview-headline text-on-surface leading-[1.25] mb-3">{previewTopics[idx]}</h1>
                <div className="flex items-center gap-2 font-helper-text text-helper-text text-on-surface-variant pb-4 mb-6 border-b border-outline-variant">
                  <span className="font-medium text-on-surface">{company || 'Your company'}</span><span>·</span><span>6 min read</span>
                </div>
                <div className="space-y-3" aria-hidden>
                  {[100, 96, 92, 100, 64].map((w, i) => <div key={i} className="h-2.5 rounded bg-surface-container-high" style={{ width: `${w}%` }} />)}
                  <div className="h-5" />
                  {[98, 90, 70].map((w, i) => <div key={i} className="h-2.5 rounded bg-surface-container-high" style={{ width: `${w}%` }} />)}
                </div>
                <p className="font-preview-body text-preview-body mt-6">
                  <span className="underline font-medium" style={{ color: brand }}>Links use your brand colour</span>
                </p>
              </article>
            </div>

            <div className="w-full max-w-[720px] mt-4 flex items-center justify-between text-helper-text font-helper-text text-on-surface-variant">
              <div className="flex items-center gap-2"><span>Viewing page:</span><span className="font-body-strong text-on-surface">{idx + 1} of {previewTopics.length}</span></div>
              <div className="flex items-center gap-1">
                <button aria-label="Previous page" disabled={idx === 0} onClick={() => setPage(idx - 1)} className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded hover:bg-surface-container text-on-surface disabled:opacity-40"><span className="material-symbols-outlined text-[14px]">arrow_back</span></button>
                <button aria-label="Next page" disabled={idx >= previewTopics.length - 1} onClick={() => setPage(idx + 1)} className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded hover:bg-surface-container text-on-surface disabled:opacity-40"><span className="material-symbols-outlined text-[14px]">arrow_forward</span></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

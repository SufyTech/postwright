export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'untitled';
export const uid = () => Math.random().toString(36).slice(2, 10);
export const isHex = (v: string) => /^#?[0-9a-fA-F]{6}$/.test(v.trim());
export const normHex = (v: string) => '#' + v.trim().replace('#', '').toUpperCase();
export const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
export const readMinutes = (words: number) => Math.max(1, Math.round(words / 200));
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** White or dark text, whichever has better contrast on the brand colour. */
export function textOn(hex: string) {
  if (!isHex(hex)) return '#FFFFFF';
  const h = normHex(hex).slice(1);
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.215 ? '#1C2430' : '#FFFFFF';
}

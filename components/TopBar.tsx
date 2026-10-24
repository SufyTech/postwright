import Link from "next/link";

export default function TopBar({
  crumbs,
}: {
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
      <div className="h-14 w-full px-space-lg flex items-center">
        <Link href="/" className="flex items-center gap-space-md no-underline">
          <div className="w-6 h-6 rounded bg-primary-container text-white flex items-center justify-center font-body-strong text-[14px] leading-none">
            P
          </div>
          <span className="font-section-title text-section-title text-on-surface tracking-tight">
            Postwright
          </span>
        </Link>
        {crumbs && (
          <nav className="flex items-center gap-space-xs ml-space-md pl-space-md border-l border-outline-variant text-helper-text font-helper-text text-on-surface-variant">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-space-xs">
                {i > 0 && (
                  <span className="material-symbols-outlined text-[14px] text-outline">
                    chevron_right
                  </span>
                )}
                {c.href ? (
                  <Link
                    href={c.href}
                    className="hover:text-on-surface transition-colors"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-on-surface font-body-strong">
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

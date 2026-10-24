import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { db, SetRow, PostRow } from "@/lib/server/db";
import { readMinutes, textOn } from "@/lib/util";

export const dynamic = "force-dynamic";

type Params = { params: { company: string; post: string } };

async function load({ company, post }: Params["params"]) {
  const sb = db();
  const s = await sb
    .from("blog_sets")
    .select("*")
    .eq("slug", company)
    .maybeSingle();
  if (s.error) throw s.error;
  console.log("LOAD set:", company, "->", s.data ? "found" : "NOT FOUND");
  if (!s.data) return null;
  const set = s.data as SetRow;
  const r = await sb
    .from("posts")
    .select("*")
    .eq("set_id", set.id)
    .eq("status", "done")
    .order("position");
  if (r.error) throw r.error;
  const posts = (r.data ?? []) as PostRow[];
  console.log(
    "LOAD posts:",
    post,
    "->",
    posts.map((x) => `${x.slug}:${x.status}`).join(" | ") || "NONE",
  );
  const p = posts.find((x) => x.slug === post);
  return p ? { set, p, posts } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const d = await load(params).catch((e) => {
    console.error("PAGE ERROR:", e);
    return null;
  });
  return d
    ? { title: `${d.p.title} | ${d.set.company}` }
    : { title: "Page not found" };
}

/** The public blog page. No Postwright interface here: it belongs to the company. */
export default async function BlogPage({ params }: Params) {
  const d = await load(params).catch((e) => {
    console.error("PAGE ERROR:", e);
    return null;
  });
  if (!d)
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[420px]">
          <h1 className="text-[24px] font-semibold text-[#1C2430]">
            Page not found
          </h1>
          <p className="text-[#5A6676] mt-2">
            This page does not exist, or it is still being written.
          </p>
        </div>
      </main>
    );
  const set = { ...d.set, logo: d.set.logo_url };
  const p = d.p;
  const others = d.posts.filter((x) => x.id !== p.id);

  const fg = textOn(set.color);

  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{ ["--brand" as string]: set.color }}
    >
      <header
        className="w-full h-[72px] px-8 flex items-center justify-between"
        style={{ background: "var(--brand)", color: fg }}
      >
        <div className="max-w-[1280px] w-full mx-auto flex items-center justify-between">
          <Link
            href={`/c/${set.slug}/${d.posts[0].slug}`}
            className="flex items-center gap-3 no-underline"
            style={{ color: fg }}
          >
            {set.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={set.logo}
                alt=""
                className="h-8 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <div
                className="w-7 h-7 rounded flex items-center justify-center font-semibold text-sm border"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                {set.company.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-[17px] tracking-tight">
              {set.company}
            </span>
          </Link>
          <nav
            className="flex items-center gap-8 text-[15px]"
            style={{ opacity: 0.9 }}
          >
            <span>Services</span>
            <span>About</span>
            <span>Contact</span>
          </nav>
        </div>
      </header>

      <main className="flex-grow w-full">
        <div className="max-w-[680px] mx-auto px-6 pt-16 pb-20">
          <h1 className="editorial-content text-[40px] font-semibold text-[#1C2430] leading-[1.2] tracking-tight mb-3 text-left">
            {p.title}
          </h1>
          <div className="text-[14px] text-[#5A6676] mb-12">
            {set.company}, {readMinutes(p.words)} min read
          </div>
          <article className="editorial-content text-[18px] text-[#1C2430] leading-[1.7] space-y-7 [&_a]:underline [&_a]:text-[color:var(--brand)]">
            <Markdown text={p.body} />
          </article>

          {others.length > 0 && (
            <section className="mt-16">
              <h2 className="text-[18px] font-semibold text-[#1C2430] mb-2">
                More from {set.company}
              </h2>
              <ul>
                {others.map((o) => (
                  <li
                    key={o.id}
                    className="border-t border-[#D5DBE3] last:border-b"
                  >
                    <Link
                      href={`/c/${set.slug}/${o.slug}`}
                      className="block py-3 text-[16px] underline decoration-from-font underline-offset-2"
                      style={{ color: "var(--brand)" }}
                    >
                      {o.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>

      <footer
        className="w-full px-8 py-6 text-[14px] text-[#1C2430]"
        style={{ background: "color-mix(in srgb, var(--brand) 10%, white)" }}
      >
        <div className="max-w-[1280px] mx-auto">
          {set.company} · {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

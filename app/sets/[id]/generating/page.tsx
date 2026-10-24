"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import { useSets } from "@/lib/store";
import { generatePost, generateSet } from "@/lib/generate";

export default function Generating() {
  const { id } = useParams<{ id: string }>();
  const { sets, error, reload } = useSets();
  const set = sets?.find((s) => s.id === id);
  const started = useRef(false);

  // Start writing once, when the blog set first loads
  useEffect(() => {
    if (set && !started.current) {
      started.current = true;
      generateSet(set.posts);
    }
  }, [set]);

  // Refresh progress every 2 seconds while anything is still being written
  const busy =
    !!set &&
    set.posts.some((p) => p.status === "waiting" || p.status === "writing");
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(reload, 2000);
    return () => clearInterval(t);
  }, [busy, reload]);

  if (sets && !set)
    return (
      <>
        <TopBar />
        <main className="pt-14 px-8 py-16">
          <p className="text-on-surface-variant">
            This blog set was not found.{" "}
            <Link href="/" className="text-primary-container hover:underline">
              Back to blog sets
            </Link>
          </p>
        </main>
      </>
    );

  const posts = set?.posts ?? [];
  if (error && !set)
    return (
      <>
        <TopBar />
        <main className="pt-14 px-8 py-16">
          <p role="alert" className="text-error">
            {error}
          </p>
        </main>
      </>
    );
  const done = posts.filter((p) => p.status === "done").length;
  const failed = posts.filter((p) => p.status === "failed").length;
  const finished =
    posts.length > 0 &&
    posts.every((p) => p.status === "done" || p.status === "failed");
  const pct = posts.length ? Math.round((done / posts.length) * 100) : 0;

  return (
    <>
      <TopBar
        crumbs={[
          { label: "Blog sets", href: "/" },
          { label: "Writing your pages" },
        ]}
      />
      <main className="w-full pt-14 bg-background min-h-[calc(100vh-56px)]">
        <div className="w-full flex justify-center px-gutter pt-12 pb-16">
          <div className="w-full max-w-[640px] flex flex-col text-left">
            <h1 className="font-page-title text-page-title text-on-surface">
              {finished ? "Your pages are ready" : "Writing your pages"}
            </h1>
            <p className="font-body-default text-body-default text-on-surface-variant mt-space-xs">
              {done} of {posts.length} done.
              {finished
                ? failed
                  ? ` ${failed} failed. Try those again below.`
                  : ""
                : " You can leave this tab open while we finish."}
            </p>
            <div
              className="w-full h-[6px] bg-outline-variant rounded-xl overflow-hidden my-space-lg"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-primary-container rounded-xl transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="w-full bg-surface-container-lowest flex flex-col rounded-lg border border-outline-variant overflow-hidden">
              {posts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 border-b border-outline-variant last:border-b-0"
                >
                  <span
                    className={`font-body-default text-body-default ${p.status === "waiting" ? "text-on-surface-variant" : "text-on-surface"}`}
                  >
                    {p.topic}
                  </span>
                  {p.status === "done" && (
                    <div className="flex items-center gap-space-md">
                      <span className="flex items-center gap-1 font-body-default text-body-default text-primary-container">
                        <span className="material-symbols-outlined text-[16px]">
                          check
                        </span>
                        Done
                      </span>
                      <Link
                        href={`/c/${set!.slug}/${p.slug}`}
                        target="_blank"
                        className="font-label-text text-label-text text-primary-container hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  )}
                  {p.status === "writing" && (
                    <div className="flex items-center gap-2 font-body-default text-body-default text-primary-container">
                      <svg
                        className="animate-spin h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Writing
                    </div>
                  )}
                  {p.status === "waiting" && (
                    <span className="font-body-default text-body-default text-outline">
                      Waiting
                    </span>
                  )}
                  {p.status === "failed" && (
                    <div className="flex items-center gap-space-sm">
                      <span className="flex items-center gap-1 font-body-default text-body-default text-error">
                        <span className="material-symbols-outlined text-[16px]">
                          error
                        </span>
                        Failed.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          generatePost(p.id).then(reload);
                          setTimeout(reload, 500);
                        }}
                        className="font-label-text text-label-text text-primary-container hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 text-left">
              {finished ? (
                <Link
                  href={`/sets/${id}`}
                  className="font-label-text text-label-text text-primary-container hover:underline inline-flex items-center"
                >
                  View results
                </Link>
              ) : (
                <Link
                  href="/"
                  className="font-label-text text-label-text text-outline hover:text-on-surface transition-colors inline-flex items-center"
                >
                  Cancel and go back
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

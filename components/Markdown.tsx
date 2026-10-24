import { Fragment } from "react";

const inline = (s: string) =>
  s
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );

const isBullet = (l: string) => /^\s*[-*•]\s+/.test(l);
const stripBullet = (l: string) => l.replace(/^\s*[-*•]\s+/, "");
const isHeading = (l: string) => /^#{2,3}\s+/.test(l);

/** Tiny renderer for: "## heading", "- list item", paragraphs, **bold**.
 *  Works line by line, so a list is still a list when the model forgets the blank line before it. */
export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const out: JSX.Element[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) out.push(<p key={out.length}>{inline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (list.length)
      out.push(
        <ul key={out.length} className="list-disc pl-6 space-y-3 my-4">
          {list.map((li, j) => (
            <li key={j}>{inline(li)}</li>
          ))}
        </ul>,
      );
    list = [];
  };

  for (const raw of lines) {
    const l = raw.trim();
    if (!l) {
      flushPara();
      flushList();
      continue;
    }
    if (isHeading(l)) {
      flushPara();
      flushList();
      out.push(
        <h2
          key={out.length}
          className="editorial-content text-[26px] font-semibold text-[#1C2430] leading-[1.3] pt-4 mb-2"
        >
          {l.replace(/^#{2,3}\s+/, "")}
        </h2>,
      );
    } else if (isBullet(l)) {
      flushPara();
      list.push(stripBullet(l));
    } else {
      flushList();
      para.push(l);
    }
  }
  flushPara();
  flushList();
  return <>{out}</>;
}

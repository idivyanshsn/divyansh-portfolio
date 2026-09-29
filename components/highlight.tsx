import type { ReactNode } from "react";

const URL_RE = /(https?:\/\/[^\s"',)]+|\/resume\.pdf)/;

/** Turns URLs (and the resume path) inside text into IDE-styled links that open in a new tab. */
export function linkify(text: string): ReactNode[] {
  return text.split(URL_RE).map((part, i) =>
    i % 2 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        className="underline decoration-dotted underline-offset-2 hover:text-sky-400 hover:decoration-solid focus-visible:outline focus-visible:outline-1 focus-visible:outline-sky-500">{part}</a>
    ) : part
  );
}

// Groups: 1 comment · 2 preprocessor · 3 JSON key · 4 string · 5 number · 6 keyword · 7 type · 8 property · 9 function
const TOKEN =
  /(\/\/.*$)|(#\w+)|("(?:[^"\\]|\\.)*"(?=\s*:))|("(?:[^"\\]|\\.)*")|(\b\d+\b)|(\b(?:int|void|return|const|char|auto|struct|class|using|namespace|for|if|else|true|false|null|bool|once)\b)|(\b(?:std|string|vector|Developer|Project)\b)|(\.\w+)|(\b[A-Za-z_]\w*(?=\())/g;
const CLS = ["", "t-c", "t-p", "t-key", "t-s", "t-n", "t-k", "t-t", "t-prop", "t-f"];

/** One syntax-highlighted line of C++ / JSON. */
export function CodeLine({ text }: { text: string }) {
  const inc = text.match(/^(\s*)(#include)(\s+)(<[^>]+>)\s*$/);
  if (inc) return <><span className="t-p">{inc[1]}{inc[2]}</span>{inc[3]}<span className="t-s">{inc[4]}</span></>;

  const out: ReactNode[] = [];
  let last = 0;
  for (const m of Array.from(text.matchAll(TOKEN))) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    const g = m.findIndex((v, k) => k > 0 && v !== undefined);
    out.push(<span key={i} className={CLS[g]}>{g === 1 || g === 4 ? linkify(m[0]) : m[0]}</span>);
    last = i + m[0].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

"use client";
import { useMemo } from "react";

/** Decorative code minimap: a scaled-down overview of the active file, not a real renderer. */
export default function Minimap({ code, activeLine, onJump }: { code: string; activeLine: number; onJump: (i: number) => void }) {
  const rows = useMemo(() => code.split("\n"), [code]);
  return (
    <div className="hidden w-16 shrink-0 select-none overflow-hidden border-l border-white/5 bg-[#1e1e1e] py-2 lg:block" aria-hidden>
      {rows.map((r, i) => {
        const trimmed = r.trim();
        const w = Math.min(Math.round((trimmed.length / 60) * 100), 92);
        const tone = trimmed.startsWith("//") ? "bg-emerald-800/50" : trimmed.startsWith("#") ? "bg-fuchsia-800/40" : "bg-neutral-600/40";
        return (
          <button key={i} onClick={() => onJump(i)} title={`Line ${i + 1}`}
            className={`block h-[3px] w-full px-2 py-[1.5px] ${activeLine === i ? "bg-sky-500/10" : ""}`}>
            {w > 0 && <span className={`block h-full rounded-sm ${tone}`} style={{ width: `${w}%` }} />}
          </button>
        );
      })}
    </div>
  );
}

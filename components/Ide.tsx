"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Files, Search, GitBranch, Play, X, Menu, TerminalSquare, Trash2, ChevronRight, Circle } from "lucide-react";
import { files, links, profile, achievements, type PFile } from "@/data/portfolio";
import { CodeLine, linkify } from "./highlight";
import FileIcon from "./FileIcon";
import Minimap from "./Minimap";

type Out = { text: string; kind: "cmd" | "out" | "err" };
const MIN_PCT = 25;
const MAX_PCT = 78;

export default function Ide() {
  const [tabs, setTabs] = useState<string[]>([files[0].name]);
  const [active, setActive] = useState(files[0].name);
  const [line, setLine] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [termVisible, setTermVisible] = useState(true);
  const [split, setSplit] = useState(56); // editor's share of the editor+terminal region, in %
  const [dragging, setDragging] = useState(false);
  const [isRow, setIsRow] = useState(true); // row (side-by-side) on desktop, column on mobile
  const [lines, setLines] = useState<Out[]>([{ text: "Welcome. Type 'help' or press Run.", kind: "out" }]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const termEnd = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const file = files.find((f) => f.name === active) ?? files[0];
  const push = (o: Out) => setLines((l) => [...l, o]);

  const open = useCallback((name: string) => {
    setTabs((t) => (t.includes(name) ? t : [...t, name]));
    setActive(name);
    setDrawer(false);
  }, []);

  const close = (name: string) => {
    const next = tabs.filter((t) => t !== name);
    setTabs(next);
    if (active === name && next.length) setActive(next[next.length - 1]);
  };

  const run = useCallback((f: PFile = file) => {
    timers.current.forEach(clearTimeout);
    setTermVisible(true);
    setRunning(true);
    push({ text: `g++ -std=c++17 ${f.name} -o portfolio && ./portfolio`, kind: "cmd" });
    f.output.forEach((text, i) =>
      timers.current.push(setTimeout(() => {
        push({ text, kind: "out" });
        if (i === f.output.length - 1) setRunning(false);
      }, 300 + i * 200))
    );
  }, [file]);

  const clearTerm = () => setLines([]);

  useEffect(() => { termEnd.current?.scrollIntoView({ block: "nearest" }); }, [lines]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { setLine(0); document.getElementById(`tab-${active}`)?.scrollIntoView({ inline: "nearest", block: "nearest" }); }, [active]);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsRow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [run]);

  // Draggable divider between the editor and the terminal (vertical bar on desktop, horizontal on mobile).
  const startDrag = (e: React.PointerEvent) => { e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); };
  const onDrag = (e: React.PointerEvent) => {
    if (!dragging || !workspaceRef.current) return;
    const r = workspaceRef.current.getBoundingClientRect();
    const pct = isRow ? ((e.clientX - r.left) / r.width) * 100 : ((e.clientY - r.top) / r.height) * 100;
    setSplit(Math.min(Math.max(pct, MIN_PCT), MAX_PCT));
  };
  const stopDrag = () => setDragging(false);

  const jump = (i: number) => {
    setLine(i);
    document.getElementById(`code-line-${i}`)?.scrollIntoView({ block: "center" });
  };

  // Aliases map to the same portfolio commands below.
  const ALIAS: Record<string, string> = { edu: "education", proj: "projects", ach: "achievements" };

  const HELP_LINES = [
    "General",
    "  help                  list all commands",
    "  ls                    list files",
    "  open <file>           open a file in the editor",
    "  run [file]            compile and run a file",
    "  clear                 clear terminal output",
    "",
    "Portfolio",
    "  about                 quick introduction",
    "  skills                languages & technologies",
    "  projects (proj)       project details",
    "  education (edu)       degree, university & achievements",
    "  cgpa                  academic performance summary",
    "  achievements (ach)    key achievements",
    "  contact               ways to reach me",
    "",
    "Links (open in a new tab)",
    "  github, linkedin, leetcode, resume",
  ];

  const outputOf = (file: string) => files.find((f) => f.name === file)!.output;

  const command = (raw: string) => {
    const [first, arg] = raw.trim().split(/\s+/);
    push({ text: raw, kind: "cmd" });
    if (!first) return;
    const c = ALIAS[first] ?? first;

    if (c === "help") HELP_LINES.forEach((t) => push({ text: t, kind: "out" }));
    else if (c === "ls") push({ text: files.map((f) => f.name).join("  "), kind: "out" });
    else if (c === "clear") clearTerm();
    else if (c === "about") [
      `${profile.name} — ${profile.role}`,
      `${profile.degree}, ${profile.university} (Class of ${profile.graduation})`,
      `CGPA: ${profile.cgpa}`,
      "Interested in Data Structures & Algorithms, Full Stack Development,",
      "Backend Development and Machine Learning.",
      "Type 'skills', 'projects', 'education' or 'contact' for more.",
    ].forEach((t) => push({ text: t, kind: "out" }));
    else if (c === "skills") outputOf("skills.h").forEach((t) => push({ text: t, kind: "out" }));
    else if (c === "projects") outputOf("projects.cpp").forEach((t) => push({ text: t, kind: "out" }));
    else if (c === "education") outputOf("education.json").forEach((t) => push({ text: t, kind: "out" }));
    else if (c === "cgpa") [
      "Academic Performance",
      "────────────────────────────",
      `CGPA       : ${profile.cgpa.replace("/", " / ")}`,
      "S Grades   : 12+",
      `University : ${profile.university}`,
      `Batch      : ${profile.graduation}`,
    ].forEach((t) => push({ text: t, kind: "out" }));
    else if (c === "achievements") achievements.map((a) => `- ${a}`).forEach((t) => push({ text: t, kind: "out" }));
    else if (c === "contact") outputOf("contact.cpp").forEach((t) => push({ text: t, kind: "out" }));
    else if (c in links) {
      const url = links[c as keyof typeof links];
      if (!url) push({ text: `${c}: link not added yet (set it in data/portfolio.ts).`, kind: "err" });
      else { push({ text: `Opening ${url}`, kind: "out" }); window.open(url, "_blank", "noopener,noreferrer"); }
    }
    else if (c === "open" || c === "run") {
      const f = files.find((x) => x.name === (arg ?? active));
      if (!f) return push({ text: `error: no such file '${arg}'. Try 'ls'.`, kind: "err" });
      open(f.name);
      if (c === "run") run(f);
    } else push({ text: "Command not found. Type 'help' to see available commands.", kind: "err" });
  };

  const Explorer = (
    <div className="flex h-full flex-col py-2 text-[13px]">
      <div className="px-5 pb-2 pt-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">Explorer</div>
      <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-300">Portfolio</div>
      <ul>
        {files.map((f) => (
          <li key={f.name}>
            <button onClick={() => open(f.name)} aria-current={active === f.name}
              className={`flex w-full items-center gap-2 border-l-2 py-[5px] pl-6 pr-3 text-left transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-sky-500 ${active === f.name ? "border-sky-500 bg-[#37373d] text-white" : "border-transparent text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200"}`}>
              <FileIcon icon={f.icon} /><span className="truncate">{f.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const iconBtn = "rounded p-1 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-sky-500";
  const editorStyle = termVisible ? (isRow ? { width: `${split}%` } : { height: `${split}%` }) : (isRow ? { width: "100%" } : { height: "100%" });
  const termStyle = isRow ? { width: `${100 - split}%` } : { height: `${100 - split}%` };

  return (
    <div className="flex h-[100dvh] flex-col bg-[#1e1e1e] text-sm">
      {/* Title bar */}
      <header className="flex h-9 shrink-0 items-center gap-3 border-b border-black/30 bg-[#2b2b2b] px-3 text-xs text-neutral-300">
        <button className={`${iconBtn} md:hidden`} aria-label="Toggle explorer" onClick={() => setDrawer((d) => !d)}><Menu size={18} /></button>
        <span className="hidden gap-1.5 md:flex" aria-hidden><i className="h-3 w-3 rounded-full bg-[#ff5f57]" /><i className="h-3 w-3 rounded-full bg-[#febc2e]" /><i className="h-3 w-3 rounded-full bg-[#28c840]" /></span>
        <span className="mx-auto truncate">{active} — {profile.name}</span>
      </header>

      {/* Compact IDE toolbar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-black/20 bg-[#242424] px-3 text-xs">
        <button onClick={() => run()} disabled={running} title="Run (Ctrl+Enter)"
          className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-[0.97] active:bg-emerald-700 disabled:cursor-default disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">
          <Play size={12} fill="currentColor" />Run
        </button>
        <button onClick={clearTerm} title="Clear terminal output"
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white active:scale-[0.97] focus-visible:outline focus-visible:outline-1 focus-visible:outline-sky-500">
          <Trash2 size={12} />Clear
        </button>
        <button onClick={() => setTermVisible((v) => !v)} title="Toggle terminal panel"
          className="hidden items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 font-medium text-neutral-300 transition-colors hover:bg-white/10 hover:text-white sm:flex">
          <TerminalSquare size={12} />Terminal
        </button>
        <span className="ml-auto flex items-center gap-1.5 font-medium text-neutral-400">
          <Circle size={8} className={running ? "animate-pulse fill-amber-400 text-amber-400" : "fill-emerald-500 text-emerald-500"} />
          {running ? "Running" : "Idle"}
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Activity bar */}
        <nav className="hidden w-11 shrink-0 flex-col items-center gap-1 bg-[#333333] py-2 text-neutral-500 md:flex">
          <span className="relative flex h-11 w-11 items-center justify-center text-white"><span className="absolute left-0 h-6 w-0.5 bg-white" /><Files size={20} /></span>
          <span className="flex h-11 w-11 items-center justify-center"><Search size={20} /></span>
          <span className="flex h-11 w-11 items-center justify-center"><GitBranch size={20} /></span>
          <button className={`mt-auto flex h-11 w-11 items-center justify-center transition-colors hover:text-white ${termVisible ? "text-white" : ""}`} aria-label="Toggle terminal" onClick={() => setTermVisible((t) => !t)}><TerminalSquare size={20} /></button>
        </nav>

        {/* Explorer */}
        <aside className="hidden w-52 shrink-0 border-r border-black/20 bg-[#252526] lg:block">{Explorer}</aside>
        <AnimatePresence>
          {drawer && (
            <>
              <motion.div key="scrim" className="absolute inset-0 z-20 bg-black/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
              <motion.aside key="drawer" className="absolute inset-y-0 left-0 z-30 w-64 bg-[#252526] shadow-xl lg:hidden" initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "tween", duration: 0.2 }}>{Explorer}</motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Editor + Terminal workspace: side-by-side on desktop, stacked on mobile */}
        <div ref={workspaceRef} onPointerMove={onDrag} onPointerUp={stopDrag} onPointerCancel={stopDrag}
          className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">

          {/* Editor pane */}
          <section style={editorStyle} className="flex min-h-0 min-w-0 flex-col">
            <div role="tablist" className="flex h-9 shrink-0 overflow-x-auto bg-[#252526]">
              {tabs.map((t) => {
                const f = files.find((x) => x.name === t)!;
                const on = active === t;
                return (
                  <div key={t} id={`tab-${t}`} role="tab" tabIndex={0} aria-selected={on}
                    onClick={() => setActive(t)}
                    onAuxClick={(e) => { if (e.button === 1) { e.preventDefault(); close(t); } }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(t); } }}
                    className={`group relative flex shrink-0 cursor-pointer items-center gap-2 border-r border-[#1e1e1e] pl-3 pr-1.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-sky-500 ${on ? "bg-[#1e1e1e] text-white" : "bg-[#2d2d2d] text-neutral-400 hover:bg-[#2a2a2b] hover:text-neutral-200"}`}>
                    {on && <motion.span layoutId="tab-line" className="absolute inset-x-0 top-0 h-[2px] bg-sky-500" />}
                    <FileIcon icon={f.icon} />{t}
                    <button aria-label={`Close ${t}`} onClick={(e) => { e.stopPropagation(); close(t); }}
                      className={`rounded p-0.5 text-neutral-400 transition hover:bg-white/10 hover:text-white ${on ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}><X size={14} /></button>
                  </div>
                );
              })}
            </div>

            {tabs.length > 0 && (
              <div className="hidden h-6 shrink-0 items-center gap-1 border-b border-white/5 px-4 text-xs text-neutral-500 sm:flex">
                portfolio <ChevronRight size={12} /> <FileIcon icon={file.icon} /> <span className="text-neutral-300">{file.name}</span>
              </div>
            )}

            <div className="flex min-h-0 flex-1">
              <div className="min-h-0 flex-1 overflow-auto">
                {tabs.length === 0 ? (
                  <p className="p-6 text-neutral-500">No file open. Pick one from the explorer.</p>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.pre key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                      className="w-max min-w-full py-2 pb-10 font-mono text-[12.5px] leading-[22px] md:text-[13px]">
                      {file.code.split("\n").map((l, i) => (
                        <div key={i} id={`code-line-${i}`} onClick={() => setLine(i)}
                          className={`flex cursor-text ${line === i ? "bg-[#282828]" : "bg-[#1e1e1e] hover:bg-[#222222]"}`}>
                          <span className={`sticky left-0 w-12 shrink-0 select-none bg-inherit pr-3 text-right text-xs ${line === i ? "text-neutral-300" : "text-neutral-600"}`}>{i + 1}</span>
                          <code className="relative whitespace-pre pr-8 text-[#d4d4d4]">
                            {line === i && <span className="absolute -left-[1px] top-0 h-full w-[1.5px] animate-pulse bg-sky-400" aria-hidden />}
                            <CodeLine text={l} />
                          </code>
                        </div>
                      ))}
                    </motion.pre>
                  </AnimatePresence>
                )}
              </div>
              {tabs.length > 0 && <Minimap code={file.code} activeLine={line} onJump={jump} />}
            </div>
          </section>

          {/* Divider */}
          {termVisible && (
            <div role="separator" aria-orientation={isRow ? "vertical" : "horizontal"} aria-label="Resize terminal" onPointerDown={startDrag}
              className={`shrink-0 touch-none bg-black/20 transition-colors hover:bg-sky-500/70 ${dragging ? "bg-sky-500/70" : ""} ${isRow ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"}`} />
          )}

          {/* Terminal pane */}
          {termVisible && (
            <section aria-label="Terminal" style={termStyle} className="flex min-h-0 min-w-0 flex-col border-black/20 bg-[#1e1e1e] md:border-l">
              <div className="flex h-8 shrink-0 items-center gap-1 border-b border-white/5 px-3 text-[11px]">
                <span className="border-b border-sky-500 py-1.5 font-medium uppercase tracking-wide text-neutral-100">Terminal</span>
                <span className="ml-auto flex items-center gap-0.5">
                  <button className={iconBtn} title="Clear terminal" aria-label="Clear terminal" onClick={clearTerm}><Trash2 size={13} /></button>
                  <button className={iconBtn} title="Close terminal" aria-label="Close terminal" onClick={() => setTermVisible(false)}><X size={14} /></button>
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-auto px-3 py-2 font-mono text-[12.5px] leading-5" onClick={() => inputRef.current?.focus()}>
                {lines.map((l, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className={`whitespace-pre-wrap break-words ${l.kind === "cmd" ? "text-emerald-400" : l.kind === "err" ? "text-red-400" : "text-neutral-300"}`}>
                    {l.kind === "cmd" && <span className="text-sky-400">~/portfolio $ </span>}{l.kind === "out" ? linkify(l.text) : l.text}
                  </motion.div>
                ))}
                <form className="flex" onSubmit={(e) => { e.preventDefault(); command(input); setInput(""); }}>
                  <span className="text-sky-400">~/portfolio $&nbsp;</span>
                  <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Terminal input"
                    className="min-w-0 flex-1 bg-transparent text-emerald-400 caret-white outline-none" />
                </form>
                <div ref={termEnd} />
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Status bar */}
      <footer className="flex h-6 shrink-0 items-center gap-4 bg-[#007acc] px-3 text-[11px] text-white">
        <span className="flex items-center gap-1"><GitBranch size={12} />main</span>
        <span className="ml-auto hidden sm:inline">Ln {line + 1}, Col 1</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span>{file.icon === "json" ? "JSON" : "C++"}</span>
        <span className="hidden md:inline">{running ? "Running…" : "Ctrl+Enter to run"}</span>
      </footer>
    </div>
  );
}

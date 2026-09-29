import { Braces } from "lucide-react";
import type { PFile } from "@/data/portfolio";

export default function FileIcon({ icon }: { icon: PFile["icon"] }) {
  if (icon === "json") return <Braces size={14} className="shrink-0 text-amber-400" aria-hidden />;
  return (
    <span aria-hidden className={`w-4 shrink-0 text-center font-sans text-[8px] font-bold leading-none tracking-tighter ${icon === "h" ? "text-fuchsia-400" : "text-sky-400"}`}>
      {icon === "h" ? "H" : "C++"}
    </span>
  );
}

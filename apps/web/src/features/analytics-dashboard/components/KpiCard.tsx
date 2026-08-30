import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  isLive?: boolean;
}

export function KpiCard({ title, value, icon, isLive }: KpiCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-linear-to-b from-zinc-900/80 to-zinc-950/80 px-4 py-3 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-zinc-700">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {isLive && (
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {title}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <p className="font-montserrat text-2xl font-extrabold text-white tracking-tight">
            {value}
          </p>
          {icon && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300">
              {icon}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}


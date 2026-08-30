import type { TopPathItem } from "@/features/analytics-dashboard/types";

interface TopPathsBarChartProps {
  items: TopPathItem[];
}

export function TopPathsBarChart({ items }: TopPathsBarChartProps) {
  if (!items || items.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-zinc-500">
        No hay páginas registradas aún.
      </div>
    );
  }

  const maxViews = Math.max(1, ...items.map((i) => i.views));
  const totalViews = items.reduce((acc, i) => acc + i.views, 0);

  return (
    <div className="space-y-2.5">
      {items.slice(0, 7).map((item, index) => {
        const percentage = Math.round((item.views / maxViews) * 100);
        const shareOfTotal = totalViews > 0 ? Math.round((item.views / totalViews) * 100) : 0;

        return (
          <div
            key={`${item.path}-${index}`}
            className="group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 transition-all duration-200 hover:border-cyan-500/40 hover:bg-zinc-900/60"
          >
            {/* Background progress bar */}
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-cyan-500/10 to-indigo-500/5 transition-all duration-500 pointer-events-none"
              style={{ width: `${percentage}%` }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex items-center justify-between gap-3">
              {/* Path */}
              <span
                className="truncate font-mono text-xs font-medium text-zinc-200 group-hover:text-white min-w-0"
                title={item.path}
              >
                {item.path}
              </span>

              {/* Views and percentage */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-zinc-500">
                  {shareOfTotal}%
                </span>
                <span className="inline-flex items-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300">
                  {item.views} {item.views === 1 ? "vista" : "vistas"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

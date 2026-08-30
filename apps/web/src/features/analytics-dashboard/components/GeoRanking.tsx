import type { GeoCountryItem } from "@/features/analytics-dashboard/types";
import { CountryFlag } from "@/features/analytics-dashboard/components/CountryFlag";
import { Users } from "lucide-react";

interface GeoRankingProps {
  items: GeoCountryItem[];
}

export function GeoRanking({ items }: GeoRankingProps) {
  if (!items || items.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-zinc-500">
        No hay datos de geolocalización disponibles.
      </div>
    );
  }

  const maxSessions = Math.max(1, ...items.map((i) => i.sessions));
  const totalSessions = items.reduce((acc, i) => acc + i.sessions, 0);

  return (
    <div className="space-y-2.5">
      {items.slice(0, 7).map((item) => {
        const percentage = Math.round((item.sessions / maxSessions) * 100);
        const shareOfTotal = totalSessions > 0 ? Math.round((item.sessions / totalSessions) * 100) : 0;

        return (
          <div
            key={`${item.countryCode}-${item.country}`}
            className="group relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 transition-all duration-200 hover:border-emerald-500/40 hover:bg-zinc-900/60"
          >
            {/* Background proportion bar */}
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-500/10 to-teal-500/5 transition-all duration-500 pointer-events-none"
              style={{ width: `${percentage}%` }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Flag */}
                <CountryFlag
                  countryCode={item.countryCode}
                  countryName={item.country}
                  className="h-3.5 w-5 shrink-0 rounded-xs object-cover"
                />

                {/* Country Name */}
                <span className="truncate text-xs font-semibold text-zinc-200 group-hover:text-white">
                  {item.country || "Desconocido"}
                </span>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-zinc-500">
                  {shareOfTotal}%
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-300">
                  <Users className="h-3 w-3" />
                  <span>{item.sessions} {item.sessions === 1 ? "sesión" : "sesiones"}</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

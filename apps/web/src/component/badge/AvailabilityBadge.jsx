"use client";

import { useAvailability } from "@/context/AvailabilityContext";

export default function AvailabilityBadge({
  className = "",
  showText = true,
  size = "sm", // "xs" | "sm" | "md"
}) {
  const { available, loading } = useAvailability();
  const isLoading = loading || available === null;
  const isAvailable = Boolean(available);

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[10px] gap-1.5",
    sm: "px-2.5 py-0.5 text-[11px] gap-1.5",
    md: "px-3 py-1 text-xs gap-2",
  }[size] || "px-2.5 py-0.5 text-[11px] gap-1.5";

  const dotSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
  }[size] || "h-1.5 w-1.5";

  if (isLoading) {
    const textSkeletonWidth = {
      xs: "w-11 h-2",
      sm: "w-14 h-2.5",
      md: "w-16 h-3",
    }[size] || "w-14 h-2.5";

    return (
      <span
        className={`inline-flex items-center rounded-full border border-zinc-800/80 bg-zinc-900/60 animate-pulse select-none ${sizeClasses} ${className}`}
        aria-hidden="true"
        title="Cargando estado de disponibilidad..."
      >
        <span className={`rounded-full bg-zinc-700/80 shrink-0 ${dotSizes}`} />
        {showText && (
          <span className={`rounded-sm bg-zinc-800 shrink-0 ${textSkeletonWidth}`} />
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium transition-all duration-300 select-none ${sizeClasses} ${
        isAvailable
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
      } ${className}`}
      title={isAvailable ? "Disponible para nuevos proyectos" : "Actualmente ausente"}
    >
      <span className={`relative flex ${dotSizes}`}>
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isAvailable ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full ${dotSizes} ${
            isAvailable ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
      </span>
      {showText && <span>{isAvailable ? "Disponible" : "Ausente"}</span>}
    </span>
  );
}

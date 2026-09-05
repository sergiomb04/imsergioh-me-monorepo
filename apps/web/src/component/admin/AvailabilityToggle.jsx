"use client";

import { useAvailability } from "@/context/AvailabilityContext";
import { Loader2 } from "lucide-react";

export default function AvailabilityToggle({
  adminToken = "",
  variant = "pill", // "pill" | "card"
  className = "",
}) {
  const { available, loading, updating, errorMsg, toggleAvailability } = useAvailability();
  const isLoading = loading || available === null;
  const isAvailable = Boolean(available);

  const handleToggle = () => {
    if (!adminToken || isLoading) return;
    toggleAvailability(adminToken);
  };

  // 1. Variant: Card (for main dashboard overview widget)
  if (variant === "card") {
    if (isLoading) {
      return (
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5 backdrop-blur-sm shadow-sm ${className}`}
        >
          <div className="flex items-center gap-3">
            <span className="font-montserrat text-sm font-semibold text-white">
              Disponibilidad pública
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-800/60 px-2.5 py-0.5 text-xs text-zinc-400 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-zinc-700" />
              Cargando...
            </span>
          </div>

          <div className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/50 px-3 text-xs text-zinc-500 animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
            <span>Cargando...</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5 backdrop-blur-sm shadow-sm transition-all duration-200 ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="font-montserrat text-sm font-semibold text-white">
            Disponibilidad pública
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              isAvailable
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-zinc-700 bg-zinc-800/80 text-zinc-300"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isAvailable && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAvailable ? "bg-emerald-500" : "bg-zinc-500"
                }`}
              />
            </span>
            {isAvailable ? "Disponible" : "Ausente"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            disabled={updating || !adminToken}
            className="inline-flex items-center gap-2.5 rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {updating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                <span>Sincronizando...</span>
              </>
            ) : (
              <>
                <div
                  className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ${
                    isAvailable ? "bg-emerald-600" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                      isAvailable ? "translate-x-3.5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span>{isAvailable ? "Marcar Ausente" : "Marcar Disponible"}</span>
              </>
            )}
          </button>

          {errorMsg && (
            <span className="text-xs font-medium text-rose-400">
              {errorMsg}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 2. Variant: Pill / Header Action Button
  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-500 animate-pulse select-none">
          <span className="h-2 w-2 rounded-full bg-zinc-700" />
          <span className="h-3 w-14 rounded bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={updating || !adminToken}
        title={
          isAvailable
            ? "Estado actual: Disponible. Haz clic para cambiar a Ausente."
            : "Estado actual: Ausente. Haz clic para cambiar a Disponible."
        }
        className={`group relative inline-flex items-center gap-2.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          isAvailable
            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-500/25"
            : "border-amber-500/40 bg-amber-500/15 text-amber-300 hover:border-amber-400/60 hover:bg-amber-500/25"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isAvailable ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isAvailable ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        </span>

        {updating ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-zinc-300">Guardando...</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span>{isAvailable ? "Disponible" : "Ausente"}</span>
            {/* Miniature Switch Pill */}
            <span
              className={`relative ml-0.5 inline-flex h-3.5 w-6 items-center rounded-full transition-colors ${
                isAvailable ? "bg-emerald-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                  isAvailable ? "translate-x-3" : "translate-x-0.5"
                }`}
              />
            </span>
          </span>
        )}
      </button>

      {errorMsg && (
        <span className="text-[11px] font-medium text-rose-400">{errorMsg}</span>
      )}
    </div>
  );
}

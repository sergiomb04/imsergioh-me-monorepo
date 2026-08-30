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
          className={`relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-linear-to-b from-zinc-900/30 via-zinc-950/40 to-zinc-950/80 p-6 backdrop-blur-xl transition-all duration-300 shadow-xl ${className}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-zinc-700" />
                  Cargando...
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  LiveState WebSocket
                </span>
              </div>

              <h4 className="font-montserrat text-lg font-bold text-white tracking-tight">
                Estado de Disponibilidad Pública
              </h4>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                Controla el badge en tiempo real que ven los usuarios en el pie de página de la web.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <div className="relative inline-flex h-11 items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 text-xs font-semibold text-zinc-500 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                <span>Cargando estado...</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all duration-300 shadow-xl ${
          isAvailable
            ? "border-emerald-500/30 bg-linear-to-b from-emerald-950/20 via-zinc-950/40 to-zinc-950/80 shadow-emerald-500/5"
            : "border-amber-500/30 bg-linear-to-b from-amber-950/20 via-zinc-950/40 to-zinc-950/80 shadow-amber-500/5"
        } ${className}`}
      >
        {/* Glow ambient */}
        <div
          className={`absolute -top-12 -right-12 h-36 w-36 rounded-full blur-[70px] pointer-events-none transition-colors duration-500 ${
            isAvailable ? "bg-emerald-500/20" : "bg-amber-500/20"
          }`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-all ${
                  isAvailable
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/15 text-amber-300"
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
                {isAvailable ? "Disponible" : "Ausente"}
              </span>

              <span className="text-[11px] text-zinc-500 font-mono">
                LiveState WebSocket
              </span>
            </div>

            <h4 className="font-montserrat text-lg font-bold text-white tracking-tight">
              Estado de Disponibilidad Pública
            </h4>
            <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
              Controla el badge en tiempo real que ven los usuarios en el pie de página de la web. Cambia entre <strong className="text-emerald-300 font-medium">Disponible</strong> y <strong className="text-amber-300 font-medium">Ausente</strong> de forma inmediata y sincronizada.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggle}
              disabled={updating || !adminToken}
              className={`relative inline-flex h-11 items-center gap-3 rounded-2xl border px-4 text-xs font-semibold shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                isAvailable
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 hover:border-emerald-400/60 shadow-emerald-500/10"
                  : "border-amber-500/40 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 hover:border-amber-400/60 shadow-amber-500/10"
              }`}
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  {/* Custom Toggle Switch Track */}
                  <div
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
                      isAvailable ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                        isAvailable ? "translate-x-4.5" : "translate-x-1"
                      }`}
                    />
                  </div>
                  <span>{isAvailable ? "Marcar Ausente" : "Marcar Disponible"}</span>
                </>
              )}
            </button>

            {errorMsg && (
              <span className="text-[11px] font-medium text-rose-400">
                {errorMsg}
              </span>
            )}
          </div>
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

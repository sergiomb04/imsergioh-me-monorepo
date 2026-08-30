"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";

export default function CounterComponent() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const stepOptions = [1, 5, 10, 100];

  const increaseCount = useCallback(() => {
    setCount((prev) => {
      if (prev >= Number.MAX_SAFE_INTEGER - step) return prev;
      return prev + step;
    });
  }, [step]);

  const decreaseCount = useCallback(() => {
    setCount((prev) => {
      if (prev <= Number.MIN_SAFE_INTEGER + step) return prev;
      return prev - step;
    });
  }, [step]);

  const resetCount = useCallback(() => {
    setCount(0);
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;
      if (e.key === "ArrowUp" || e.key === " ") {
        e.preventDefault();
        increaseCount();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        decreaseCount();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        resetCount();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [increaseCount, decreaseCount, resetCount]);

  const formattedCount = new Intl.NumberFormat("es-ES").format(count);

  const getFontSizeClass = (textLength) => {
    if (textLength <= 6) return "text-5xl sm:text-6xl font-bold";
    if (textLength <= 10) return "text-4xl sm:text-5xl font-bold";
    if (textLength <= 14) return "text-3xl sm:text-4xl font-bold";
    if (textLength <= 18) return "text-2xl sm:text-3xl font-bold";
    return "text-xl sm:text-2xl font-bold break-all";
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      {/* Contenedor Principal */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-md p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-montserrat text-white">
            Contador Infinito
          </h2>
          <span className="text-xs font-mono text-neutral-400">
            Paso: &plusmn;{step}
          </span>
        </div>

        {/* Pantalla del Marcador */}
        <div className="flex items-center justify-center min-h-[110px] sm:min-h-[130px] px-4 py-3 rounded-xl border border-white/5 bg-neutral-950/90 text-center">
          <p
            className={`${getFontSizeClass(
              formattedCount.length
            )} font-mono text-white tracking-wider transition-all`}
          >
            {formattedCount}
          </p>
        </div>

        {/* Selector de Paso */}
        <div className="flex items-center justify-between gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
          {stepOptions.map((val) => {
            const isActive = step === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setStep(val)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                +{val}
              </button>
            );
          })}
        </div>

        {/* Botonera de Control */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={increaseCount}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-sm sm:text-base transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Incrementar</span>
          </button>

          <button
            type="button"
            onClick={decreaseCount}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-semibold text-sm sm:text-base transition-all"
          >
            <Minus className="w-4 h-4" />
            <span>Decrementar</span>
          </button>

          <button
            type="button"
            onClick={resetCount}
            className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white font-medium text-xs sm:text-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
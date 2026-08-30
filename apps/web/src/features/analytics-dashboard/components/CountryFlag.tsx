"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

interface CountryFlagProps {
  countryCode?: string;
  countryName?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function CountryFlag({
  countryCode,
  countryName,
  className = "",
  width = 20,
  height = 14,
}: CountryFlagProps) {
  const [hasError, setHasError] = useState(false);

  const cleanCode = countryCode?.trim().toLowerCase();
  const isValidCode = Boolean(cleanCode && /^[a-z]{2}$/.test(cleanCode) && cleanCode !== "xx");

  if (!isValidCode || hasError) {
    return (
      <span
        className="inline-flex h-3.5 w-5 items-center justify-center text-zinc-400 shrink-0"
        title={countryName || countryCode || "Desconocido"}
        aria-label={countryName || countryCode || "Desconocido"}
      >
        <Globe className="h-3.5 w-3.5 text-zinc-400" />
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/${cleanCode}.svg`}
      alt={countryName ? `Bandera de ${countryName}` : `Bandera (${countryCode})`}
      title={countryName || countryCode}
      className={`h-3.5 w-5 shrink-0 rounded-xs border border-white/10 object-cover aspect-[4/3] ${className}`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
    />
  );
}

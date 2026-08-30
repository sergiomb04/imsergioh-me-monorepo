"use client";

import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export default function GoogleLogoutButton({ className = "", compact = false }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin" })}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-zinc-300 transition-all duration-200 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 active:scale-95 ${className}`}
      title="Cerrar sesión de administrador"
    >
      <LogOut className="w-3.5 h-3.5" />
      {!compact && <span>Cerrar sesión</span>}
    </button>
  );
}
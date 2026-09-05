"use client";

import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export default function GoogleLogoutButton({ className = "", compact = false }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin" })}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition-all duration-200 hover:border-rose-500/70 hover:bg-rose-500/20 hover:text-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 active:scale-95 cursor-pointer ${className}`}
      title="Cerrar sesión de administrador"
    >
      <LogOut className="w-3.5 h-3.5 text-rose-400" />
      {!compact && <span>Cerrar sesión</span>}
    </button>
  );
}
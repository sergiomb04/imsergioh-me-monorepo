"use client";

import { signIn } from "@/auth";
import { ArrowRight } from "lucide-react";

export default function GoogleLoginButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="group relative mt-6 flex w-full items-center justify-between overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/90 px-5 py-3.5 font-montserrat text-sm font-semibold text-white shadow-xl shadow-black/40 transition-all duration-300 hover:border-cyan-400/80 hover:bg-zinc-800/90 hover:shadow-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
            <path
              fill="#EA4335"
              d="M12 10.2v3.98h5.53c-.24 1.28-.97 2.36-2.06 3.09l3.33 2.58c1.94-1.79 3.06-4.43 3.06-7.58 0-.74-.07-1.45-.19-2.13H12Z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.76 0 5.08-.91 6.77-2.48l-3.33-2.58c-.93.63-2.12 1-3.44 1-2.64 0-4.88-1.79-5.67-4.19l-3.43 2.66A10.23 10.23 0 0 0 12 22Z"
            />
            <path
              fill="#4A90E2"
              d="M6.33 13.75a6.16 6.16 0 0 1 0-3.5L2.9 7.6a10.23 10.23 0 0 0 0 8.8l3.43-2.65Z"
            />
            <path
              fill="#FBBC05"
              d="M12 6.06c1.5 0 2.85.52 3.92 1.55l2.94-2.94C17.07 2.99 14.76 2 12 2a10.23 10.23 0 0 0-9.1 5.6l3.43 2.65c.79-2.4 3.03-4.19 5.67-4.19Z"
            />
          </svg>
        </span>
        <span className="text-zinc-100 group-hover:text-white">Continuar con Google</span>
      </div>

      <ArrowRight className="h-4 w-4 text-zinc-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-cyan-300" />
    </button>
  );
}

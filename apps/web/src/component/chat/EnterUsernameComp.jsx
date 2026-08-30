"use client";

import { useState } from "react";

export default function EnterUsernameComp({ handleSetUsername }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    const cleanName = username.trim();
    if (!cleanName) {
      setError("Introduce un nombre de usuario");
      return;
    }
    if (cleanName.length > 20) {
      setError("Máximo 20 caracteres");
      return;
    }
    setError("");
    handleSetUsername(cleanName);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-md p-6 flex flex-col gap-4 shadow-xl">
        <h2 className="text-lg font-bold font-montserrat text-white text-center">
          Chat Interactivo
        </h2>
        <p className="text-xs text-neutral-400 text-center -mt-2">
          Introduce tu nombre para unirte a la sala
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            autoFocus
            maxLength={20}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError("");
            }}
            placeholder="Tu nombre o apodo"
            className="w-full h-11 px-3.5 rounded-xl border border-white/10 bg-neutral-950/80 text-white placeholder:text-neutral-500 outline-none transition focus:border-white/30 text-sm"
          />

          {error && <span className="text-xs text-rose-400">{error}</span>}

          <button
            type="submit"
            className="h-11 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all cursor-pointer"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
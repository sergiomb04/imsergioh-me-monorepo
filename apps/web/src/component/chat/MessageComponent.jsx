"use client";

import React from "react";

export default function MessageComponent({ message, currentUser }) {
  const ownerName = message?.owner || "Anónimo";
  const isSelf = currentUser && ownerName.toLowerCase() === currentUser.toLowerCase();
  const isAdmin = Boolean(message?.admin);

  let formattedDate = "";
  if (message?.date) {
    try {
      const d = new Date(message.date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      formattedDate = "";
    }
  }

  return (
    <div
      className={`flex flex-col p-3.5 rounded-xl border max-w-[90%] sm:max-w-[75%] shadow-sm ${
        isSelf
          ? "self-end bg-neutral-800/90 border-white/15 text-white"
          : "self-start bg-neutral-900/90 border-white/10 text-neutral-100"
      }`}
    >
      <div className="flex justify-between items-center mb-1.5 gap-4">
        <span
          className={`text-xs sm:text-sm font-semibold tracking-wide ${
            isAdmin ? "text-red-500 font-bold" : "text-neutral-300"
          }`}
        >
          {isAdmin ? "[ADMIN]" : "[USER]"} - {ownerName} {isSelf && "(Tú)"}
        </span>
        {formattedDate && (
          <span className="text-[11px] text-neutral-400 shrink-0 font-mono">
            {formattedDate}
          </span>
        )}
      </div>

      <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
        {message?.message}
      </p>
    </div>
  );
}

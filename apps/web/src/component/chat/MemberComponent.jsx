"use client";

import React from "react";

export default function MemberComponent({ name, isCurrentUser }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
        isCurrentUser
          ? "border-white/20 bg-white/10 text-white"
          : "border-white/5 bg-white/[0.03] text-neutral-300"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
      <span className="truncate max-w-[120px]">
        {name} {isCurrentUser && "(Tú)"}
      </span>
    </div>
  );
}

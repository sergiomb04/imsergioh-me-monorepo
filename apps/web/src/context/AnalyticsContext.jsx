"use client";

import { createContext, useContext } from "react";

export const RealtimeContext = createContext(null);

export function useRealtime() {
  return useContext(RealtimeContext);
}
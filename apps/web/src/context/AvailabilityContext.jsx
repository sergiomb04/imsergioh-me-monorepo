"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRealtimeState } from "@/lib/livestate/src/realtime";

function getBaseApiUrl() {
  const livestateUrl = process.env.NEXT_PUBLIC_LIVESTATE_URL || "https://livestate.imsergioh.me";
  return livestateUrl
    .replace(/^wss:\/\//i, "https://")
    .replace(/^ws:\/\//i, "http://")
    .replace(/\/$/, "");
}

const AvailabilityContext = createContext({
  available: null,
  loading: true,
  updating: false,
  errorMsg: "",
  toggleAvailability: async () => {},
  refreshAvailability: async () => {},
});

export function AvailabilityProvider({ children }) {
  // LiveState hook receives real-time updates from WebSocket channel "available"
  const [realtimeVal, setRealtimeVal] = useRealtimeState("available", undefined);
  const [available, setAvailable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync state whenever LiveState pushes a new boolean from backend
  useEffect(() => {
    if (typeof realtimeVal === "boolean") {
      setAvailable(realtimeVal);
      setLoading(false);
    }
  }, [realtimeVal]);

  // Initial fetch from REST endpoint /available
  const refreshAvailability = useCallback(async () => {
    try {
      const httpBase = getBaseApiUrl();
      const res = await fetch(`${httpBase}/available`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (typeof data === "boolean") {
        setAvailable(data);
        if (typeof setRealtimeVal === "function") {
          setRealtimeVal(data);
        }
      }
    } catch (err) {
      console.warn("No se pudo obtener el estado inicial de disponibilidad:", err);
      setAvailable((prev) => (prev !== null ? prev : true));
    } finally {
      setLoading(false);
    }
  }, [setRealtimeVal]);

  useEffect(() => {
    refreshAvailability();
  }, [refreshAvailability]);

  // Unified toggle action that notifies backend and synchronizes all components
  const toggleAvailability = useCallback(
    async (token) => {
      if (updating || !token) return;

      setUpdating(true);
      setErrorMsg("");

      try {
        const httpBase = getBaseApiUrl();
        const res = await fetch(`${httpBase}/available/toggle`, {
          method: "POST",
          headers: {
            Authorization: token,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.ok) {
          if (typeof data.available === "boolean") {
            setAvailable(data.available);
            if (typeof setRealtimeVal === "function") {
              setRealtimeVal(data.available);
            }
          }
        } else {
          throw new Error(data.error || "No se pudo actualizar el estado");
        }
      } catch (err) {
        console.error("Error toggling availability:", err);
        setErrorMsg("Error al actualizar");
        setTimeout(() => setErrorMsg(""), 3000);
      } finally {
        setUpdating(false);
      }
    },
    [updating, setRealtimeVal]
  );

  return (
    <AvailabilityContext.Provider
      value={{
        available,
        loading,
        updating,
        errorMsg,
        toggleAvailability,
        refreshAvailability,
      }}
    >
      {children}
    </AvailabilityContext.Provider>
  );
}

export function useAvailability() {
  return useContext(AvailabilityContext);
}

"use client";

import { useEffect, useState } from "react";
import {
  connect,
  getConnectionState,
  sendAction,
} from "@/lib/livestate/src/realtime";
import { RealtimeContext } from "@/context/AnalyticsContext";

const realtimeUrl =
  process.env.NEXT_PUBLIC_LIVESTATE_URL || "https://livestate.imsergioh.me";

export function RealtimeProvider({ children, token }) {
  const [connectionState, setConnectionState] = useState("closed");

  useEffect(() => {
    connect(`${realtimeUrl.replace(/\/$/, "")}/realtime`, token);
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionState(getConnectionState());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const send = (action, data) => {
    sendAction(action, data);
  };

  return (
    <RealtimeContext.Provider
      value={{
        send,
        connectionState,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

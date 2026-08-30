"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sendAction } from "@/lib/livestate/src/realtime";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    sendAction("PAGE_VIEW", {
      path: pathname,
      url: window.location.href,
    });
  }, [pathname]);

  return null;
}
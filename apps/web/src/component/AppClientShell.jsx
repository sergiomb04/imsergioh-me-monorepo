"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import ScrollToTopOnRouteChange from "@/component/ScrollToTopOnRouteChange";
import SiteChrome from "@/component/SiteChrome";
import { RealtimeProvider } from "@/context/RealtimeProvider";
import { AvailabilityProvider } from "@/context/AvailabilityContext";
import { initAnalytics } from "@/utils/analytics";
import { AnalyticsTracker } from "@/utils/AnalyticsTracker";
import { Toaster } from "sonner";

export default function AppClientShell({ children }) {
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (!isAdminRoute) {
      initAnalytics();
    }
  }, [isAdminRoute]);

  return (
    <RealtimeProvider token={null}>
      <AvailabilityProvider>
        {!isAdminRoute && <AnalyticsTracker />}

        <div id="route-top" />

        <Suspense fallback={null}>
          <ScrollToTopOnRouteChange />
        </Suspense>

        <SiteChrome>{children}</SiteChrome>

        <Toaster
          theme="dark"
          position="bottom-right"
          richColors={false}
          toastOptions={{
            style: {
              background: "rgba(9, 9, 11, 0.95)",
              color: "#f4f4f5",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px 0 rgba(6, 182, 212, 0.08)",
              borderRadius: "16px",
              padding: "14px 16px",
            },
            className: "font-sans",
          }}
        />
      </AvailabilityProvider>
    </RealtimeProvider>
  );
}

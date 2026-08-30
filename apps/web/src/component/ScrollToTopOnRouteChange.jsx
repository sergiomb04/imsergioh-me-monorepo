"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const resetScrollToTop = () => {
    if (typeof window === "undefined") {
      return;
    }

    const topAnchor = document.getElementById("route-top");
    if (topAnchor) {
      topAnchor.scrollIntoView({ block: "start", inline: "nearest" });
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Evita que el navegador restaure scroll previo al volver/navegar.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Ejecuta antes de pintar para evitar quedarse en una posición intermedia.
    resetScrollToTop();
    requestAnimationFrame(resetScrollToTop);

    const timeoutA = window.setTimeout(resetScrollToTop, 0);
    const timeoutB = window.setTimeout(resetScrollToTop, 120);

    return () => {
      window.clearTimeout(timeoutA);
      window.clearTimeout(timeoutB);
    };
  }, [pathname, queryString]);

  return null;
}
import { sendAction } from "@/lib/livestate/src/realtime";

export function initAnalytics() {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    const el = target.closest("a[href]") as HTMLAnchorElement | null;
    if (!el) return;

    // Solo enlaces que abren una nueva pestaña
    if (el.target !== "_blank") return;

    sendAction("LINK_CLICK", {
      text: el.textContent?.trim(),
      href: el.href,
    });
  });
}
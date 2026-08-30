"use client";

import { usePathname } from "next/navigation";
import NavbarComponent from "@/component/navbar/NavbarComponent";
import FooterComponent from "@/component/footer/FooterComponent";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith("/projects/") || pathname?.startsWith("/admin");
  const showChrome = !hideChrome;

  return (
    <>
      {showChrome && <NavbarComponent />}
      <main>{children}</main>
      {showChrome && <FooterComponent />}
    </>
  );
}

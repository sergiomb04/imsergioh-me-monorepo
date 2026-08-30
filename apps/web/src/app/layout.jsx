import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "@/app/globals.css";
import AppClientShell from "@/component/AppClientShell";
import { getSiteOrigin } from "@/lib/siteOrigin";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-montserrat",
});

const siteOrigin = getSiteOrigin();
const imageUrl = `${siteOrigin}/logo.png`;

export const metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "SergioHub - Modo creativo",
    template: "%s",
  },
  description: "Algunas cosas mías y practicando desarrollo web",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SergioHub - Modo Creativo",
    description: "Algunas cosas mías y practicando desarrollo web",
    url: siteOrigin,
    type: "website",
    siteName: "SergioHub",
    locale: "es_ES",
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: "SergioHub - Modo Creativo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SergioHub - Modo Creativo",
    description: "Algunas cosas mías y practicando desarrollo web",
    images: [imageUrl],
    site: "@ImSergioh",
    creator: "@ImSergioh",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <AppClientShell>{children}</AppClientShell>
      </body>
    </html>
  );
}

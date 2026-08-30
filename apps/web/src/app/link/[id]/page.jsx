import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getClientIpFromHeaders,
  getShortLinkById,
  recordShortLinkVisit,
} from "@/lib/shortLinksService";
import { getSiteOrigin } from "@/lib/siteOrigin";

function isPreviewBot(userAgent) {
  if (!userAgent) {
    return false;
  }

  const normalized = userAgent.toLowerCase();
  const broadBotSignals = ["bot", "crawler", "spider", "preview", "unfurl"];

  const knownPreviewAgents = [
    "twitterbot",
    "x-twitter",
    "discordbot",
    "discord",
    "slackbot",
    "slack-imgproxy",
    "whatsapp",
    "telegrambot",
    "linkedinbot",
    "facebookexternalhit",
    "facebot",
    "skypeuripreview",
    "instagram",
    "pinterest",
    "googlebot",
    "bingbot",
  ];

  return (
    knownPreviewAgents.some((bot) => normalized.includes(bot)) ||
    broadBotSignals.some((signal) => normalized.includes(signal))
  );
}

function buildMetadataFromLink(link, shortId) {
  const siteOrigin = getSiteOrigin();
  const siteUrl = new URL(siteOrigin);
  const path = `/link/${encodeURIComponent(shortId)}`;
  const shortUrl = `${siteOrigin}${path}`;
  const title = link?.title
    ? `${link.title} | Acortador de links`
    : `Redireccion a ${link?.targetUrl || "destino"}`;
  const description = link?.title
    ? `Abre este enlace acortado: ${link.targetUrl}`
    : `Enlace corto hacia ${link?.targetUrl || "destino externo"}`;
  const imageUrl = `${siteOrigin}/logo.png`;

  return {
    metadataBase: new URL(siteOrigin),
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: {
      index: false,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title,
      description,
      url: shortUrl,
      type: "website",
      siteName: "SergioHub",
      locale: "es_ES",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: link?.title || "SergioHub short link",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      site: "@ImSergioh",
      creator: "@ImSergioh",
    },
    other: {
      // Compatibility layer used by preview parsers across Discord/Slack/WhatsApp/Telegram/Instagram.
      "og:image:secure_url": imageUrl,
      "og:image:type": "image/png",
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:updated_time": new Date().toISOString(),
      "twitter:domain": siteUrl.hostname,
      "twitter:url": shortUrl,
    },
  };
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const shortId = decodeURIComponent(resolvedParams?.id || "");
  const link = await getShortLinkById(shortId);

  if (!link) {
    const siteOrigin = getSiteOrigin();
    const path = `/link/${encodeURIComponent(shortId)}`;
    const imageUrl = `${siteOrigin}/logo.png`;

    return {
      metadataBase: new URL(siteOrigin),
      title: "Link no disponible",
      description: "El link corto solicitado no existe o fue eliminado.",
      alternates: {
        canonical: path,
      },
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: "Link no disponible",
        description: "El link corto solicitado no existe o fue eliminado.",
        url: `${siteOrigin}${path}`,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: "SergioHub",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Link no disponible",
        description: "El link corto solicitado no existe o fue eliminado.",
        images: [imageUrl],
      },
    };
  }

  return buildMetadataFromLink(link, shortId);
}

export default async function ShortLinkPage({ params }) {
  const resolvedParams = await params;
  const shortId = decodeURIComponent(resolvedParams?.id || "");

  const link = await getShortLinkById(shortId);

  if (!link) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-24">
        <section className="mx-auto w-full max-w-xl rounded-2xl border border-slate-700/60 bg-slate-900/60 p-8 shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Error 404</p>
          <h1 className="mt-2 text-3xl font-semibold font-montserrat">Link no existente</h1>
          <p className="mt-3 text-slate-300">
            El identificador solicitado no existe o fue eliminado del sistema.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-4 py-2 font-medium text-cyan-200 hover:bg-cyan-500/25"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") || "";

  if (isPreviewBot(userAgent)) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-24">
        <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-700/60 bg-slate-900/60 p-8 shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Link corto</p>
          <h1 className="mt-2 text-3xl font-semibold font-montserrat">
            {link.title || `/${link.shortId}`}
          </h1>
          <p className="mt-3 text-slate-300 break-all">
            Destino: {link.targetUrl}
          </p>
          <a
            href={link.targetUrl}
            rel="noreferrer"
            className="mt-6 inline-flex items-center rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-4 py-2 font-medium text-cyan-200 hover:bg-cyan-500/25"
          >
            Abrir enlace
          </a>
        </section>
      </main>
    );
  }

  const ip = getClientIpFromHeaders(headerStore);

  await recordShortLinkVisit({
    shortId: link.shortId,
    targetUrl: link.targetUrl,
    ip,
    userAgent,
    referer: headerStore.get("referer") || "",
  });

  redirect(link.targetUrl);
}

export function getSiteOrigin() {
  const explicitOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;

  if (explicitOrigin) {
    return explicitOrigin.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "https://www.imsergioh.me";
}

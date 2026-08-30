import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXT_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "Missing ADMIN_SESSION_SECRET, NEXT_AUTH_SECRET, or AUTH_SECRET environment variable"
    );
  }
  return secret;
}

function signPayload(payload) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionTtlSeconds() {
  return SESSION_TTL_SECONDS;
}

export function createAdminSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin:${expiresAt}`;
  const signature = signPayload(payload);
  return `${payload}:${signature}`;
}

export function isValidAdminSessionToken(token) {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const [scope, expiresAtRaw, providedSignature] = parts;

  if (scope !== "admin") {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  try {
    const payload = `${scope}:${expiresAtRaw}`;
    const expectedSignature = signPayload(payload);

    const providedBuffer = Buffer.from(providedSignature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(providedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}
import "server-only";

import {
  deleteCachedLink,
  getCachedLink,
  getCachedLinksList,
  invalidateLinksListCache,
  setCachedLink,
  setCachedLinksList,
} from "@/lib/shortLinksCache";

function getBackendLinksUrl() {
  if (process.env.BACKEND_LINKS_API_URL) {
    return process.env.BACKEND_LINKS_API_URL.replace(/\/$/, "");
  }

  if (process.env.BACKEND_API_URL) {
    return `${process.env.BACKEND_API_URL.replace(/\/$/, "")}/api/links`;
  }

  if (process.env.BACKEND_CDN_API_URL) {
    return process.env.BACKEND_CDN_API_URL.replace(/\/cdn\/?$/, "/links").replace(/\/$/, "");
  }

  return "https://livestate.imsergioh.me/api/links";
}

function getBackendLinksDataUrl() {
  if (process.env.BACKEND_LINKS_DATA_API_URL) {
    return process.env.BACKEND_LINKS_DATA_API_URL.replace(/\/$/, "");
  }

  if (process.env.BACKEND_API_URL) {
    return `${process.env.BACKEND_API_URL.replace(/\/$/, "")}/api/links-data`;
  }

  const base = getBackendLinksUrl();
  return base.replace(/\/links$/, "/links-data");
}

function sanitizeShortId(rawShortId) {
  const normalized = String(rawShortId || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  if (normalized.length < 3 || normalized.length > 64) {
    return null;
  }

  return normalized;
}

function normalizeTargetUrl(rawUrl) {
  const value = String(rawUrl || "").trim();

  if (!value) {
    return null;
  }

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return null;
  }

  return parsed.toString();
}

export function getClientIpFromHeaders(headerStore) {
  const forwardedFor =
    headerStore.get("x-forwarded-for") ||
    headerStore.get("x-real-ip") ||
    headerStore.get("cf-connecting-ip") ||
    "";

  if (!forwardedFor) {
    return "unknown";
  }

  return forwardedFor.split(",")[0].trim() || "unknown";
}

export async function listShortLinks(token) {
  const cached = getCachedLinksList();

  if (cached) {
    return cached;
  }

  const headers = {};
  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(getBackendLinksUrl(), {
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to list short links: ${response.statusText}`);
  }

  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : payload.items || [];

  setCachedLinksList(items);
  return items;
}

export async function getShortLinkById(rawShortId, token) {
  const shortId = sanitizeShortId(rawShortId);

  if (!shortId) {
    return null;
  }

  const cached = getCachedLink(shortId);

  if (cached) {
    return cached;
  }

  const headers = {};
  if (token) {
    headers.Authorization = token;
  }

  try {
    const response = await fetch(`${getBackendLinksUrl()}/${encodeURIComponent(shortId)}`, {
      cache: "no-store",
      headers,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const item = payload.item || payload;

    if (item && item.shortId) {
      setCachedLink(shortId, item);
      return item;
    }

    return null;
  } catch {
    return null;
  }
}

export async function createShortLink(payload, token) {
  const shortId = sanitizeShortId(payload?.shortId);
  const targetUrl = normalizeTargetUrl(payload?.targetUrl);
  const title = String(payload?.title || "").trim();

  if (!shortId) {
    throw new Error("invalid_short_id");
  }

  if (!targetUrl) {
    throw new Error("invalid_target_url");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(getBackendLinksUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      shortId,
      targetUrl,
      title,
    }),
  });

  const resPayload = await response.json().catch(() => ({}));

  if (response.status === 409 || resPayload.error === "short_id_already_exists") {
    const err = new Error("short_id_already_exists");
    err.code = 11000;
    throw err;
  }

  if (!response.ok || !resPayload.ok) {
    throw new Error(resPayload.error || "failed_to_create_short_link");
  }

  const item = resPayload.item || resPayload;
  setCachedLink(shortId, item);
  invalidateLinksListCache();

  return item;
}

export async function updateShortLink(shortIdParam, payload, token) {
  const currentShortId = sanitizeShortId(shortIdParam);

  if (!currentShortId) {
    throw new Error("invalid_short_id");
  }

  const nextShortId = payload?.shortId
    ? sanitizeShortId(payload.shortId)
    : currentShortId;

  const targetUrl =
    payload?.targetUrl !== undefined
      ? normalizeTargetUrl(payload.targetUrl)
      : undefined;

  const title = payload?.title !== undefined ? String(payload.title || "").trim() : undefined;

  if (!nextShortId) {
    throw new Error("invalid_short_id");
  }

  if (payload?.targetUrl !== undefined && !targetUrl) {
    throw new Error("invalid_target_url");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = token;
  }

  const body = {};
  if (nextShortId !== currentShortId) body.shortId = nextShortId;
  if (targetUrl !== undefined) body.targetUrl = targetUrl;
  if (title !== undefined) body.title = title;

  const response = await fetch(`${getBackendLinksUrl()}/${encodeURIComponent(currentShortId)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });

  const resPayload = await response.json().catch(() => ({}));

  if (response.status === 409 || resPayload.error === "short_id_already_exists") {
    const err = new Error("short_id_already_exists");
    err.code = 11000;
    throw err;
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || !resPayload.ok) {
    throw new Error(resPayload.error || "failed_to_update_short_link");
  }

  const item = resPayload.item || resPayload;

  if (nextShortId !== currentShortId) {
    deleteCachedLink(currentShortId);
  }

  setCachedLink(nextShortId, item);
  invalidateLinksListCache();

  return item;
}

export async function deleteShortLink(rawShortId, token) {
  const shortId = sanitizeShortId(rawShortId);

  if (!shortId) {
    throw new Error("invalid_short_id");
  }

  const headers = {};
  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`${getBackendLinksUrl()}/${encodeURIComponent(shortId)}`, {
    method: "DELETE",
    headers,
  });

  if (response.status === 404) {
    return null;
  }

  const resPayload = await response.json().catch(() => ({}));

  if (!response.ok || !resPayload.ok) {
    throw new Error(resPayload.error || "failed_to_delete_short_link");
  }

  deleteCachedLink(shortId);
  invalidateLinksListCache();

  return resPayload.item || { shortId };
}

export async function recordShortLinkVisit({ shortId, targetUrl, ip, userAgent, referer }) {
  const validShortId = sanitizeShortId(shortId);

  if (!validShortId) {
    return;
  }

  try {
    const response = await fetch(`${getBackendLinksUrl()}/visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shortId: validShortId,
        targetUrl: targetUrl || "",
        ip: ip || "unknown",
        userAgent: String(userAgent || ""),
        referer: String(referer || ""),
      }),
    });

    if (response.ok) {
      invalidateLinksListCache();
    }
  } catch {
    // Non-blocking visit logging error
  }
}

export async function listShortLinkTraffic({ shortId, limit = 200 } = {}, token) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(safeLimit));

  if (shortId) {
    const normalized = sanitizeShortId(shortId);
    if (normalized) {
      searchParams.set("shortId", normalized);
    }
  }

  const headers = {};
  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(`${getBackendLinksDataUrl()}?${searchParams.toString()}`, {
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to list short link traffic: ${response.statusText}`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.items || [];
}

export async function deleteTrafficRecord(recordId, token) {
  if (!recordId) {
    throw new Error("invalid_record_id");
  }

  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(getBackendLinksDataUrl(), {
    method: "DELETE",
    headers,
    body: JSON.stringify({ id: recordId }),
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "failed_to_delete_traffic_record");
  }

  invalidateLinksListCache();
  return payload.deleted || { id: recordId };
}

export async function deleteTrafficByShortId(rawShortId, token) {
  const shortId = sanitizeShortId(rawShortId);

  if (!shortId) {
    throw new Error("invalid_short_id");
  }

  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(getBackendLinksDataUrl(), {
    method: "DELETE",
    headers,
    body: JSON.stringify({ shortId }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "failed_to_delete_traffic");
  }

  invalidateLinksListCache();
  return payload.deletedCount || 0;
}

export async function deleteAllTraffic(token) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(getBackendLinksDataUrl(), {
    method: "DELETE",
    headers,
    body: JSON.stringify({ deleteAll: true }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || "failed_to_purge_traffic");
  }

  invalidateLinksListCache();
  return payload.deletedCount || 0;
}

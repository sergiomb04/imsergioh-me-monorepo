const CACHE_TTL_MS = 1000 * 60 * 5;

const linkByIdCache = new Map();
let linksListCache = null;

function isFresh(entry) {
  return Boolean(entry && entry.expiresAt > Date.now());
}

export function getCachedLink(shortId) {
  const entry = linkByIdCache.get(shortId);

  if (!isFresh(entry)) {
    linkByIdCache.delete(shortId);
    return null;
  }

  return entry.value;
}

export function setCachedLink(shortId, value) {
  linkByIdCache.set(shortId, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function deleteCachedLink(shortId) {
  linkByIdCache.delete(shortId);
}

export function getCachedLinksList() {
  if (!isFresh(linksListCache)) {
    linksListCache = null;
    return null;
  }

  return linksListCache.value;
}

export function setCachedLinksList(value) {
  linksListCache = {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

export function invalidateLinksListCache() {
  linksListCache = null;
}

export function invalidateAllLinksCache() {
  linkByIdCache.clear();
  linksListCache = null;
}

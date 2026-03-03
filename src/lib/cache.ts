const ASSETS_RESPONSE_TTL_MS = 2 * 60 * 1000; // 2 min
const THUMB_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry<T> {
  value: T;
  expires: number;
}

const assetsCache = new Map<string, CacheEntry<{ assets: unknown[]; total: number }>>();
const thumbCache = new Map<string, CacheEntry<{ buf: Buffer; contentType: string }>>();

function prune<T>(map: Map<string, CacheEntry<T>>) {
  const now = Date.now();
  map.forEach((v, k) => {
    if (v.expires <= now) map.delete(k);
  });
}

export function getCachedAssets(
  key: string
): { assets: unknown[]; total: number } | null {
  prune(assetsCache);
  const e = assetsCache.get(key);
  if (!e || e.expires <= Date.now()) return null;
  return e.value;
}

export function setCachedAssets(
  key: string,
  value: { assets: unknown[]; total: number }
): void {
  assetsCache.set(key, {
    value,
    expires: Date.now() + ASSETS_RESPONSE_TTL_MS,
  });
}

export function getCachedThumb(
  key: string
): { buf: Buffer; contentType: string } | null {
  const e = thumbCache.get(key);
  if (!e || e.expires <= Date.now()) return null;
  return e.value;
}

export function setCachedThumb(
  key: string,
  value: { buf: Buffer; contentType: string }
): void {
  if (thumbCache.size > 500) {
    prune(thumbCache);
  }
  thumbCache.set(key, {
    value,
    expires: Date.now() + THUMB_TTL_MS,
  });
}

export function invalidateAssetsCache(): void {
  assetsCache.clear();
}

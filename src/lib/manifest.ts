import type { AssetMetadata } from "./types";

const STORE_DIR = (() => {
  const p = process.env.STORE_PATH ?? ".data/store.json";
  const i = p.lastIndexOf("/");
  return i >= 0 ? p.slice(0, i) : ".data";
})();

export interface ManifestAsset {
  path: string;
  meta: AssetMetadata;
}

export interface AssetsManifest {
  baseFolder: string;
  updatedAt: string;
  assets: ManifestAsset[];
}

function manifestPath(baseFolder: string): string {
  const safe = baseFolder.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  return `${STORE_DIR}/manifest-${safe}.json`;
}

export async function getManifest(baseFolder: string): Promise<AssetsManifest | null> {
  try {
    const path = await import("path");
    const fs = await import("fs/promises");
    const fullPath = path.join(process.cwd(), manifestPath(baseFolder));
    const raw = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(raw) as AssetsManifest;
  } catch {
    return null;
  }
}

export async function setManifest(manifest: AssetsManifest): Promise<void> {
  try {
    const path = await import("path");
    const fs = await import("fs/promises");
    const dir = path.join(process.cwd(), STORE_DIR);
    await fs.mkdir(dir, { recursive: true });
    const fullPath = path.join(process.cwd(), manifestPath(manifest.baseFolder));
    await fs.writeFile(fullPath, JSON.stringify(manifest, null, 0));
  } catch (e) {
    console.error("Failed to write manifest", e);
  }
}

export function clearManifest(baseFolder: string): void {
  manifestCache.delete(baseFolder);
}

export async function deleteManifestFile(baseFolder: string): Promise<void> {
  clearManifest(baseFolder);
  try {
    const path = await import("path");
    const fs = await import("fs/promises");
    const fullPath = path.join(process.cwd(), manifestPath(baseFolder));
    await fs.unlink(fullPath);
  } catch {
    // file may not exist
  }
}

const manifestCache = new Map<string, { m: AssetsManifest; t: number }>();
const MANIFEST_CACHE_TTL_MS = 60 * 1000;

export async function getManifestCached(baseFolder: string): Promise<AssetsManifest | null> {
  const now = Date.now();
  const hit = manifestCache.get(baseFolder);
  if (hit && now - hit.t < MANIFEST_CACHE_TTL_MS) return hit.m;
  const m = await getManifest(baseFolder);
  if (m) manifestCache.set(baseFolder, { m, t: now });
  return m;
}

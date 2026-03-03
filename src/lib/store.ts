import { SessionData } from "./session";

const STORE_PATH = process.env.STORE_PATH ?? ".data/store.json";

interface StoredSession extends SessionData {
  updatedAt: string;
}

interface StoreData {
  sessions: Record<string, StoredSession>;
  linkToAccount: Record<string, string>;
}

let cache: StoreData | null = null;

async function load(): Promise<StoreData> {
  if (cache) return cache;
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const fullPath = path.join(process.cwd(), STORE_PATH);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    const raw = await fs.readFile(fullPath, "utf-8").catch(() => "{}");
    cache = JSON.parse(raw || "{}") as StoreData;
    if (!cache.sessions) cache.sessions = {};
    if (!cache.linkToAccount) cache.linkToAccount = {};
    return cache;
  } catch {
    cache = { sessions: {}, linkToAccount: {} };
    return cache;
  }
}

async function save() {
  if (!cache) return;
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const fullPath = path.join(process.cwd(), STORE_PATH);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, JSON.stringify(cache, null, 2));
  } catch {
    // ignore
  }
}

export async function getStoredSession(accountId: string): Promise<SessionData | null> {
  const data = await load();
  const s = data.sessions[accountId];
  if (!s) return null;
  return {
    dropboxAccountId: s.dropboxAccountId,
    dropboxAccessToken: s.dropboxAccessToken,
    dropboxRefreshToken: s.dropboxRefreshToken,
    baseFolder: s.baseFolder,
  };
}

export async function setStoredSession(accountId: string, session: SessionData): Promise<void> {
  const data = await load();
  data.sessions[accountId] = {
    ...session,
    updatedAt: new Date().toISOString(),
  };
  await save();
}

export async function setLinkAccount(linkId: string, accountId: string): Promise<void> {
  const data = await load();
  data.linkToAccount[linkId] = accountId;
  await save();
}

export async function getAccountForLink(linkId: string): Promise<string | null> {
  const data = await load();
  return data.linkToAccount[linkId] ?? null;
}

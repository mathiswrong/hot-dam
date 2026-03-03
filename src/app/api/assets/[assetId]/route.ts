import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createDropboxClient,
  listAssetsRecursive,
  metaPathForFile,
  getMetadata,
  writeMetadata,
} from "@/lib/dropbox";
import { deleteManifestFile } from "@/lib/manifest";
import { invalidateAssetsCache } from "@/lib/cache";
import type { AssetMetadata } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;
  const dbx = createDropboxClient(session.dropboxAccessToken);
  const files = await listAssetsRecursive(dbx, session.baseFolder);

  for (const file of files) {
    const metaPath = metaPathForFile(file.path);
    const meta = await getMetadata(dbx, metaPath);
    if (meta?.id === assetId) {
      return NextResponse.json({ asset: { meta, path: file.path } });
    }
    if (file.id === assetId) {
      const effectiveMeta = meta ?? {
        id: file.id,
        path: file.path,
        title: file.name.replace(/\.[^/.]+$/, ""),
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: "owner",
        boards: [],
        comments: [],
      };
      return NextResponse.json({ asset: { meta: effectiveMeta, path: file.path } });
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;
  const body = await request.json();

  const dbx = createDropboxClient(session.dropboxAccessToken);
  const files = await listAssetsRecursive(dbx, session.baseFolder);

  for (const file of files) {
    const metaPath = metaPathForFile(file.path);
    const meta = await getMetadata(dbx, metaPath);
    const currentMeta = meta ?? {
      id: file.id,
      path: file.path,
      title: file.name.replace(/\.[^/.]+$/, ""),
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedBy: "owner",
      boards: [],
      comments: [],
    };

    if (currentMeta.id !== assetId) continue;

    const updated: AssetMetadata = {
      ...currentMeta,
      updatedAt: new Date().toISOString(),
      title: body.title ?? currentMeta.title,
      tags: Array.isArray(body.tags) ? body.tags : currentMeta.tags,
      boards: Array.isArray(body.boards) ? body.boards : currentMeta.boards,
      comments: Array.isArray(body.comments) ? body.comments : currentMeta.comments,
    };

    await writeMetadata(dbx, metaPath, updated);
    return NextResponse.json({ asset: { meta: updated, path: file.path } });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { assetId } = await params;
  const dbx = createDropboxClient(session.dropboxAccessToken);
  const files = await listAssetsRecursive(dbx, session.baseFolder);

  for (const file of files) {
    const metaPath = metaPathForFile(file.path);
    const meta = await getMetadata(dbx, metaPath);
    const match = meta?.id === assetId || file.id === assetId;
    if (!match) continue;

    try {
      await dbx.filesDeleteV2({ path: metaPath });
    } catch {
      // meta file may not exist
    }
    try {
      await dbx.filesDeleteV2({ path: file.path });
    } catch (e) {
      console.error("Asset delete error", e);
      return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
    await deleteManifestFile(session.baseFolder);
    invalidateAssetsCache();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

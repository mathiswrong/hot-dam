import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createDropboxClient,
  listAssetsRecursive,
  metaPathForFile,
  getMetadata,
  writeMetadata,
} from "@/lib/dropbox";
import { v4 as uuidv4 } from "uuid";
import type { AssetMetadata } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;
  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

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

    const comment = {
      id: uuidv4().slice(0, 8),
      authorName: "Owner",
      text,
      createdAt: new Date().toISOString(),
    };

    const updated: AssetMetadata = {
      ...currentMeta,
      updatedAt: new Date().toISOString(),
      comments: [...currentMeta.comments, comment],
    };

    await writeMetadata(dbx, metaPath, updated);
    return NextResponse.json({ comment });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createDropboxClient,
  metaPathForFile,
  writeMetadata,
} from "@/lib/dropbox";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const boardId = (formData.get("boardId") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  const dbx = createDropboxClient(session.dropboxAccessToken);
  const basePath = session.baseFolder;
  const uploadPath = boardId
    ? `${basePath}/assets/${boardId}/${file.name}`
    : `${basePath}/assets/${file.name}`;

  const bytes = await file.arrayBuffer();
  await dbx.filesUpload({
    path: uploadPath,
    contents: Buffer.from(bytes),
    mode: { ".tag": "add" },
  });

  const now = new Date().toISOString();
  const meta = {
    id: uuidv4(),
    path: uploadPath,
    title: file.name.replace(/\.[^/.]+$/, ""),
    tags: [],
    createdAt: now,
    updatedAt: now,
    uploadedBy: "owner",
    boards: boardId ? [boardId] : [],
    comments: [],
  };

  const metaPath = metaPathForFile(uploadPath);
  await writeMetadata(dbx, metaPath, meta);

  return NextResponse.json({ asset: { meta, path: uploadPath } });
}

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createDropboxClient,
  getBoardById,
  writeBoard,
  deleteBoard,
} from "@/lib/dropbox";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { boardId } = await params;
  const dbx = createDropboxClient(session.dropboxAccessToken);
  const board = await getBoardById(dbx, session.baseFolder, boardId);
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  const body = await request.json();
  if (typeof body.name === "string" && body.name.trim()) board.name = body.name.trim();
  if (typeof body.description === "string") board.description = body.description.trim();
  if (typeof body.order === "number") board.order = body.order;
  if (typeof body.folderPath === "string") board.folderPath = body.folderPath.trim() || undefined;
  if (body.coverAssetId !== undefined) board.coverAssetId = body.coverAssetId === null || body.coverAssetId === "" ? null : String(body.coverAssetId);
  board.updatedAt = new Date().toISOString();
  await writeBoard(dbx, session.baseFolder, board);
  return NextResponse.json({ board });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { boardId } = await params;
  const dbx = createDropboxClient(session.dropboxAccessToken);
  const board = await getBoardById(dbx, session.baseFolder, boardId);
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  await deleteBoard(dbx, session.baseFolder, boardId);
  return NextResponse.json({ ok: true });
}

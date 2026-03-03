import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createDropboxClient,
  listBoards,
  getFirstFilePathInFolder,
  writeBoard,
} from "@/lib/dropbox";
import { v4 as uuidv4 } from "uuid";
import type { Board } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dbx = createDropboxClient(session.dropboxAccessToken);
  const boards = await listBoards(dbx, session.baseFolder);

  const boardsWithCovers = await Promise.all(
    boards.map(async (board) => {
      let coverPath: string | undefined;
      if (board.folderPath) {
        coverPath = (await getFirstFilePathInFolder(dbx, board.folderPath)) ?? undefined;
      }
      return { ...board, coverPath };
    })
  );
  return NextResponse.json({ boards: boardsWithCovers });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { name, description, folderPath } = body;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const dbx = createDropboxClient(session.dropboxAccessToken);
  const existingBoards = await listBoards(dbx, session.baseFolder);
  const maxOrder = Math.max(-1, ...existingBoards.map((b) => b.order ?? 0));
  const now = new Date().toISOString();
  const board: Board = {
    id: uuidv4().slice(0, 8),
    name: name.trim(),
    description: (description ?? "").trim(),
    createdAt: now,
    updatedAt: now,
    folderPath: folderPath?.trim() || undefined,
    order: maxOrder + 1,
    filters: { tagsAny: [], fileTypes: [] },
    layout: { view: "grid", sort: { by: "createdAt", direction: "desc" } },
    coverAssetId: null,
  };

  await writeBoard(dbx, session.baseFolder, board);
  return NextResponse.json({ board });
}

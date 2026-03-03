import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { BoardView } from "./BoardView";

async function getBoardData(boardId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (boardId === "all") {
    const res = await fetch(`${base}/api/assets?limit=48`, {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { board: { id: "all", name: "All Assets" }, assets: data.assets ?? [], total: data.total ?? 0 };
  }

  const boardsRes = await fetch(`${base}/api/boards`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  if (!boardsRes.ok) return null;
  const boardsData = await boardsRes.json();
  const board = boardsData.boards?.find((b: { id: string }) => b.id === boardId);
  if (!board && boardId !== "all") return null;

  const assetsRes = await fetch(
    `${base}/api/assets?boardId=${boardId}&limit=48`,
    { cache: "no-store", headers: cookieHeader ? { cookie: cookieHeader } : {} }
  );
  if (!assetsRes.ok) return null;
  const assetsData = await assetsRes.json();

  return { board, assets: assetsData.assets ?? [], total: assetsData.total ?? 0 };
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const data = await getBoardData(boardId);
  if (!data) notFound();

  return (
    <BoardView
      boardId={boardId}
      boardName={data.board.name}
      initialAssets={data.assets}
      initialTotal={data.total}
    />
  );
}

import { cookies } from "next/headers";
import { BoardView } from "../boards/[boardId]/BoardView";

async function getUncategorizedAssets() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/assets?uncategorized=true&limit=48`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  if (!res.ok) return { assets: [], total: 0 };
  const data = await res.json();
  return { assets: data.assets ?? [], total: data.total ?? 0 };
}

export default async function UncategorizedPage() {
  const { assets, total } = await getUncategorizedAssets();

  return (
    <BoardView
      boardId="uncategorized"
      boardName="Uncategorized"
      initialAssets={assets}
      initialTotal={total}
    />
  );
}

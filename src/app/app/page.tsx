import { cookies } from "next/headers";
import { BoardsDashboard } from "./BoardsDashboard";

async function getBoards() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/boards`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  if (!res.ok) return { boards: [] };
  const data = await res.json();
  return data;
}

export default async function AppPage() {
  const { boards } = await getBoards();

  return <BoardsDashboard boards={boards} />;
}

import { notFound } from "next/navigation";
import { PublicShareView } from "./PublicShareView";

async function getShareData(linkId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/s/${linkId}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const { linkId } = await params;
  const data = await getShareData(linkId);
  if (!data) notFound();

  return <PublicShareView data={data} linkId={linkId} />;
}

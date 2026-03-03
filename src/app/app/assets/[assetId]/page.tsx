import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { AssetDetail } from "./AssetDetail";

async function getAsset(assetId: string) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/assets/${assetId}`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.asset;
}

export default async function AssetPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const asset = await getAsset(assetId);
  if (!asset) notFound();

  return (
    <div>
      <Link
        href="/app"
        className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
      >
        ← Back to boards
      </Link>
      <AssetDetail asset={asset} />
    </div>
  );
}

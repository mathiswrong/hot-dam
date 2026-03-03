import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { setLinkAccount } from "@/lib/store";
import {
  createDropboxClient,
  listLinks,
  writeLink,
  generateLinkId,
} from "@/lib/dropbox";
import type { ShareLink } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dbx = createDropboxClient(session.dropboxAccessToken);
  const links = await listLinks(dbx, session.baseFolder);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.json({
    links: links.map((l) => ({
      ...l,
      url: `${appUrl}/s/${l.id}`,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, targetId, allowDownload } = body;

  if (!type || !targetId) {
    return NextResponse.json({ error: "type and targetId required" }, { status: 400 });
  }

  const link: ShareLink = {
    id: generateLinkId(),
    type,
    targetId,
    createdAt: new Date().toISOString(),
    permissions: {
      allowDownload: allowDownload ?? true,
      allowComments: false,
    },
  };

  const dbx = createDropboxClient(session.dropboxAccessToken);
  await writeLink(dbx, session.baseFolder, link);
  await setLinkAccount(link.id, session.dropboxAccountId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.json({
    link,
    url: `${appUrl}/s/${link.id}`,
  });
}

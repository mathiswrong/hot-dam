import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createDropboxClient,
  getLinkById,
  writeLink,
} from "@/lib/dropbox";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const session = await getSession();
  if (!session?.dropboxAccessToken || !session.baseFolder) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { linkId } = await params;
  const dbx = createDropboxClient(session.dropboxAccessToken);
  const link = await getLinkById(dbx, session.baseFolder, linkId);

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const allowDownload = body.allowDownload;
  if (typeof allowDownload === "boolean") {
    link.permissions.allowDownload = allowDownload;
  }

  await writeLink(dbx, session.baseFolder, link);
  return NextResponse.json({ link });
}

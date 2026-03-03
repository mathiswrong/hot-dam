import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStoredSession, getAccountForLink } from "@/lib/store";
import { createDropboxClient, getLinkById } from "@/lib/dropbox";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path");
  const linkId = searchParams.get("linkId");

  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  let session = await getSession();
  if (!session && linkId) {
    const accountId = await getAccountForLink(linkId);
    if (accountId) {
      const stored = await getStoredSession(accountId);
      if (stored) {
        const dbx = createDropboxClient(stored.dropboxAccessToken);
        const link = await getLinkById(dbx, stored.baseFolder!, linkId);
        if (link?.permissions.allowDownload) {
          session = stored;
        }
      }
    }
  }

  if (!session?.dropboxAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbx = createDropboxClient(session.dropboxAccessToken);

  try {
    const res = await dbx.filesDownload({ path });
    const anyResult = res.result as any;
    const blobOrBinary = anyResult.fileBlob ?? anyResult.fileBinary;
    if (!blobOrBinary) {
      return NextResponse.json({ error: "Download failed" }, { status: 500 });
    }

    let buf: Buffer;
    if (blobOrBinary && typeof blobOrBinary.arrayBuffer === "function") {
      buf = Buffer.from(await blobOrBinary.arrayBuffer());
    } else if (Buffer.isBuffer(blobOrBinary)) {
      buf = blobOrBinary;
    } else {
      buf = Buffer.from(blobOrBinary as string);
    }

    const filename =
      anyResult.name ?? path.split("/").pop() ?? "download";

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

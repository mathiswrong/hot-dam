import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStoredSession, getAccountForLink } from "@/lib/store";
import { createDropboxClient } from "@/lib/dropbox";
import { getCachedThumb, setCachedThumb } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path");
  const linkId = searchParams.get("linkId");

  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  const sizeParam = searchParams.get("size");
  const size = sizeParam === "large" ? "w960h640" : "w256h256";
  const cacheKey = `${path}|${size}`;
  const cached = getCachedThumb(cacheKey);
  if (cached) {
    return new NextResponse(new Uint8Array(cached.buf), {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  let session = await getSession();
  if (!session && linkId) {
    const accountId = await getAccountForLink(linkId);
    if (accountId) {
      session = await getStoredSession(accountId);
    }
  }

  if (!session?.dropboxAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbx = createDropboxClient(session.dropboxAccessToken);

  try {
    const res = await dbx.filesGetThumbnailV2({
      resource: { ".tag": "path", path },
      format: { ".tag": "jpeg" },
      size: { ".tag": size as "w256h256" | "w960h640" },
    });

    const anyResult = res.result as { fileBlob?: Blob; fileBinary?: Buffer };
    const blobOrBinary = anyResult.fileBlob ?? anyResult.fileBinary;
    if (!blobOrBinary) {
      return NextResponse.json({ error: "No thumbnail" }, { status: 404 });
    }

    let buf: Buffer;
    if (blobOrBinary && typeof (blobOrBinary as Blob).arrayBuffer === "function") {
      buf = Buffer.from(await (blobOrBinary as Blob).arrayBuffer());
    } else if (Buffer.isBuffer(blobOrBinary)) {
      buf = blobOrBinary;
    } else {
      buf = Buffer.from(blobOrBinary as unknown as ArrayBuffer);
    }

    setCachedThumb(cacheKey, { buf, contentType: "image/jpeg" });

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Thumbnail not available" }, { status: 404 });
  }
}

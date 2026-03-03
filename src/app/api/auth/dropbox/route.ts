import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.DROPBOX_APP_KEY;
  const redirectUri = process.env.DROPBOX_REDIRECT_URI;

  if (!key || !redirectUri) {
    return NextResponse.json(
      { error: "Dropbox app not configured" },
      { status: 500 }
    );
  }

  // Random state to protect the flow
  const state = Buffer.from(crypto.randomUUID()).toString("base64url");

  const params = new URLSearchParams({
    client_id: key,
    redirect_uri: redirectUri,
    response_type: "code",
    token_access_type: "offline",
    state,
  });

  const res = NextResponse.redirect(
    `https://www.dropbox.com/oauth2/authorize?${params.toString()}`
  );

  // Save state in a cookie so we can verify it on callback
  res.cookies.set("dropbox_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return res;
}
import { NextRequest, NextResponse } from "next/server";
import { Dropbox, DropboxAuth } from "dropbox";
import { setSession } from "@/lib/session";
import { setStoredSession } from "@/lib/store";
import { ensureBaseStructure } from "@/lib/dropbox";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieState = request.cookies.get("dropbox_oauth_state")?.value;

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  const key = process.env.DROPBOX_APP_KEY;
  const secret = process.env.DROPBOX_APP_SECRET;
  const redirectUri = process.env.DROPBOX_REDIRECT_URI;

  if (!key || !secret || !redirectUri) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const dbxAuth = new DropboxAuth({
    clientId: key,
    clientSecret: secret,
    fetch,
  });
  const tokenRes = await dbxAuth.getAccessTokenFromCode(redirectUri, code);
  const token = tokenRes.result as { access_token: string; refresh_token?: string };

  const dbxWithToken = new Dropbox({ accessToken: token.access_token, fetch });
  const accountRes = await dbxWithToken.usersGetCurrentAccount();
  const accountId = accountRes.result.account_id;

  const baseFolder = "/Hot DAM";
  await ensureBaseStructure(dbxWithToken, baseFolder);

  const sessionData = {
    dropboxAccountId: accountId,
    dropboxAccessToken: token.access_token,
    dropboxRefreshToken: token.refresh_token,
    baseFolder,
  };
  await setSession(sessionData);
  await setStoredSession(accountId, sessionData);

  const res = NextResponse.redirect(new URL("/app", request.url));
  res.cookies.delete("dropbox_oauth_state");
  return res;
}

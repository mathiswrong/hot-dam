import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  await clearSession();
  const origin = request.headers.get("origin") ?? request.nextUrl.origin ?? "http://localhost:3000";
  return NextResponse.redirect(`${origin}/`);
}

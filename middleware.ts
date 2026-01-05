//hopefully this change allows the forgot password to work, for some reason it 
//doesnt for others but it does for me, doing this just in case.
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const CANONICAL_HOST = "pattyshousecleaning.vercel.app";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  //Allow localhost during development
  if (!host.startsWith("localhost") && host !== CANONICAL_HOST) {
    //redirect any other Vercel alias to the acutal used domain
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  //keep Supabase session cookies in sync (which is what i already do)
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
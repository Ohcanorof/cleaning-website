import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authConfirmRatelimit } from "@/lib/ratelimit";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getClientIp, rateLimitHeaders, safeNextPath } from "@/lib/security";

/**
 * handles Supabase email links (invite/recovery/magiclink).
 *
 * supports both token_hash + type (verifyOtp) and code (PKCE) (exchangeCodeForSession)
 * after verifying, redirects to `next` (default: /owner/update-password).
 */

function isEmailOtpType(value: string): value is EmailOtpType{
  return [
    "signup",
    "invite",
    "magiclink",
    "recovery",
    "email_change",
    "email",
  ].includes(value);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;

  //rate limit to prevent brute force token probing.
  const ip = getClientIp(req);
  const lim = await authConfirmRatelimit.limit(`ip:${ip}`);
  if (!lim.success) {
    //for a redirect endpoint
    return Response.json(
      { error: "Too many requests. Please wait a bit and try again." },
      { status: 429, headers: rateLimitHeaders(lim) }
    );
  }

  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const code = url.searchParams.get("code");

  //only allow internal paths
  const next = safeNextPath(url.searchParams.get("next"), "/owner/update-password");

  const supabase = await createClient();

  //newer PKCE flow
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/owner/login?error=invalid_link`);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  //roken_hash flow
  if (token_hash && type) {
    if(!isEmailOtpType(type)){
      return NextResponse.redirect(`${origin}/owner/login?error=invalid_link`)
    }
    const {error} = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      return NextResponse.redirect(`${origin}/owner/login?error=invalid_link`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/owner/login?error=missing_token`);
}

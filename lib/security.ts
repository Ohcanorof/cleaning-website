/**
 * Security utilities used by api routes.
 * consistent json error responses
 * same origin enforcement for state changing endpoints
 * safe redirect handling
 * basic request parsing limits
 */

export function getClientIp(req: Request) {
  // Vercel/Proxies commonly set x-forwarded-for
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function jsonError(
  status: number,
  message: string,
  extra?: Record<string, unknown>,
  headers?: HeadersInit
) {
  return Response.json(
    { error: message, ...(extra ?? {}) },
    { status, headers }
  );
}

export function rateLimitHeaders(params: {
  limit?: number;
  remaining?: number;
  reset?: number; //epoch ms
}) {
  const h = new Headers();
  if (typeof params.limit === "number") h.set("X-RateLimit-Limit", String(params.limit));
  if (typeof params.remaining === "number")
    h.set("X-RateLimit-Remaining", String(params.remaining));
  if (typeof params.reset === "number") {
    h.set("X-RateLimit-Reset", String(params.reset));
    //retry After expects seconds.
    const retryAfterSeconds = Math.max(1, Math.ceil((params.reset - Date.now()) / 1000));
    h.set("Retry-After", String(retryAfterSeconds));
  }
  return h;
}

//some basic origin check for browser requests.
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return null; //non-browser clients

  //host header isn't always present in edge/runtime, but when it is, it is used
  const host = req.headers.get("host");
  if (!host) return null;

  try {
    const o = new URL(origin);
    if (o.host !== host) {
      return jsonError(403, "Cross-site request blocked.");
    }
  } catch {
    return jsonError(400, "Invalid Origin header.");
  }

  return null;
}

//reads JSON with a small size limit, prevents oversized bodies from being parsed
export async function readJson(req: Request, maxBytes = 16_384) {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength && contentLength > maxBytes) {
    throw new Error("payload_too_large");
  }

  //enforce JSON ish input. Some clients may omit charset etc, so only the prefix is checked
  const ct = req.headers.get("content-type") ?? "";
  if (ct && !ct.toLowerCase().startsWith("application/json")) {
    throw new Error("unsupported_media_type");
  }

  return await req.json();
}

// Avoid open-redirect: only allow site-internal paths like "/owner"
export function safeNextPath(next: string | null | undefined, fallback = "/") {
  if (!next) return fallback;
  const v = next.toString();
  //must be a relative path
  if (!v.startsWith("/")) return fallback;
  //disallow protocol-relative URLs like "//evil.com" lol
  if (v.startsWith("//")) return fallback;
  //disallow obvious schemes in case someone passes "/\nhttps://..."
  if (v.includes("://")) return fallback;
  return v;
}

import { createClient } from "@/lib/supabase/server";
import { ownerActionRatelimit } from "@/lib/ratelimit";
import {
  assertSameOrigin,
  getClientIp,
  jsonError,
  rateLimitHeaders,
  readJson,
} from "@/lib/security";
import { validateStrict, type Schema } from "@/lib/validation";

type ReservationStatus = "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELED";

type Body = {
  id: string;
  status: ReservationStatus;
  finalPrice?: number; // required when status = COMPLETED
};

const BodySchema: Schema<Body> = {
  id: { type: "string", required: true, min: 1, max: 64 },
  status: { type: "enum", required: true, values: ["NEW", "CONFIRMED", "COMPLETED", "CANCELED"] as const },
  finalPrice: { type: "number", required: false, min: 0, max: 10000, decimals: 2 },
};

function canTransition(from: ReservationStatus, to: ReservationStatus) {
  const allowed: Record<ReservationStatus, ReservationStatus[]> = {
    NEW: ["CONFIRMED", "CANCELED"],
    CONFIRMED: ["COMPLETED", "CANCELED"],
    COMPLETED: [],
    CANCELED: [],
  };
  return allowed[from]?.includes(to) ?? false;
}

export async function PATCH(req: Request) {
  try {
    // CSRF protection for browser requests.
    const originErr = assertSameOrigin(req);
    if (originErr) return originErr;

    // Rate limit by IP early to reduce auth probing.
    const ip = getClientIp(req);
    const ipLimit = await ownerActionRatelimit.limit(`ip:${ip}`);
    if (!ipLimit.success) {
      return jsonError(
        429,
        "Too many requests. Please wait a bit and try again.",
        { limit: ipLimit.limit, remaining: ipLimit.remaining, reset: ipLimit.reset },
        rateLimitHeaders(ipLimit)
      );
    }

    const raw = await readJson(req, 8_192);
    const parsed = validateStrict(raw, BodySchema);
    if (!parsed.ok) {
      return jsonError(400, parsed.error, parsed.details ? { details: parsed.details } : undefined);
    }

    const body = parsed.data;
    const id = body.id;
    const next = body.status;

    const supabase = await createClient();

    // Only admins can update reservation status / final price
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (userErr || !userId) {
      return jsonError(401, "Not authenticated.");
    }

    // Additional user-based throttling (prevents a single account from spamming).
    const userLimit = await ownerActionRatelimit.limit(`user:${userId}`);
    if (!userLimit.success) {
      return jsonError(
        429,
        "Too many requests. Please wait a bit and try again.",
        { limit: userLimit.limit, remaining: userLimit.remaining, reset: userLimit.reset },
        rateLimitHeaders(userLimit)
      );
    }

    const { data: adminRow, error: adminErr } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminErr || !adminRow) {
      return jsonError(403, "Not authorized.");
    }

    // fetch current status so we can enforce transitions server-side
    const { data: current, error: curErr } = await supabase
      .from("reservations")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (curErr || !current) {
      return jsonError(404, "Reservation not found.");
    }

    const currentStatus = current.status as ReservationStatus;

    if (currentStatus === next) {
      return Response.json({ ok: true }); // no-op
    }

    if (!canTransition(currentStatus, next)) {
      return jsonError(400, `Invalid status change: ${currentStatus} → ${next}`);
    }

    const update: Record<string, any> = { status: next };

    // final price only allowed when completing
    if (next === "COMPLETED") {
      // finalPrice validated by schema, but must be present when completing.
      if (typeof body.finalPrice !== "number") {
        return jsonError(400, "finalPrice is required when completing.");
      }
      update.final_price = body.finalPrice; // DB column is snake_case
    } else if (typeof body.finalPrice !== "undefined") {
      return jsonError(400, "finalPrice can only be provided when status is COMPLETED.");
    }

    const { data: updated, error: updateErr } = await supabase
      .from("reservations")
      .update(update)
      .eq("id", id)
      .select("id, status, final_price")
      .maybeSingle();

    if (updateErr) {
      console.error("Update reservation error:", updateErr);
      return jsonError(500, "Failed to update reservation.");
    }

    return Response.json({ ok: true, reservation: updated });
  } catch (err) {
    console.error("reservation-status PATCH error:", err);
    if (err instanceof Error) {
      if (err.message === "payload_too_large") return jsonError(413, "Payload too large.");
      if (err.message === "unsupported_media_type")
        return jsonError(415, "Unsupported content type. Use application/json.");
    }
    return jsonError(400, "Invalid request.");
  }
}
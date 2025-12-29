import { createClient } from "@/lib/supabase/server";

type ReservationStatus = "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELED";

type Body = {
  id: string;
  status: ReservationStatus;
  finalPrice?: number; // required when status = COMPLETED
};

const allowedStatuses = new Set<ReservationStatus>([
  "NEW",
  "CONFIRMED",
  "COMPLETED",
  "CANCELED",
]);

function canTransition(from: ReservationStatus, to: ReservationStatus) {
  const allowed: Record<ReservationStatus, ReservationStatus[]> = {
    NEW: ["CONFIRMED", "CANCELED"],
    CONFIRMED: ["COMPLETED", "CANCELED"],
    COMPLETED: [],
    CANCELED: [],
  };
  return allowed[from]?.includes(to) ?? false;
}

// --- SECURITY HELPERS ---
function clampString(s: unknown, max: number) {
  const v = (typeof s === "string" ? s : "").trim();
  return v.length > max ? v.slice(0, max) : v;
}

function parseMoney(n: unknown) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  // bounds
  if (x < 0 || x > 10000) return null;
  // round to 2 decimals
  return Math.round(x * 100) / 100;
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const id = clampString(body?.id, 64);
    if (!id) {
      return Response.json({ error: "Missing reservation id." }, { status: 400 });
    }

    const next = body.status;
    if (!allowedStatuses.has(next)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }

    const supabase = await createClient();

    // Only admins can update reservation status / final price
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (userErr || !userId) {
      return Response.json({ error: "Not authenticated." }, { status: 401 });
    }

    const { data: adminRow, error: adminErr } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (adminErr || !adminRow) {
      return Response.json({ error: "Not authorized." }, { status: 403 });
    }

    // fetch current status so we can enforce transitions server-side
    const { data: current, error: curErr } = await supabase
      .from("reservations")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (curErr || !current) {
      return Response.json({ error: "Reservation not found." }, { status: 404 });
    }

    const currentStatus = current.status as ReservationStatus;

    if (currentStatus === next) {
      return Response.json({ ok: true }); // no-op
    }

    if (!canTransition(currentStatus, next)) {
      return Response.json(
        { error: `Invalid status change: ${currentStatus} → ${next}` },
        { status: 400 }
      );
    }

    const update: Record<string, any> = { status: next };

    // final price only allowed when completing
    if (next === "COMPLETED") {
      const money = parseMoney(body.finalPrice);

      if (money === null) {
        return Response.json(
          { error: "finalPrice is required when completing and must be between 0 and 10000." },
          { status: 400 }
        );
      }

      update.final_price = money; // DB column is snake_case
    } else if (typeof body.finalPrice !== "undefined") {
      return Response.json(
        { error: "finalPrice can only be provided when status is COMPLETED." },
        { status: 400 }
      );
    }

    const { data: updated, error: updateErr } = await supabase
      .from("reservations")
      .update(update)
      .eq("id", id)
      .select("id, status, final_price")
      .maybeSingle();

    if (updateErr) {
      console.error("Update reservation error:", updateErr);
      return Response.json({ error: "Failed to update reservation." }, { status: 500 });
    }

    return Response.json({ ok: true, reservation: updated });
  } catch (err) {
    console.error("reservation-status PATCH error:", err);
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
}
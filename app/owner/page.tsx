import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReservationActions from "./ReservationActions";
import OwnerFilters from "./OwnerFilters";

//reservation row type
type ReservationStatus = "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELED";
type ReservationRow = {
  id: string;
  created_at: string;
  status: ReservationStatus;
  confirmation_code: string;
  service_name: string;
  service_price: number;
  requested_date: string | null;
  time_window: string | null;
  notes: string | null;
  full_name: string;
  phone: string;
  email: string;
  address: string;
};

export default async function OwnerPage({searchParams,}: {searchParams?: Promise<{status?: string; q?: string}>;}) {
  const supabase = await createClient();

  //use claims-based auth check on server-side protection :contentReference[oaicite:9]{index=9}
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims ? claimsData.claims.sub : null;

  if (!userId) {
    redirect("/owner/login?next=/owner");
  }

  //check if this user in admin whitelist
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!adminRow) {
    //logged in, but not allowed
    redirect("/owner/login?next=/owner");
  }

  const sp = (await searchParams) ?? {};
  const statusParam = (sp.status ?? "active").toLowerCase();
  const q = (sp.q ?? "").trim();

  const statusToList: Record<string, ReservationStatus[]> = {
    active: ["NEW", "CONFIRMED"],
    new: ["NEW"],
    confirmed: ["CONFIRMED"],
    completed: ["COMPLETED"],
    canceled: ["CANCELED"],
    all: ["NEW", "CONFIRMED", "COMPLETED", "CANCELED"],
  };    

  const statuses = statusToList[statusParam] ?? statusToList.active;

  //adds search ability
  let query = supabase
    .from("reservations")
    .select(
      "id, created_at, status, confirmation_code, service_name, service_price, requested_date, time_window, notes, full_name, phone, email, address"
    )
    .in("status", statuses)
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    query = query.or(
      [
        `confirmation_code.ilike.%${q}%`,
        `full_name.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `address.ilike.%${q}%`,
        `service_name.ilike.%${q}%`,
      ].join(",")
    );
  }

  const { data, error } = await query;

  const reservations = (data ?? []) as ReservationRow[];

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl border-2 border-black p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-black/80">Owner Dashboard</h1>
              <p className="mt-1 text-sm text-black/60">
                Active reservations (NEW / CONFIRMED)
              </p>
            </div>

            <div className="text-xs text-black/60">
              Showing {reservations.length} of up to 50
            </div>
          </div>

          <OwnerFilters />

          {error ? (
            <div className="mt-6 rounded-xl border-2 border-black p-4">
              <p className="text-sm text-red-600">Error loading reservations.</p>
              <pre className="mt-2 overflow-auto text-xs text-black/60">{error.message}</pre>
            </div>
          ) : reservations.length === 0 ? (
            <div className="mt-6 rounded-xl border-2 border-black p-6 text-sm text-black/60">
              No active reservations yet.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {reservations.map((r) => (
                <div key={r.id} className="rounded-xl border-2 border-black p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-semibold text-black/80">
                      {r.service_name} — ${Number(r.service_price).toFixed(2)}
                    </div>

                    <div className="text-xs text-black/60">
                      Code: <span className="font-semibold">{r.confirmation_code}</span>{" "}
                      · Status: <span className="font-semibold">{r.status}</span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="text-sm text-black/70">
                      <div className="text-xs text-black/50">Customer</div>
                      <div className="font-medium">{r.full_name}</div>
                      <div className="text-xs">{r.phone}</div>
                      <div className="text-xs">{r.email}</div>
                    </div>

                    <div className="text-sm text-black/70">
                      <div className="text-xs text-black/50">Requested</div>
                      <div>
                        {r.requested_date ?? "(no date)"}{" "}
                        {r.time_window ? `· ${r.time_window}` : ""}
                      </div>

                      <div className="mt-2 text-xs text-black/50">Address</div>
                      <div className="text-xs">{r.address}</div>
                    </div>
                  </div>

                  {r.notes ? (
                    <div className="mt-3 text-xs text-black/60">
                      <span className="font-semibold">Notes:</span> {r.notes}
                    </div>
                  ) : null}

                  <ReservationActions id={r.id} currentStatus= {r.status}/>

                  <div className="mt-3 text-[11px] text-black/40">
                    Created: {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
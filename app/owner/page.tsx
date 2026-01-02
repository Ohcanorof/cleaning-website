import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OwnerHeaderActions from "./OwnerHeaderActions";
import ReservationActions from "./ReservationActions";
import OwnerFilters from "./OwnerFilters";
import OwnerPagination from "./OwnerPagination";
import WeekNav from "./WeekNav";

//reservation row type
type ReservationStatus = "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELED";
type ReservationRow = {
  id: string;
  created_at: string;
  status: ReservationStatus;
  confirmation_code: string;
  service_name: string;
  service_min_price: number | null;
  service_max_price: number | null;
  final_price: number | null;
  requested_date: string | null; // yyyy-mm-dd
  time_window: string | null;
  notes: string | null;
  full_name: string;
  phone: string;
  email: string;
  address: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

function mondayOf(dateYMD: string) {
  const d = new Date(dateYMD + "T00:00:00");
  const day = d.getDay(); // 0 is sunday
  const diff = day === 0 ? -6 : 1 - day; // move to monday
  d.setDate(d.getDate() + diff);
  return d;
}

export default async function OwnerPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const supabase = await createClient();
  const sp = (await searchParams) ?? {};

  //Auth gate
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  if (!userId) redirect("/owner/login?next=/owner");

  //admin gate
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!adminRow) redirect("/owner/login?next=/owner");
  //normalized filters
  const view = first(sp.view) === "calendar" ? "calendar" : "list";
  const q = (first(sp.q) ?? "").toString().trim();
  const sort = (first(sp.sort) ?? "created_desc").toString();
  const page = Math.max(1, Number(first(sp.page) ?? "1"));

  //status param comes from OwnerFilters: "active", "new", "confirmed", "completed", "canceled", "all"
  const statusParam = (first(sp.status) ?? "active").toLowerCase();

  const statusToList: Record<string, ReservationStatus[]> = {
    active: ["NEW", "CONFIRMED"],
    new: ["NEW"],
    confirmed: ["CONFIRMED"],
    completed: ["COMPLETED"],
    canceled: ["CANCELED"],
    all: ["NEW", "CONFIRMED", "COMPLETED", "CANCELED"],
  };

  const statuses = statusToList[statusParam] ?? statusToList.active;

  //sort config (list view)
  const sortConfig =
    sort === "created_asc"
      ? { col: "created_at", asc: true }
      : sort === "requested_asc"
      ? { col: "requested_date", asc: true }
      : sort === "requested_desc"
      ? { col: "requested_date", asc: false }
      : { col: "created_at", asc: false };

  const PAGE_SIZE = 20;

  //the base query
  let query = supabase
    .from("reservations")
    .select(
      "id, created_at, status, confirmation_code, service_name, service_min_price, service_max_price, final_price, requested_date, time_window, notes, full_name, phone, email, address"
    )
    .in("status", statuses);

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

  //calendar week range
  const weekParam = first(sp.week) ?? toYMD(new Date());
  const weekStartDate = mondayOf(weekParam);
  const weekStart = toYMD(weekStartDate);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEnd = toYMD(weekEndDate);

  if (view === "calendar") {
    //Only show items with a requested_date in the current week
    query = query
      .not("requested_date", "is", null)
      .gte("requested_date", weekStart)
      .lte("requested_date", weekEnd)
      .order("requested_date", { ascending: true })
      .order("created_at", { ascending: false });
  } else {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    query = query.order(sortConfig.col, { ascending: sortConfig.asc }).range(from, to);
  }

  const { data: reservationsRaw } = await query;
  const reservations = (reservationsRaw ?? []) as ReservationRow[];

  const hasMore = view === "list" && reservations.length === PAGE_SIZE;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl border-2 border-transparent p-2 sm:p-6">
          <OwnerHeaderActions />

          {/*no props for the OwnerFilters*/}
          <OwnerFilters />

          {view === "calendar" ? (
            <>
              {/*WeekNav expects weekStart here*/}
              <WeekNav weekStart={weekStart} />

              <div className="mt-6 space-y-3">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const day = new Date(weekStartDate);
                  day.setDate(day.getDate() + idx);
                  const dayYMD = toYMD(day);

                  const items = reservations.filter((r) => r.requested_date === dayYMD);

                  return (
                    <div key={dayYMD} className="rounded-xl border border-transparent bg-card-muted shadow-sm">
                      <div className="border-b border-black/10 px-4 py-3 text-sm font-semibold text-foreground/80">
                        {day.toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>

                      <div className="px-4 py-4 space-y-3">
                        {items.length === 0 ? (
                          <div className="text-xs text-black/50">No quote requests scheduled.</div>
                        ) : (
                          items.map((r) => (
                            <div
                              key={r.id}
                              className="rounded-xl border border-transparent bg-card shadow-sm px-4 py-3"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm font-semibold text-black/80">
                                  {r.service_name} — {r.full_name}
                                </div>

                                <div className="text-xs text-black/60">{r.time_window ?? ""}</div>
                              </div>

                              {r.notes ? (
                                <div className="mt-2 text-xs text-black/60">
                                  <span className="font-semibold">Notes:</span> {r.notes}
                                </div>
                              ) : null}

                              <div className="mt-3">
                                <ReservationActions id={r.id} currentStatus={r.status} />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {reservations.length === 0 ? (
                <div className="mt-6 rounded-xl border-2 border-transparent bg-card-muted p-4 text-sm text-black/60 shadow-sm">
                  No quote requests this week.
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {reservations.map((r) => (
                  <div key={r.id} className="rounded-xl border border-transparent bg-card-muted p-5 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-semibold text-black/80">
                        {r.service_name} — Est. ${Number(r.service_min_price).toFixed(0)}–$
                        {Number(r.service_max_price).toFixed(0)}
                      </div>

                      {typeof r.final_price === "number" ? (
                        <div className="mt-1 text-xs text-black/60">
                          Final price charged:{" "}
                          <span className="font-semibold">${Number(r.final_price).toFixed(2)}</span>
                        </div>
                      ) : null}

                      <div className="text-xs text-black/60">
                        Code: <span className="font-semibold">{r.confirmation_code}</span> · Status:{" "}
                        <span className="font-semibold">{r.status}</span>
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
                        <div className="text-xs text-black/50">Quote Request</div>
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

                    <ReservationActions id={r.id} currentStatus={r.status} />

                    <div className="mt-3 text-[11px] text-black/40">
                      Created: {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <OwnerPagination page={page} hasMore={hasMore} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
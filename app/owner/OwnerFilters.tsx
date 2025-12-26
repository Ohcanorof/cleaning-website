"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const OPTIONS = [
  { value: "active", label: "Active (NEW + CONFIRMED)" },
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
  { value: "all", label: "All" },
];

export default function OwnerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "active";
  const currentQ = searchParams.get("q") ?? "";

  const [status, setStatus] = useState(currentStatus);
  const [q, setQ] = useState(currentQ);

  useEffect(() => setStatus(currentStatus), [currentStatus]);
  useEffect(() => setQ(currentQ), [currentQ]);

  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  function apply(nextStatus: string, nextQ: string) {
    const p = new URLSearchParams(params);

    // status
    if (!nextStatus || nextStatus === "active") p.delete("status");
    else p.set("status", nextStatus);

    // search
    const trimmed = nextQ.trim();
    if (!trimmed) p.delete("q");
    else p.set("q", trimmed);

    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    apply(status, q);
  }

  function clear() {
    setStatus("active");
    setQ("");
    router.push(pathname);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="block text-xs text-black/60">Search</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, phone, email, address, code, service..."
          className="mt-1 w-full rounded-lg border-2 border-black px-3 py-2 text-sm text-black/70"
        />
      </div>

      <div className="sm:w-72">
        <label className="block text-xs text-black/60">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-sm text-black/70"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg border-2 border-black px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black hover:text-white transition"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border-2 border-black px-4 py-2 text-sm font-semibold text-black/70 hover:bg-black hover:text-white transition"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
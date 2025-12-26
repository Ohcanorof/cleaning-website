"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELED";

export default function ReservationActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: Status;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<Status | null>(null);
  const [err, setErr] = useState<string>("");

  async function setStatus(nextStatus: Status) {
    setErr("");
    setLoading(nextStatus);

    try {
      const res = await fetch("/api/reservation-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to update.");

      //refresh the server component list
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  const baseBtn =
    "rounded-lg border-2 border-black px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black hover:text-white transition disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black/70";

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={baseBtn}
          disabled={loading !== null || currentStatus === "CONFIRMED"}
          onClick={() => setStatus("CONFIRMED")}
        >
          {loading === "CONFIRMED" ? "Confirming..." : "Confirm"}
        </button>

        <button
          type="button"
          className={baseBtn}
          disabled={loading !== null || currentStatus === "COMPLETED"}
          onClick={() => setStatus("COMPLETED")}
        >
          {loading === "COMPLETED" ? "Completing..." : "Complete"}
        </button>

        <button
          type="button"
          className={baseBtn}
          disabled={loading !== null || currentStatus === "CANCELED"}
          onClick={() => setStatus("CANCELED")}
        >
          {loading === "CANCELED" ? "Canceling..." : "Cancel"}
        </button>
      </div>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}
    </div>
  );
}
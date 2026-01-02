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

  async function setStatus(nextStatus: Status, finalPrice?: number) {
    setErr("");
    setLoading(nextStatus);

    try {
      const res = await fetch("/api/reservation-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: nextStatus,
          ...(typeof finalPrice === "number" ? { finalPrice } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to update.");

      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  async function onComplete() {
    const raw = window.prompt("Enter the final price charged (example: 220.00)");
    if (raw === null) return; //canceled

    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      setErr("Please enter a valid non-negative number for the final price.");
      return;
    }

    await setStatus("COMPLETED", n);
  }

  const baseBtn =
    "rounded-xl px-3 py-2 text-xs font-semibold transition shadow-sm disabled:opacity-50";

  const primaryBtn =
    baseBtn +
    " bg-accent text-accent-foreground hover:opacity-90";

  const secondaryBtn =
    baseBtn +
    " bg-card text-foreground/80 ring-1 ring-black/10 hover:bg-card-muted";

  const canConfirm = currentStatus === "NEW";
  const canComplete = currentStatus === "CONFIRMED";
  const canCancel = currentStatus === "NEW" || currentStatus === "CONFIRMED";

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={primaryBtn}
          disabled={loading !== null || !canConfirm}
          onClick={() => setStatus("CONFIRMED")}
          title={!canConfirm ? "Only NEW requests can be confirmed." : undefined}
        >
          {loading === "CONFIRMED" ? "Confirming..." : "Confirm"}
        </button>

        <button
          type="button"
          className={primaryBtn}
          disabled={loading !== null || !canComplete}
          onClick={onComplete}
          title={!canComplete ? "Only CONFIRMED requests can be completed." : undefined}
        >
          {loading === "COMPLETED" ? "Completing..." : "Complete"}
        </button>

        <button
          type="button"
          className={secondaryBtn}
          disabled={loading !== null || !canCancel}
          onClick={() => setStatus("CANCELED")}
          title={!canCancel ? "Only NEW/CONFIRMED requests can be canceled." : undefined}
        >
          {loading === "CANCELED" ? "Canceling..." : "Cancel"}
        </button>
      </div>

      {err ? <div className="mt-2 text-xs text-red-600">{err}</div> : null}
    </div>
  );
}
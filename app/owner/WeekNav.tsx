"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";

export default function WeekNav({ weekStart }: { weekStart: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function shift(days: number) {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + days);
    const next = d.toISOString().slice(0, 10);

    const p = new URLSearchParams(sp.toString());
    p.set("week", next);
    p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => shift(-7)}
        className="rounded-lg border-2 border-black px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black hover:text-white transition"
      >
        ← Prev week
      </button>

      <div className="text-sm font-semibold text-black/70">Week of {weekStart}</div>

      <button
        type="button"
        onClick={() => shift(7)}
        className="rounded-lg border-2 border-black px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black hover:text-white transition"
      >
        Next week →
      </button>
    </div>
  );
}
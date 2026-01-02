"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";

export default function OwnerPagination({
  page,
  hasMore,
}: {
  page: number;
  hasMore: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!hasMore) return null;

  function loadMore() {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(page + 1));
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        onClick={loadMore}
        className="rounded-xl border-2 border-transparent bg-card px-5 py-2 text-sm font-semibold text-black/70 shadow-sm hover:bg-card-muted transition"
      >
        Load more
      </button>
    </div>
  );
}
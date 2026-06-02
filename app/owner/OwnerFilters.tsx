"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useMemo, useState} from "react";

//status options
const OPTIONS = [
  { value: "active", label: "Active (NEW + CONFIRMED)" },
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
  { value: "all", label: "All" },
];

//sort options
const SORT_OPTIONS = [
  { value: "created_desc", label: "Created (newest)" },
  { value: "created_asc", label: "Created (oldest)" },
  { value: "requested_asc", label: "Requested date (soonest)" },
  { value: "requested_desc", label: "Requested date (latest)" },
];

//view options for the dashboard
const VIEW_OPTIONS = [
  { value: "list", label: "List" },
  { value: "calendar", label: "Weekly calendar" },
];

type OwnerFiltersFormProps = {
  currentStatus: string;
  currentQ: string;
  currentSort: string;
  currentView: string;
};

export default function OwnerFilters() {
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "active";
  const currentQ = searchParams.get("q") ?? "";
  const currentSort = searchParams.get("sort") ?? "created_desc";
  const currentView = searchParams.get("view") ?? "list";

  return (
    <OwnerFiltersForm
      key={searchParams.toString()}
      currentStatus={currentStatus}
      currentQ={currentQ}
      currentSort={currentSort}
      currentView={currentView}
    />
  );
}

function OwnerFiltersForm({
  currentStatus,
  currentQ,
  currentSort,
  currentView,
}: OwnerFiltersFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(currentStatus);
  const [q, setQ] = useState(currentQ);
  const [sort, setSort] = useState(currentSort);
  const [view, setView] = useState(currentView);

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  function apply(
    nextStatus: string,
    nextQ: string,
    nextSort: string,
    nextView: string
  ) {
    const updatedParams = new URLSearchParams(params);

    //reset pagination when filters change
    updatedParams.delete("page");

    //status treats "active" as the default
    if (!nextStatus || nextStatus === "active") {
      updatedParams.delete("status");
    } else {
      updatedParams.set("status", nextStatus);
    }

    //search
    const trimmedSearch = nextQ.trim();

    if (!trimmedSearch) {
      updatedParams.delete("q");
    } else {
      updatedParams.set("q", trimmedSearch);
    }

    // Sort treats "created_desc" as the default
    if (!nextSort || nextSort === "created_desc") {
      updatedParams.delete("sort");
    } else {
      updatedParams.set("sort", nextSort);
    }

    //view treats "list" as default
    if (!nextView || nextView === "list") {
      updatedParams.delete("view");
    } else {
      updatedParams.set("view", nextView);
    }

    const queryString = updatedParams.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply(status, q, sort, view);
  }

  function clear() {
    setStatus("active");
    setQ("");
    setSort("created_desc");
    setView("list");
    router.push(pathname);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="block text-xs text-black/60">Search</label>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Name, phone, email, address, code, service..."
          className="mt-1 w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground/80 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="sm:w-72">
        <label className="block text-xs text-black/60">Status</label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="mt-1 w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground/80 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-60">
        <label className="block text-xs text-black/60">Sort</label>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="mt-1 w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground/80 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-48">
        <label className="block text-xs text-black/60">View</label>
        <select
          value={view}
          onChange={(event) => setView(event.target.value)}
          className="mt-1 w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground/80 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {VIEW_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-90"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={clear}
          className="rounded-lg bg-card px-4 py-2 text-sm font-semibold text-foreground/80 ring-1 ring-black/10 transition hover:bg-card-muted"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
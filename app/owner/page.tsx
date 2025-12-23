export default function OwnerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="relative rounded-2xl border-2 border-black p-8">
          <div className="mt-6">
            <div className="text-lg text-black/70 font-semibold">Welcome, (name)</div>
            <div className="mt-1 text-sm text-black/60">
              (owner dashboard placeholder, maybe some lines here for decoration)
            </div>
          </div>

          {/* Analytics table placeholder */}
          <div className="mt-8 rounded-2xl border-2 border-black px-6 py-10 text-center">
            <div className="text-sm text-black/70 font-medium">Analytics table</div>
            <div className="mt-2 text-xs text-black/60">
              (bookings per week • revenue estimate • status breakdown)
            </div>
          </div>

          {/* List box */}
          <div className="mt-10 rounded-2xl border-2 border-black p-0">
            <div className="border-b-2 border-black px-6 py-4 text-center text-sm text-black/70 font-semibold">
              List
            </div>

            <div className="px-6 py-6 text-sm">
              <ul className="space-y-3">
                <li className="rounded-lg border-2 border-black text-black/70 px-4 py-3">
                  current reservations made
                </li>
                <li className="rounded-lg border-2 border-black text-black/70 px-4 py-3">
                  estimated revenue made
                </li>
                <li className="rounded-lg border-2 border-black text-black/70 px-4 py-3">
                  option to drop clients/blacklist
                </li>
              </ul>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <button className="rounded-xl border-2 border-black bg-white px-4 py-3 text-sm text-black/70 font-semibold">
                  View reservations
                </button>
                <button className="rounded-xl border-2 border-black bg-white px-4 py-3 text-sm text-black/70 font-semibold">
                  Export list
                </button>
                <button className="rounded-xl border-2 border-black bg-white px-4 py-3 text-sm text-black/70 font-semibold">
                  Manage blacklist
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
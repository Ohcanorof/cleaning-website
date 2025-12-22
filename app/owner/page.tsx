export default function OwnerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="relative rounded-2xl border-2 border-black p-8">
          <div className="absolute -top-4 left-6 rounded-md border-2 border-black bg-white px-3 py-1 text-sm font-medium">
            owner view
          </div>

          <div className="mt-6">
            <div className="text-lg font-semibold">Welcome text</div>
            <div className="mt-1 text-sm text-black/60">
              (owner dashboard placeholder)
            </div>
          </div>

          {/* Analytics table placeholder */}
          <div className="mt-8 rounded-2xl border-2 border-black px-6 py-10 text-center">
            <div className="text-sm font-medium">analytics table</div>
            <div className="mt-2 text-xs text-black/60">
              (bookings per week • revenue estimate • status breakdown)
            </div>
          </div>

          {/* List box */}
          <div className="mt-10 rounded-2xl border-2 border-black p-0">
            <div className="border-b-2 border-black px-6 py-4 text-center text-sm font-semibold">
              List
            </div>

            <div className="px-6 py-6 text-sm">
              <ul className="space-y-3">
                <li className="rounded-lg border-2 border-black px-4 py-3">
                  current reservations made
                </li>
                <li className="rounded-lg border-2 border-black px-4 py-3">
                  estimated revenue made
                </li>
                <li className="rounded-lg border-2 border-black px-4 py-3">
                  option to drop clients/blacklist
                </li>
              </ul>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <button className="rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-semibold">
                  View reservations
                </button>
                <button className="rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-semibold">
                  Export list
                </button>
                <button className="rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-semibold">
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
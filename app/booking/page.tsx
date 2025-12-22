export default function ReservationPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="relative rounded-2xl border-2 border-black p-8">
          <div className="absolute -top-4 left-6 rounded-md border-2 border-black bg-white px-3 py-1 text-sm font-medium">
            reservation page
          </div>

          <div className="text-center text-xs font-semibold tracking-wide text-black/70">
            client side
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Left: selected service + schedule */}
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm font-medium">Selected service</div>
                <div className="mt-2 text-xs text-black/60">
                  (service name • price • brief description)
                </div>
              </div>

              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm font-medium">Date / time request</div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border-2 border-black px-3 py-3 text-xs text-black/70">
                    Requested date (placeholder)
                  </div>
                  <div className="rounded-lg border-2 border-black px-3 py-3 text-xs text-black/70">
                    Time window (placeholder)
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm font-medium">Notes</div>
                <div className="mt-3 rounded-lg border-2 border-black px-3 py-10 text-xs text-black/70">
                  (pets, special requests, entry instructions)
                </div>
              </div>
            </div>

            {/* Right: personal info */}
            <div className="rounded-2xl border-2 border-black p-6">
              <div className="text-center text-sm font-medium">
                enter personal info
              </div>

              <div className="mt-5 space-y-3">
                {["Full name", "Phone", "Email", "Address"].map((label) => (
                  <div
                    key={label}
                    className="rounded-lg border-2 border-black px-3 py-3 text-xs text-black/70"
                  >
                    {label} (placeholder)
                  </div>
                ))}

                <button
                  type="button"
                  className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-semibold"
                >
                  Submit Reservation (placeholder)
                </button>

                <p className="pt-2 text-center text-xs text-black/60">
                  Owner will call/text to confirm about 1 day in advance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
 {/* this is what the customer should see after they click on a service to book*/}

import Link from "next/link";
export default function ReservationPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="relative rounded-2xl border-2 border-black p-8">
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
           
          {/*menu bar */}
          <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-center">
            {/*company title*/}
              <div className="text-sm text-black/70 font-medium">Cleaning Services</div>
            {/*menu box, transparent for now, can make black if needed to see the grouping. */}
            <div className="w-full max-w-md rounded-xl border-2 border-transparent px-6 py-4 text-center">
              <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
                <Link href="/" className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition">
                  Home
                </Link>

                <Link
                  href="/#services"
                  className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  Services
                </Link>

                <Link
                  href="/booking"
                  className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  Booking
                </Link>

                <Link
                  href="/#contact"
                  className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
            

            {/* Left: selected service + schedule box*/}
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm text-black/70 font-medium">'Selected service'</div>
                <div className="mt-2 text-xs text-black/60">
                  (service name • price • brief description)
                </div>
              </div>

              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm text-black/70 font-medium">Date / Time Request</div>
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
                <div className="text-sm text-black/70 font-medium">Notes</div>
                <div className="mt-3 rounded-lg border-2 border-black px-3 py-10 text-xs text-black/70">
                  (pets, special requests, entry instructions)
                </div>
              </div>
            </div>

            {/* Right: personal info box*/}
            <div className="rounded-2xl border-2 border-black p-6">
              <div className="text-center text-sm text-black/70 font-medium">
                Enter Personal Info
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
                  className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-sm text-black/70 font-semibold"
                >
                  Submit Reservation (placeholder)
                </button>

                <p className="pt-2 text-center text-xs text-black/60">
                  You will recieve a call/text to confirm about 1 day in advance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
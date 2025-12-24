"use client"; 

{/* this is what the customer should see after they click on a service to book*/}
{/*cleint component*/}
import Link from "next/link";
import { useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  price: number;
  description: string;
};

 {/*this could change depending on what the services actually are. This is just a placeholder*/}
const SERVICES: Service[] = [
  {
    id: "standard",
    name: "Standard Cleaning",
    price: 120,
    description: "General cleaning for common areas and bedrooms/bathrooms.",
  },  
  {
    id: "deep",
    name: "Deep Cleaning",
    price: 220,
    description: "More detailed cleaning for buildup, edges, and appliances.",
  },
  {
    id: "move",
    name: "Move In / Move Out",
    price: 300,
    description: "Empty-unit cleaning, detailed reset, inside cabinets (as needed).",
  },
];


export default function ReservationPage() {

const [serviceId, setServiceId] = useState(SERVICES[0].id);

const selected = useMemo(
  () => SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0],
  [serviceId]
);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl border-2 border-black p-6 sm:p-8">
          {/* Header OUTSIDE the grid (this fixes the “quadrants” issue) */}
          <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-auto rounded-xl border-2 border-black px-6 py-4 text-center">
              <div className="text-sm text-black/70 font-medium">
                Cleaning Services
              </div>
            </div>

            <nav className="w-full sm:w-auto rounded-xl border-2 border-transparent px-4 py-3">
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <Link
                  href="/"
                  className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
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
                  About
                </Link>
              </div>
            </nav>
          </header>

          {/* Main content:
              - Mobile: single column
              - Desktop: 2 columns (left stack + right personal info)
              Only TWO direct children -> no weird grid splitting.
          */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Left stack */}
            <div className="space-y-6">
              {/* Select service dropdown + price */}
              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm text-black/70 font-medium">
                  Select Services (dropdown menu)
                </div>

                <div className="mt-4">
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full rounded-lg border-2 border-black bg-white px-3 py-3 text-sm text-black/70"
                  >
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 rounded-lg border-2 border-black px-4 py-3">
                    <div className="text-xs text-black/60">Selected:</div>
                    <div className="text-sm text-black/70 font-medium">
                      {selected.name}
                    </div>
                    <div className="mt-1 text-xs text-black/60">
                      {selected.description}
                    </div>
                    <div className="mt-3 text-sm text-black/70 font-semibold">
                      Price: ${selected.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date/Time Request */}
              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm text-black/70 font-medium">
                  Date/Time Request
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border-2 border-black px-3 py-3 text-xs text-black/70">
                    Requested date (placeholder)
                  </div>
                  <div className="rounded-lg border-2 border-black px-3 py-3 text-xs text-black/70">
                    Time window (placeholder)
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm text-black/70 font-medium">Notes</div>
                <div className="mt-3 rounded-lg border-2 border-black px-3 py-10 text-xs text-black/70">
                  (pets, special requests, entry instructions)
                </div>
              </div>
            </div>

            {/* Right: personal info */}
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
                  className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-sm text-black/70 font-semibold hover:bg-black hover:text-white transition"
                >
                  Submit Reservation (placeholder)
                </button>

                <p className="pt-2 text-center text-xs text-black/60">
                  You will receive a call/text to confirm about 1 day in advance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
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

//user input stuff
type FormState = {
  serviceId: string;
  requestedDate: string;
  timeWindow: string;
  notes: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  //should help against bots 
  website: string;
}

export default function BookingPage() {
  const [form, setForm] = useState<FormState>({
    serviceId: SERVICES[0].id,
    requestedDate: "",
    timeWindow: "",
    notes: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    website: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const selected = useMemo(
    () => SERVICES.find((s) => s.id === form.serviceId) ?? SERVICES[0],
    [form.serviceId]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    // basic client-side checks (server will re-check this too)
    if (!form.fullName || !form.phone || !form.email || !form.address) {
      setStatus("error");
      setMessage("Please fill in: full name, phone, email, and address.");
      return;
    }

    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: form.serviceId,
          serviceName: selected.name,
          servicePrice: selected.price,
          serviceDescription: selected.description,
          requestedDate: form.requestedDate,
          timeWindow: form.timeWindow,
          notes: form.notes,
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          website: form.website, // honeypot
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to submit reservation.");

      setStatus("success");
      setMessage("Reservation submitted! The owner will call/text to confirm about 1 day in advance.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl border-2 border-black p-6 sm:p-8">
          {/* Header */}
          <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-auto rounded-xl border-2 border-black px-6 py-4 text-center">
              <div className="text-sm text-black/70 font-medium">Cleaning Services</div>
            </div>

            <nav className="w-full sm:w-auto px-4 py-3">
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <Link href="/" className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition">
                  Home
                </Link>
                <Link href="/#services" className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition">
                  Services
                </Link>
                <Link href="/booking" className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition">
                  Booking
                </Link>
                <Link href="/#contact" className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition">
                  Contact
                </Link>
              </div>
            </nav>
          </header>

          {/* Forms */}
          <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Select service */}
              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm text-black/70 font-medium">Select Services</div>

                <label className="mt-4 block text-xs text-black/60">Service</label>
                <select
                  value={form.serviceId}
                  onChange={(e) => update("serviceId", e.target.value)}
                  className="mt-1 w-full rounded-lg border-2 border-black bg-white px-3 py-3 text-sm text-black/70"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <div className="mt-4 rounded-lg border-2 border-black px-4 py-3">
                  <div className="text-xs text-black/60">Selected:</div>
                  <div className="text-sm text-black/70 font-medium">{selected.name}</div>
                  <div className="mt-1 text-xs text-black/60">{selected.description}</div>
                  <div className="mt-3 text-sm text-black/70 font-semibold">
                    Price: ${selected.price.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Date/Time */}
              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm text-black/70 font-medium">Date/Time Request</div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-black/60">Requested date</label>
                    <input
                      type="date"
                      value={form.requestedDate}
                      onChange={(e) => update("requestedDate", e.target.value)}
                      className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-black/60">Time window</label>
                    <input
                      type="text"
                      placeholder="e.g., 9am–12pm"
                      value={form.timeWindow}
                      onChange={(e) => update("timeWindow", e.target.value)}
                      className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-2xl border-2 border-black p-6">
                <div className="text-sm text-black/70 font-medium">Notes</div>
                <label className="mt-3 block text-xs text-black/60">
                  Pets, special requests, entry instructions, etc.
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="rounded-2xl border-2 border-black p-6">
              <div className="text-center text-sm text-black/70 font-medium">Enter Personal Info</div>

              {/* 
              Honeypot (hidden from ppl)
              if bots try and fill this, their request is treated as spam and ignored lol get wreked
              */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                className="hidden"
              />

              <div className="mt-5 space-y-3">
                <div>
                  <label className="block text-xs text-black/60">Full name *</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-black/60">Phone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-black/60">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-black/60">Address *</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-sm text-black/70 font-semibold hover:bg-black hover:text-white transition disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black/70"
                >
                  {status === "submitting" ? "Submitting..." : "Submit Reservation"}
                </button>

                {message ? (
                  <p className={`pt-2 text-center text-xs ${status === "error" ? "text-red-600" : "text-black/60"}`}>
                    {message}
                  </p>
                ) : (
                  <p className="pt-2 text-center text-xs text-black/60">
                    You will receive a call/text to confirm about 1 day in advance.
                  </p>
                )}
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
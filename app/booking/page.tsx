"use client";

//this is what the customer should see after they click on a service to book
//cleint component
import Link from "next/link";
import { useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  maxPrice: number;
  minPrice: number;
  description: string;
};

//this could change depending on what the services actually are. This is just a placeholder
const SERVICES: Service[] = [
  {
    id: "standard",
    name: "Standard Cleaning",
    minPrice: 140,
    maxPrice: 160,
    description: "General cleaning for common areas and bedrooms/bathrooms.",
  },
  {
    id: "deep",
    name: "Deep Cleaning",
    minPrice: 285,
    maxPrice: 375,
    description: "More detailed cleaning for buildup and hard-to-reach areas.",
  },
  {
    id: "move",
    name: "Move In/Move Out",
    minPrice: 340,
    maxPrice: 520,
    description: "A thorough clean for moving in or out.",
  },
];

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
};

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

  const selected = useMemo(() => {
    return SERVICES.find((s) => s.id === form.serviceId) ?? SERVICES[0];
  }, [form.serviceId]);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          //service info
          serviceId: selected.id,
          serviceName: selected.name,
          serviceMinPrice: selected.minPrice,
          serviceMaxPrice: selected.maxPrice,
          serviceDescription: selected.description,

          //quote request
          requestedDate: form.requestedDate,
          timeWindow: form.timeWindow,
          notes: form.notes,

          //user info
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          address: form.address,

          //honeypot
          website: form.website,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to submit reservation.");

      const code = data?.confirmationCode as string | undefined;

      setStatus("success");
      setMessage(
        code
          ? `Quote request submitted! Confirmation code: ${code}. The owner will call/text to confirm and give a quote in person about 1 day in advance.`
          : "Quote request submitted! The owner will call/text to confirm and give a quote in person about 1 day in advance."
      );
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message ?? "Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-[color:var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl border-2 border-transparent bg-[color:var(--card)] p-6 shadow-sm sm:p-8">
          {/* Header */}
          <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-auto rounded-xl border-2 border-transparent bg-[color:var(--card-muted)] px-6 py-4 text-center shadow-sm">
              <div className="text-sm text-black/70 font-medium">Patricia's House Cleaning</div>
            </div>

            <nav className="w-full sm:w-auto rounded-xl border-2 border-transparent bg-[color:var(--card-muted)] px-4 py-3 shadow-sm">
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <Link
                  href="/"
                  className="rounded-full border border-black/10 bg-white/70 text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  Home
                </Link>
                <Link
                  href="/#services"
                  className="rounded-full border border-black/10 bg-white/70 text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  Services
                </Link>
                <Link
                  href="/booking"
                  className="rounded-full border border-black/10 bg-white/70 text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  Request a Quote
                </Link>
                <Link
                  href="/#contact"
                  className="rounded-full border border-black/10 bg-white/70 text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  About
                </Link>
              </div>
            </nav>
          </header>

          {/* Forms */}
          <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Left column */}
            <div className="space-y-6">
              {/* Select service */}
              <div className="rounded-2xl border-2 border-transparent bg-[color:var(--card-muted)] p-6 shadow-sm">
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

                <div className="mt-4 rounded-lg border-2 border-transparent bg-white/70 px-4 py-3 shadow-sm">
                  <div className="text-xs text-black/60">Selected:</div>
                  <div className="text-sm text-black/70 font-medium">{selected.name}</div>
                  <div className="mt-1 text-xs text-black/60">{selected.description}</div>
                  <div className="mt-3 text-sm text-black/70 font-semibold">
                    Estimated range: ${selected.minPrice.toFixed(0)} – ${selected.maxPrice.toFixed(0)}
                  </div>

                  <div className="mt-2 text-xs text-black/60">
                    Final price is confirmed after a walkthrough and may vary case-by-case.
                  </div>
                </div>
              </div>

              {/* Date/Time */}
              <div className="rounded-2xl border-2 border-transparent bg-[color:var(--card-muted)] p-6 shadow-sm">
                <div className="text-sm text-black/70 font-medium">Date/Time For A Quote Request</div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-black/60">Preferred Date</label>
                    <input
                      type="date"
                      value={form.requestedDate}
                      onChange={(e) => update("requestedDate", e.target.value)}
                      className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-black/60">Preferred Time Window</label>
                    <input
                      value={form.timeWindow}
                      onChange={(e) => update("timeWindow", e.target.value)}
                      placeholder="e.g. 9am–12pm, after 5pm, etc."
                      className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-2xl border-2 border-transparent bg-[color:var(--card-muted)] p-6 shadow-sm">
                <div className="text-sm text-black/70 font-medium">Notes</div>
                <label className="mt-4 block text-xs text-black/60">
                  Pets, special requests, entry instructions, etc.
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  maxLength={1000}
                  rows={5}
                  className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                />
              </div>
            </div>

            {/* Right column (user info) */}
              <div className="rounded-2xl border-2 border-transparent bg-[color:var(--card-muted)] p-6 shadow-sm">
              <div className="text-center text-sm text-black/70 font-medium">Enter Personal Info</div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs text-black/60">Full Name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    maxLength={80}
                    minLength={2}
                    autoComplete="name"
                    placeholder="First Last"
                    className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                  />
                </div>

                <div>
                  <label className="block text-xs text-black/60">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="(555) 555-5555"
                    className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                  />
                </div>

                <div>
                  <label className="block text-xs text-black/60">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    maxLength={254}
                    autoComplete="email"
                    className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                  />
                </div>

                <div>
                  <label className="block text-xs text-black/60">Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    maxLength={200}
                    autoComplete="street-address"
                    className="mt-1 w-full rounded-lg border-2 border-black px-3 py-3 text-sm text-black/70"
                  />
                </div>

                {/* honeypot */}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  className="hidden"
                />

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-2 w-full rounded-xl border-2 border-transparent bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-[color:var(--accent-foreground)] shadow-sm hover:bg-emerald-800 disabled:opacity-50 disabled:hover:bg-[color:var(--accent)] transition"
                >
                  {status === "submitting" ? "Submitting..." : "Submit Quote Request"}
                </button>

                <div className="min-h-[60px] pt-3 text-center text-xs">
                  {status === "success" ? (
                    <div className="rounded-lg border-2 border-transparent bg-white/70 px-3 py-3 text-black/70 shadow-sm">
                      {message}
                    </div>
                  ) : status === "error" ? (
                    <div className="rounded-lg border-2 border-red-600 bg-white px-3 py-3 text-red-600">
                      {message}
                    </div>
                  ) : (
                    <p className="pt-2 text-center text-xs text-black/60">
                      You will receive a call/text to confirm and obtain a quote for your service from the owner.
                      They will need to see the area they are cleaning in advance before the scheduled cleaning date.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
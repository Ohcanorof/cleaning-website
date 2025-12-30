import Link from "next/link";

export default function HomePage(){
  return (
    <main className="min-h-screen bg-[color:var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl border-2 border-transparent p-2 sm:p-6">
          {/* Header (keep as its own block; NOT inside a grid) */}
          <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-auto rounded-xl border-2 border-transparent bg-[color:var(--card)] px-6 py-4 text-center shadow-sm">
              <div className="text-sm text-black/70 font-medium">
                Patricia’s House Cleaning
              </div>
            </div>

            <nav className="w-full sm:w-auto rounded-xl border-2 border-transparent bg-[color:var(--card)] px-4 py-3 shadow-sm">
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
                  href="/#about"
                  className="rounded-full border border-black/10 bg-white/70 text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  About
                </Link>
              </div>
            </nav>
          </header>

          {/* Hero + Services */}
          <section className="mt-10 overflow-hidden rounded-2xl border-2 border-transparent bg-[color:var(--card)] shadow-sm">
            {/* Hero text block with dimmed background image */}
            <div className="relative">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/clean1.png')" }}
              />
              <div className="absolute inset-0 bg-black/45" />

              <div className="relative px-6 py-12 text-center sm:px-10 sm:py-16">
                <div className="text-center text-[11px] font-semibold tracking-[0.22em] text-white/85 uppercase">
                  Welcome
                </div>

                <div className="font-display mt-4 text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Patricia’s House Cleaning
                </div>

                <div className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-white/90 sm:text-base">
                  Pricing is advertised as an estimated range. Final pricing is confirmed after an in-person quote.
                </div>
              </div>
            </div>

            <div id="services" className="px-6 py-10">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border-2 border-transparent bg-[color:var(--card-muted)] px-6 py-8 shadow-sm">
                <div className="text-sm text-black/70 font-medium">
                  Services
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    { title: "Standard Cleaning", desc: "General cleaning for common areas, bedrooms, and bathrooms." },
                    { title: "Deep Cleaning", desc: "More detailed cleaning for buildup and hard-to-reach areas." },
                    { title: "Move In / Move Out", desc: "A thorough clean for moving in or out of a home." },
                  ].map((s) => (
                    <div
                      key={s.title}
                      className="rounded-xl border-2 border-transparent bg-white/70 px-5 py-4 shadow-sm"
                    >
                      <div className="text-sm text-black/70 font-medium">
                        {s.title}
                      </div>
                      <div className="mt-1 text-xs text-black/60">{s.desc}</div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Link
                      href="/booking"
                      className="inline-block rounded-xl border-2 border-transparent bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-[color:var(--accent-foreground)] shadow-sm hover:bg-emerald-800 transition"
                    >
                      Request a Quote →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-transparent bg-[color:var(--card-muted)] px-6 py-8 shadow-sm">
                <div className="text-sm text-black/70 font-medium">How it works</div>

                <div className="mt-4 space-y-3 text-sm text-black/60">
                  <div>1) Pick a service and submit a quote request.</div>
                  <div>2) We’ll call/text to confirm an in-person quote time.</div>
                  <div>3) After the walkthrough, we confirm the final price and schedule the cleaning.</div>
                </div>
              </div>
              </div>
            </div>
          </section>

          {/* About / links */}
          <section
            id="about"
            className="mt-10 rounded-2xl border-2 border-transparent bg-[color:var(--card)] px-6 py-10 text-center shadow-sm"
          >
            <div className="font-display text-2xl font-semibold text-black/80">About</div>

            <div className="text-sm text-black/70 font-medium">
              A cleaning service based in _. Our pricing is advertised as an estimated range, and the final price is provided after an in-person quote.
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              <Link
                href="https://www.instagram.com/patriciashousecleaningservice/"
                className="rounded-full border border-black/10 bg-white/70 text-black/70 px-4 py-2 hover:bg-black hover:text-white transition"
                target="_blank"
              >
                Instagram
              </Link>

              <Link
                href="/#contact"
                className="rounded-full border border-black/10 bg-white/70 text-black/70 px-4 py-2 hover:bg-black hover:text-white transition"
              >
                Contact
              </Link>
            </div>

            <div id="contact" className="mt-6 text-xs text-black/60">
              (phone number: 209-455-2946)
              (email: pattyshousecleaning1579@gmail.com)
            </div>
          </section>
        </section>
      </div>
    </main>
  );

}

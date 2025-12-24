import Link from "next/link";

export default function HomePage(){
  return(
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl border-2 border-transparent p-2 sm:p-6">
          {/* Header (keep as its own block; NOT inside a grid) */}
          <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-auto rounded-xl border-2 border-black px-6 py-4 text-center">
              <div className="text-sm text-black/70 font-medium">
                Cleaning Services
              </div>
            </div>

            <nav className="w-full sm:w-auto rounded-xl border-2 border-black px-4 py-3">
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
                  href="/#about"
                  className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  About
                </Link>
              </div>
            </nav>
          </header>

          {/* Hero / picture */}
          <div className="mt-8 rounded-3xl border-2 border-black px-6 py-16 text-center">
            <div className="text-sm text-black/70 font-medium">picture</div>
            <div className="mt-2 text-xs text-black/60">
              (hero image / before &amp; after / banner)
            </div>
          </div>

          {/* Services list (no side buttons; stacked on all sizes) */}
          <section id="services" className="mt-10">
            <div className="rounded-2xl border-2 border-black px-6 py-6">
              <div className="text-sm text-black/70 font-medium">Services</div>
              <div className="mt-2 text-xs text-black/60">
                (list of services + descriptions)
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "Standard Cleaning",
                    desc: "General cleaning for bedrooms, bathrooms, kitchen, living areas.",
                  },
                  {
                    title: "Deep Cleaning",
                    desc: "More detailed cleaning: baseboards, appliances, buildup removal, etc.",
                  },
                  {
                    title: "Move In / Move Out",
                    desc: "Empty-unit cleaning, inside cabinets, detailed reset for new tenants.",
                  },
                ].map((s) => (
                  <div
                    key={s.title}
                    className="rounded-xl border-2 border-black px-5 py-4"
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
                    className="inline-block rounded-xl border-2 border-black bg-white px-4 py-3 text-sm text-black/70 font-semibold hover:bg-black hover:text-white transition"
                  >
                    Go to Booking →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* About / links */}
          <section id="about" className="mt-10 rounded-2xl border-2 border-black px-6 py-10 text-center">
            <div className="text-sm text-black/70 font-medium">
              about section / links to other sites (social media pages)
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              <Link
                href="https://www.instagram.com/patriciashousecleaningservice/"
                className="rounded-full border-2 border-black text-black/70 px-4 py-2 hover:bg-black hover:text-white transition"
                target="_blank"
              >
                Instagram
              </Link>

              <Link
                href="/#contact"
                className="rounded-full border-2 border-black text-black/70 px-4 py-2 hover:bg-black hover:text-white transition"
              >
                Contact
              </Link>
            </div>

            <div id="contact" className="mt-6 text-xs text-black/60">
              (contact info placeholder — phone/email/service area)
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

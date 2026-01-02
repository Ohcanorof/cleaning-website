import Link from "next/link";
import Image from "next/image";
import PhotoCarousel from "./PhotoCarousel";

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

                <a
                  href="/#services"
                  className="rounded-full border border-black/10 bg-white/70 text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  Services
                </a>

                <Link
                  href="/booking"
                  className="rounded-full border border-black/10 bg-white/70 text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  Request a Quote
                </Link>

                <a
                  href="/#about"
                  className="rounded-full border border-black/10 bg-white/70 text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  About
                </a>
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
                  Pricing is advertised as an estimated range, prices may vary case by case. Final pricing is confirmed after an in-person quote.
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

          {/* phot galery/carousel */}
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-2xl">
              <PhotoCarousel />
            </div>
          </div>

          {/* About / links */}
          <section
            id="about"
            className="mt-10 rounded-2xl border-2 border-transparent bg-[color:var(--card)] px-10 py-10 text-center shadow-sm"
          >
            <div className="font-display text-2xl font-semibold text-black/80">About</div>

            <div className="mt-3 text-sm text-black/70 font-medium">
              We are a small, family-owned cleaning business serving the Tri-Valley and 209 
              areas. Our business is run by a hardworking mother and her daughters who are 
              passionate about providing dependable, high-quality cleaning services to our community.
              We understand how important it is to feel comfortable in your own home, which is why we treat every house with care, honesty, and attention to detail. whether
              you need regular cleaning or a deep clean, we are committed to leaving your home fresh, organized, and stress free.

              
            </div>

            <div className="mt-3 flex justify-center">
            <Link
              href="https://www.instagram.com/patriciashousecleaningservice/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Patricia’s House Cleaning on Instagram"
              title="Instagram"
              className="inline-flex items-center justify-center rounded-full p-2 transition hover:bg-black/5"
            >
              <Image
                src="/insta1.png"
                alt="Instagram"
                width={50}
                height={50}
                className="opacity-80 hover:opacity-100 transition"
              />
            </Link>
          </div>

            <div id="contact" className="mt-4 text-xs text-black/60">
              Available Monday - Friday | 9:00 AM - 5:00 PM   
            </div>

            <div id="contact" className="mt-6 text-xs text-black/60"> 
              Contact Hours: 9:00 AM - 5:00 PM
            </div>

            <div id="contact" className="mt-6 text-xs text-black/60">
              Phone Number: 209-455-2946
            </div>

            <div id="contact" className="mt-6 text-xs text-black/60">
              Email: pattyshousecleaning1579@gmail.com
            </div>

          </section>
        </section>
      </div>
    </main>
  );

}

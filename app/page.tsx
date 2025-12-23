import Link from "next/link";

export default function HomePage(){
  return(
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Frame container */}
        <section className="relative rounded-2xl border-2 border-transparent p-8">
          {/*<div className="text-center text-xs font-semibold tracking-wide text-black/70">
            client side
          </div>*/}

          {/* Top row: title + menu */}
          <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-center">
            <div className="w-full max-w-md rounded-xl border-2 border-black px-6 py-4 text-center">
              <div className="text-sm text-black/70 font-medium">Cleaning Services</div>
            </div>

            {/*menu bar */}
            <div className="w-full max-w-md rounded-xl border-2 border-black px-6 py-4 text-center">
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
                  href="/#About Us"
                  className="rounded-full border-2 border-black text-black/70 px-3 py-1 hover:bg-black hover:text-white transition"
                >
                  About Us
                </Link>
              </div>
            </div>
          </div>

          {/* Big picture */}
          <div className="mt-8 rounded-3xl border-2 border-black px-6 py-16 text-center">
            <div className="text-sm text-black/70 font-medium">picture</div>
            <div className="mt-2 text-xs text-black/60">
              (hero image / before &amp; after / banner)
            </div>
          </div>

          {/* Services + personal info area */}
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Left: pricing for service list */}
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="flex-1 rounded-xl border-2 border-black px-6 py-6">
                    <div className="text-sm text-black/70 font-medium">pricing for service</div>
                    <div className="mt-2 text-xs text-black/60">
                      (First time cleaning • description • price)
                    </div>
                  </div>

                  <button
                    type="button"
                    className="h-14 w-14 rounded-full border-2 border-black bg-white text-xs text-black/70 font-semibold"
                  >
                    select
                    <br />
                    (button)
                  </button>
                </div>
              ))}
            </div>

            {/* Right: personal info box */}
            <div className="rounded-2xl border-2 border-black p-6">
              <div className="text-center text-sm text-black/70 font-medium">
                enter personal info
              </div>

              <div className="mt-5 space-y-3">
                {["Name", "Phone", "Email", "Address"].map((label) => (
                  <div
                    key={label}
                    className="rounded-lg border-2 border-black px-3 py-3 text-xs text-black/70"
                  >
                    {label} (placeholder)
                  </div>
                ))}

                <div className="rounded-lg border-2 border-black px-3 py-10 text-xs text-black/70">
                  Notes (pets, gate code, etc.)
                </div>

                <button
                  type="button"
                  className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-sm text-black/70 font-semibold">
                  Reserve (placeholder)
                </button>
              </div>
            </div>
          </div>

          {/* About / links */}
          <div className="mt-10 rounded-2xl border-2 border-black px-6 py-10 text-center">
            <div className="text-sm text-black/70 font-medium">
              about section / links to other sites (social media pages)
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              <Link href="https://www.instagram.com/patriciashousecleaningservice/" className="rounded-full border-2 border-black text-black/70 px-4 py-2">
                Instagram
              </Link>
              <span className="rounded-full border-2 border-black text-black/70 px-4 py-2">
                Contact
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

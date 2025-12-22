export default function HomePage(){
  return(
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Frame container */}
        <section className="relative rounded-2xl border-2 border-black p-8">
          {/* Frame label (like your drawio tab) */}
          <div className="absolute -top-4 left-6 rounded-md border-2 border-black bg-white px-3 py-1 text-sm font-medium">
            main page
          </div>

          <div className="text-center text-xs font-semibold tracking-wide text-black/70">
            client side
          </div>

          {/* Top row: title + menu */}
          <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-center">
            <div className="w-full max-w-md rounded-xl border-2 border-black px-6 py-4 text-center">
              <div className="text-sm font-medium">title of company</div>
            </div>

            <div className="w-full max-w-md rounded-xl border-2 border-black px-6 py-4 text-center">
              <div className="text-sm font-medium">top menu?</div>
              <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
                <span className="rounded-full border-2 border-black px-3 py-1">
                  Home
                </span>
                <span className="rounded-full border-2 border-black px-3 py-1">
                  Services
                </span>
                <span className="rounded-full border-2 border-black px-3 py-1">
                  Book
                </span>
                <span className="rounded-full border-2 border-black px-3 py-1">
                  Contact
                </span>
              </div>
            </div>
          </div>

          {/* Big picture */}
          <div className="mt-8 rounded-3xl border-2 border-black px-6 py-16 text-center">
            <div className="text-sm font-medium">picture</div>
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
                    <div className="text-sm font-medium">pricing for service</div>
                    <div className="mt-2 text-xs text-black/60">
                      (service name • description • price)
                    </div>
                  </div>

                  <button
                    type="button"
                    className="h-14 w-14 rounded-full border-2 border-black bg-white text-xs font-semibold"
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
              <div className="text-center text-sm font-medium">
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
                  className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-semibold"
                >
                  Reserve (placeholder)
                </button>
              </div>
            </div>
          </div>

          {/* About / links */}
          <div className="mt-10 rounded-2xl border-2 border-black px-6 py-10 text-center">
            <div className="text-sm font-medium">
              about section / links to other sites (social media pages)
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
              <span className="rounded-full border-2 border-black px-4 py-2">
                Instagram
              </span>
              <span className="rounded-full border-2 border-black px-4 py-2">
                Facebook
              </span>
              <span className="rounded-full border-2 border-black px-4 py-2">
                Reviews
              </span>
              <span className="rounded-full border-2 border-black px-4 py-2">
                Contact
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

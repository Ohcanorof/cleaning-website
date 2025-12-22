export default function BackendPlaceholderPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="relative rounded-2xl border-2 border-black p-8">
          <div className="absolute -top-4 left-6 rounded-md border-2 border-black bg-white px-3 py-1 text-sm font-medium">
            client info handling
          </div>

          <div className="text-center text-xs font-semibold tracking-wide text-black/70">
            backend
          </div>

          <div className="mt-8 rounded-2xl border-2 border-black px-6 py-40 text-center">
            <div className="text-sm font-medium">placeholder area</div>
            <div className="mt-2 text-xs text-black/60">
              (future: validation • database • admin actions)
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

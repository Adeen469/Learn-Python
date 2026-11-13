// Loading skeleton for the home route, matching the dashboard layout
// (navbar + video area + info card + progress card + lesson list) so
// navigation never shows a blank screen.
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex h-14 items-center gap-3 border-b border-neutral-800 px-4">
        <div className="h-6 w-24 animate-pulse rounded bg-neutral-800" />
        <div className="h-6 w-20 animate-pulse rounded bg-neutral-800" />
        <div className="h-6 w-24 animate-pulse rounded bg-neutral-800" />
        <div className="ml-auto h-6 w-16 animate-pulse rounded bg-neutral-800" />
      </div>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="aspect-video w-full animate-pulse rounded-xl border border-neutral-800 bg-neutral-900" />
          <div className="h-32 animate-pulse rounded-xl border border-neutral-800 bg-neutral-950" />
        </section>

        <aside className="space-y-4">
          <div className="h-36 animate-pulse rounded-xl border border-neutral-800 bg-neutral-950" />
          <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="h-4 w-28 animate-pulse rounded bg-neutral-800" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg border border-neutral-800 bg-black" />
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

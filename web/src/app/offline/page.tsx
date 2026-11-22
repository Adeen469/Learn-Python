// Shown when a navigation fails offline and nothing is cached.
// A plain static page (no client JS needed) so it renders with no
// network at all. The service worker serves it as the fallback.
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <img
        src="/lp-logo.png"
        alt="LP Logo"
        width={40}
        height={40}
        className="h-10 w-10 rounded-md object-contain"
      />
      <h1 className="mt-5 text-2xl font-bold tracking-tight">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-neutral-400">
        Check your connection and try again. Your saved videos and
        downloaded lessons still work.
      </p>
      <div className="mt-6 flex gap-3">
        <a
          href="/"
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
        >
          Go home
        </a>
        <a
          href="/learn/python-home"
          className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-600"
        >
          Open lessons
        </a>
      </div>
    </div>
  );
}

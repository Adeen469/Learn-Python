import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <span className="text-4xl font-bold tracking-tight text-white">404</span>
      <h1 className="mt-2 text-base font-medium text-neutral-400">Page not found</h1>
      <p className="mt-1 text-xs text-neutral-600">The lesson or page you are looking for does not exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs font-semibold text-white transition hover:border-neutral-700 hover:bg-neutral-900"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}


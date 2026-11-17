// Shared shell for the public auth pages (/auth/*): the same slim
// header as the landing page, a centred card, and nothing else.
// Guests only — no app navigation, no AppNavbar.

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="/lp-logo.png"
              alt="LP Logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain"
            />
            <span className="text-sm font-semibold tracking-tight">
              LP{" "}
              <span className="text-xs font-normal text-neutral-500">
                Learn Python
              </span>
            </span>
          </a>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <h1 className="text-center text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-center text-sm leading-relaxed text-neutral-400">
            {subtitle}
          </p>
        )}
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          {children}
        </div>
      </main>
    </div>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-xs leading-relaxed text-red-200">
      {message}
    </div>
  );
}

export function AuthNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-xs leading-relaxed text-emerald-200">
      {message}
    </div>
  );
}

export const INPUT_CLASS =
  "w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-white focus:outline-none";

export const BUTTON_CLASS =
  "w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50";

"use client";

import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, ShieldOff } from "lucide-react";

// Two-factor authentication management (Settings page).
//
// States, in order: loading -> not signed in / Google account /
// email account with 2FA off (enroll: QR + code -> backup codes,
// shown once) / email account with 2FA on (disable with password,
// regenerate backup codes). Everything talks to /api/auth/2fa/*.

type Status =
  | { signedIn: false }
  | {
      signedIn: true;
      auth: "google" | "email";
      totpEnabled: boolean;
      hasPassword: boolean;
      emailVerified: boolean;
    };

async function postJson(url: string, payload?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const data: unknown = await res.json().catch(() => null);
  return { res, data: (data ?? {}) as Record<string, unknown> };
}

function errorMessage(data: Record<string, unknown>, fallback: string): string {
  return typeof data.error === "string" ? data.error : fallback;
}

export default function TwoFactorSettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Enrollment state.
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [codesSaved, setCodesSaved] = useState(false);

  // Disable state.
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisable, setShowDisable] = useState(false);

  async function refresh() {
    try {
      const res = await fetch("/api/auth/2fa/status");
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({ signedIn: false });
        return;
      }
      setStatus(data as Status);
    } catch {
      setStatus({ signedIn: false });
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSetup() {
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const { res, data } = await postJson("/api/auth/2fa/setup");
      if (!res.ok) {
        setError(errorMessage(data, "Could not start setup. Please try again."));
        return;
      }
      setQr(typeof data.qrDataUrl === "string" ? data.qrDataUrl : null);
      setSecret(typeof data.secret === "string" ? data.secret : null);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const { res, data } = await postJson("/api/auth/2fa/enable", {
        code: setupCode,
      });
      if (!res.ok) {
        setError(errorMessage(data, "The code is incorrect. Try again."));
        return;
      }
      const codes = data.backupCodes;
      setBackupCodes(
        Array.isArray(codes) ? (codes as string[]) : []
      );
      setCodesSaved(false);
      setQr(null);
      setSecret(null);
      setSetupCode("");
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const { res, data } = await postJson("/api/auth/2fa/disable", {
        password: disablePassword,
      });
      if (!res.ok) {
        setError(errorMessage(data, "Could not disable two-factor authentication."));
        return;
      }
      setShowDisable(false);
      setDisablePassword("");
      setNote("Two-factor authentication is off.");
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerateBackupCodes() {
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const { res, data } = await postJson("/api/auth/2fa/backup-codes");
      if (!res.ok) {
        setError(errorMessage(data, "Could not generate new backup codes."));
        return;
      }
      const codes = data.backupCodes;
      setBackupCodes(Array.isArray(codes) ? (codes as string[]) : []);
      setCodesSaved(false);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-sm text-white placeholder-neutral-600 focus:border-white focus:outline-none";
  const buttonClass =
    "rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50";

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
      <span className="flex items-center gap-2 text-sm text-neutral-300">
        <ShieldCheck className="h-4 w-4 text-white" />
        Two-factor authentication
      </span>

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200">
          {error}
        </p>
      )}
      {note && (
        <p className="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-200">
          {note}
        </p>
      )}

      {status === null && (
        <p className="mt-2 text-sm text-neutral-400">Loading…</p>
      )}

      {status !== null && !status.signedIn && (
        <>
          <p className="mt-2 text-sm text-neutral-400">
            Sign in to manage two-factor authentication for your account.
          </p>
          <a
            href="/auth/email"
            className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            Sign in
          </a>
        </>
      )}

      {status !== null && status.signedIn && status.auth === "google" && (
        <p className="mt-2 text-sm text-neutral-400">
          You signed in with Google — two-factor authentication is managed
          by your Google account, not here.
        </p>
      )}

      {status !== null &&
        status.signedIn &&
        status.auth === "email" &&
        !status.totpEnabled &&
        backupCodes === null && (
          <>
            <p className="mt-2 text-sm text-neutral-400">
              Add a second step to sign-in with Google Authenticator or an
              email code. Your password alone will no longer be enough.
            </p>
            {qr === null ? (
              <button
                type="button"
                onClick={() => void handleSetup()}
                disabled={loading}
                className={`mt-3 ${buttonClass}`}
              >
                {loading ? "Starting…" : "Set up two-factor authentication"}
              </button>
            ) : (
              <form onSubmit={(e) => void handleEnable(e)} className="mt-4 space-y-3">
                <p className="text-xs leading-relaxed text-neutral-400">
                  Scan this QR code with Google Authenticator (or any
                  authenticator app), then enter the 6-digit code it shows.
                </p>
                {qr && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qr}
                    alt="Two-factor setup QR code"
                    width={220}
                    height={220}
                    className="rounded-lg border border-neutral-800 bg-white p-2"
                  />
                )}
                {secret && (
                  <p className="text-xs text-neutral-400">
                    Can&apos;t scan? Enter this secret manually:{" "}
                    <span className="select-all font-mono text-white">
                      {secret}
                    </span>
                  </p>
                )}
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="6-digit code"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) =>
                    setSetupCode(e.target.value.replace(/\D/g, ""))
                  }
                  className={`${inputClass} text-center tracking-[0.4em]`}
                />
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? "Verifying…" : "Turn on two-factor authentication"}
                </button>
              </form>
            )}
          </>
        )}

      {status !== null &&
        status.signedIn &&
        status.auth === "email" &&
        status.totpEnabled &&
        backupCodes === null && (
          <>
            <p className="mt-2 flex items-center gap-2 text-sm text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Two-factor authentication is on.
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              Sign-in asks for your authenticator code (or an email code)
              after your password.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleRegenerateBackupCodes()}
                disabled={loading}
                className="rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-neutral-300 transition hover:text-white"
              >
                <KeyRound className="mr-1 inline h-3.5 w-3.5" />
                New backup codes
              </button>
              <button
                type="button"
                onClick={() => setShowDisable((v) => !v)}
                className="rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-neutral-400 transition hover:text-red-400"
              >
                <ShieldOff className="mr-1 inline h-3.5 w-3.5" />
                Disable
              </button>
            </div>
            {showDisable && (
              <form
                onSubmit={(e) => void handleDisable(e)}
                className="mt-3 space-y-2"
              >
                <p className="text-xs text-neutral-400">
                  Enter your password to turn two-factor authentication off.
                </p>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  autoComplete="current-password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className={inputClass}
                />
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? "Disabling…" : "Disable two-factor authentication"}
                </button>
              </form>
            )}
          </>
        )}

      {backupCodes !== null && (
        <div className="mt-3 rounded-lg border border-neutral-700 bg-black p-4">
          <p className="text-sm font-medium text-white">Backup codes</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            Save these somewhere safe — each code works once, and this is
            the only time they are shown.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {backupCodes.map((c) => (
              <span
                key={c}
                className="select-all rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-center font-mono text-xs text-white"
              >
                {c}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setBackupCodes(null);
              setCodesSaved(true);
              setNote("Backup codes saved. Keep them somewhere safe.");
            }}
            disabled={codesSaved}
            className={`mt-3 ${buttonClass}`}
          >
            I&apos;ve saved these codes
          </button>
        </div>
      )}
    </div>
  );
}

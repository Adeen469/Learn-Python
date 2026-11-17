"use client";

import { useEffect, useState } from "react";
import {
  AuthError,
  AuthNote,
  AuthShell,
  BUTTON_CLASS,
  INPUT_CLASS,
} from "@/components/AuthShell";

// Second-factor step after the first factor (password or email code).
// The step only exists while the short-lived step-up cookie is valid
// (10 minutes) — after that, the user signs in again from scratch.
type Method = "totp" | "email" | "backup";

export default function TwoFactorPage() {
  const [pending, setPending] = useState<boolean | null>(null);
  const [method, setMethod] = useState<Method>("totp");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    fetch("/api/auth/2fa/pending")
      .then(async (res) => {
        const data: unknown = await res.json().catch(() => null);
        setPending(
          res.ok && (data as Record<string, unknown> | null)?.pending === true
        );
      })
      .catch(() => setPending(false));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(
      () => setCooldown((c) => Math.max(0, c - 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleSendEmailCode() {
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/send-code", { method: "POST" });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          typeof (data as Record<string, unknown> | null)?.error === "string"
            ? ((data as Record<string, unknown>).error as string)
            : "Could not send the code. Please try again."
        );
        return;
      }
      setEmailSent(true);
      setNote("Code sent to your email. It expires in 10 minutes.");
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, method }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          typeof (data as Record<string, unknown> | null)?.error === "string"
            ? ((data as Record<string, unknown>).error as string)
            : "The code is incorrect or has expired."
        );
        return;
      }
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }

  if (pending === null) {
    return (
      <AuthShell title="Two-factor authentication" subtitle="Checking your sign-in step…">
        <p className="text-center text-sm text-neutral-400">
          Please wait a moment.
        </p>
      </AuthShell>
    );
  }

  if (pending === false) {
    return (
      <AuthShell
        title="Sign-in step expired"
        subtitle="This two-factor step only lasts 10 minutes. Sign in again to continue."
      >
        <a
          href="/auth/email"
          className="block text-center text-xs text-neutral-400 underline hover:text-white"
        >
          Back to sign in
        </a>
      </AuthShell>
    );
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition ${
      active ? "bg-white text-black" : "text-neutral-400 hover:text-white"
    }`;

  return (
    <AuthShell
      title="Two-factor authentication"
      subtitle="Enter the code from your authenticator app to finish signing in."
    >
      <AuthError message={error} />
      <AuthNote message={note} />

      <div
        className="mb-4 flex rounded-lg border border-neutral-800 bg-black p-0.5"
        role="group"
        aria-label="Second-factor method"
      >
        <button
          type="button"
          onClick={() => {
            setMethod("totp");
            setCode("");
            setError(null);
            setNote(null);
          }}
          aria-pressed={method === "totp"}
          className={tabClass(method === "totp")}
        >
          Authenticator
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("email");
            setCode("");
            setError(null);
            setNote(null);
          }}
          aria-pressed={method === "email"}
          className={tabClass(method === "email")}
        >
          Email code
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("backup");
            setCode("");
            setError(null);
            setNote(null);
          }}
          aria-pressed={method === "backup"}
          className={tabClass(method === "backup")}
        >
          Backup code
        </button>
      </div>

      {method === "email" && !emailSent ? (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-neutral-400">
            We&apos;ll email a 6-digit code to the address on your account.
          </p>
          <button
            type="button"
            onClick={() => void handleSendEmailCode()}
            disabled={loading}
            className={BUTTON_CLASS}
          >
            {loading ? "Sending…" : "Send email code"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-3">
          <input
            type="text"
            required
            inputMode={method === "backup" ? "text" : "numeric"}
            autoComplete="one-time-code"
            placeholder={
              method === "backup" ? "XXXX-XXXX" : "6-digit code"
            }
            maxLength={method === "backup" ? 9 : 6}
            value={code}
            onChange={(e) =>
              setCode(
                method === "backup"
                  ? e.target.value.toUpperCase()
                  : e.target.value.replace(/\D/g, "")
              )
            }
            className={`${INPUT_CLASS} text-center text-lg tracking-[0.4em]`}
          />
          <button type="submit" disabled={loading} className={BUTTON_CLASS}>
            {loading ? "Verifying…" : "Verify and sign in"}
          </button>
          {method === "email" && (
            <p className="text-center text-xs text-neutral-500">
              {cooldown > 0 ? (
                <>Resend code in {cooldown}s</>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSendEmailCode()}
                  className="underline hover:text-white"
                >
                  Resend code
                </button>
              )}
            </p>
          )}
          {method === "backup" && (
            <p className="text-center text-xs leading-relaxed text-neutral-500">
              Backup codes work once. Find them where you saved them when
              you turned on two-factor authentication.
            </p>
          )}
        </form>
      )}
    </AuthShell>
  );
}

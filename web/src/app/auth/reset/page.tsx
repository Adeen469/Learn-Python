"use client";

import { useEffect, useState } from "react";
import {
  AuthError,
  AuthNote,
  AuthShell,
  BUTTON_CLASS,
  INPUT_CLASS,
} from "@/components/AuthShell";

// Reset password (?token=...). The token is checked on load: a bad,
// expired, or already-used link shows the invalid state instead of
// the form. A successful reset signs nobody in — the user signs in
// fresh with the new password.
export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") ?? "";
    setToken(t);
    if (!t) {
      setValid(false);
      return;
    }
    fetch(`/api/auth/email/reset?token=${encodeURIComponent(t)}`)
      .then(async (res) => {
        const data: unknown = await res.json().catch(() => null);
        setValid(
          res.ok &&
            (data as Record<string, unknown> | null)?.valid === true
        );
      })
      .catch(() => setValid(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          typeof (data as Record<string, unknown> | null)?.error === "string"
            ? ((data as Record<string, unknown>).error as string)
            : "Could not reset the password. Please try again."
        );
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (valid === null) {
    return (
      <AuthShell title="Reset password" subtitle="Checking your reset link…">
        <p className="text-center text-sm text-neutral-400">
          Please wait a moment.
        </p>
      </AuthShell>
    );
  }

  if (valid === false) {
    return (
      <AuthShell
        title="Reset link expired"
        subtitle="This reset link is invalid or has expired. Reset links work once and last 1 hour."
      >
        <a
          href="/auth/forgot"
          className="block text-center text-xs text-neutral-400 underline hover:text-white"
        >
          Request a new reset link
        </a>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a new password for your account."
    >
      <AuthError message={error} />
      {done ? (
        <>
          <AuthNote message="Password updated. Sign in with your new password." />
          <a
            href="/auth/email"
            className="block text-center text-xs text-neutral-400 underline hover:text-white"
          >
            Back to sign in
          </a>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password (at least 8 characters)"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={INPUT_CLASS}
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={INPUT_CLASS}
          />
          <button type="submit" disabled={loading} className={BUTTON_CLASS}>
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import {
  AuthError,
  AuthNote,
  AuthShell,
  BUTTON_CLASS,
  INPUT_CLASS,
} from "@/components/AuthShell";

// Forgot password: enter your email and, if an account exists, a
// reset link is sent (valid 1 hour, one-time use). The answer never
// reveals whether the email belongs to an account.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          typeof (data as Record<string, unknown> | null)?.error === "string"
            ? ((data as Record<string, unknown>).error as string)
            : "Could not send the email. Please try again."
        );
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter the email you signed up with and we'll send you a reset link."
    >
      <AuthError message={error} />
      {sent ? (
        <>
          <AuthNote
            message={`If an account exists with ${email}, we've sent a password reset link. It expires in 1 hour.`}
          />
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
            type="email"
            required
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
          />
          <button type="submit" disabled={loading} className={BUTTON_CLASS}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <p className="text-center text-xs text-neutral-500">
            <a href="/auth/email" className="underline hover:text-white">
              Back to sign in
            </a>
          </p>
        </form>
      )}
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
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
  const { t } = useLanguage();
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
            : t.auth.couldNotSendEmail
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
      title={t.auth.forgotPassword}
      subtitle={t.auth.forgotSubtitle}
    >
      <AuthError message={error} />
      {sent ? (
        <>
          <AuthNote
            message={t.auth.resetLinkSentWithExpiry(email)}
          />
          <a
            href="/auth/email"
            className="block text-center text-xs text-neutral-400 underline hover:text-white"
          >
            {t.common.backToSignIn}
          </a>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder={t.common.emailAddress}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT_CLASS}
          />
          <button type="submit" disabled={loading} className={BUTTON_CLASS}>
            {loading ? t.auth.sending : t.auth.sendResetLink}
          </button>
          <p className="text-center text-xs text-neutral-500">
            <a href="/auth/email" className="underline hover:text-white">
              {t.common.backToSignIn}
            </a>
          </p>
        </form>
      )}
    </AuthShell>
  );
}

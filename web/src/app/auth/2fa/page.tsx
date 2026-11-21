"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import CodeSlots from "@/components/CodeSlots";
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
  const { t } = useLanguage();
  const [pending, setPending] = useState<boolean | null>(null);
  const [method, setMethod] = useState<Method>("totp");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  // CodeSlots status: "error" drains the slots on a wrong code,
  // "success" washes them on a right one.
  const [slotStatus, setSlotStatus] = useState<"idle" | "error" | "success">("idle");
  // Guard against a double verify (slots auto-submit on complete AND
  // the button/Enter can fire in the same tick).
  const verifyingRef = useRef(false);

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
            : t.auth.couldNotSendCode
        );
        return;
      }
      setEmailSent(true);
      setNote(t.auth.codeSentToYourEmailWithExpiry);
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(codeToVerify: string) {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToVerify, method }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          typeof (data as Record<string, unknown> | null)?.error === "string"
            ? ((data as Record<string, unknown>).error as string)
            : t.auth.codeIncorrectOrExpired
        );
        setSlotStatus("error");
        return;
      }
      setSlotStatus("success");
      window.location.href = "/";
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    await verifyCode(code);
  }

  if (pending === null) {
    return (
      <AuthShell title={t.auth.twoFactorTitle} subtitle={t.auth.checkingSignInStep}>
        <p className="text-center text-sm text-neutral-400">
          {t.common.pleaseWait}
        </p>
      </AuthShell>
    );
  }

  if (pending === false) {
    return (
      <AuthShell
        title={t.auth.signInStepExpiredTitle}
        subtitle={t.auth.signInStepExpiredSubtitle}
      >
        <a
          href="/auth/email"
          className="block text-center text-xs text-neutral-400 underline hover:text-white"
        >
          {t.common.backToSignIn}
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
      title={t.auth.twoFactorTitle}
      subtitle={t.auth.twoFactorEnterCodeSubtitle}
    >
      <AuthError message={error} />
      <AuthNote message={note} />

      <div
        className="mb-4 flex rounded-lg border border-neutral-800 bg-black p-0.5"
        role="group"
        aria-label={t.auth.secondFactorMethodLabel}
      >
        <button
          type="button"
          onClick={() => {
            setMethod("totp");
            setCode("");
            setSlotStatus("idle");
            setError(null);
            setNote(null);
          }}
          aria-pressed={method === "totp"}
          className={tabClass(method === "totp")}
        >
          {t.auth.methodAuthenticator}
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("email");
            setCode("");
            setSlotStatus("idle");
            setError(null);
            setNote(null);
          }}
          aria-pressed={method === "email"}
          className={tabClass(method === "email")}
        >
          {t.auth.methodEmailCode}
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("backup");
            setCode("");
            setSlotStatus("idle");
            setError(null);
            setNote(null);
          }}
          aria-pressed={method === "backup"}
          className={tabClass(method === "backup")}
        >
          {t.auth.methodBackupCode}
        </button>
      </div>

      {method === "email" && !emailSent ? (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-neutral-400">
            {t.auth.emailCodeWillBeSent}
          </p>
          <button
            type="button"
            onClick={() => void handleSendEmailCode()}
            disabled={loading}
            className={BUTTON_CLASS}
          >
            {loading ? t.auth.sending : t.auth.sendEmailCode}
          </button>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-3">
          {method === "backup" ? (
            <input
              type="text"
              required
              inputMode="text"
              autoComplete="one-time-code"
              placeholder="XXXX-XXXX"
              maxLength={9}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={`${INPUT_CLASS} text-center text-lg tracking-[0.4em]`}
            />
          ) : (
            <div className="flex justify-center py-1">
              <CodeSlots
                length={6}
                value={code}
                onChange={(c) => {
                  setCode(c);
                  // Clear the error tint only once the user starts
                  // typing fresh digits — not while the error drain
                  // is clearing.
                  if (slotStatus === "error" && c !== "") setSlotStatus("idle");
                }}
                onComplete={(c) => void verifyCode(c)}
                status={slotStatus}
                disabled={loading}
                autoFocus
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading || (method !== "backup" && code.length < 6)}
            className={BUTTON_CLASS}
          >
            {loading ? t.auth.verifying : t.auth.verifyAndSignIn}
          </button>
          {method === "email" && (
            <p className="text-center text-xs text-neutral-500">
              {cooldown > 0 ? (
                <>{t.auth.resendCodeIn(cooldown)}</>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSendEmailCode()}
                  className="underline hover:text-white"
                >
                  {t.auth.resendCode}
                </button>
              )}
            </p>
          )}
          {method === "backup" && (
            <p className="text-center text-xs leading-relaxed text-neutral-500">
              {t.auth.backupCodesWorkOnce}
            </p>
          )}
        </form>
      )}
    </AuthShell>
  );
}

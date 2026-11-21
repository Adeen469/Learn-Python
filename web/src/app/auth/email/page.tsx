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

// Email sign-in / sign-up. Two ways in:
//  - password (sign-in tab) or a 6-digit code emailed to you;
//  - create an account (sign-up tab) with name + email + password,
//    then verify the emailed code before the account can sign in.
// Google sign-in stays available on both tabs.
export default function EmailAuthPage() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<"signup" | "signin">("signin");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  // CodeSlots status: "error" drains the slots on a wrong code,
  // "success" washes them on a right one.
  const [slotStatus, setSlotStatus] = useState<"idle" | "error" | "success">("idle");
  // Guard against a double verify (slots auto-submit on complete AND
  // the button/Enter can fire in the same tick).
  const verifyingRef = useRef(false);

  // Screenshot / deep-link support: ?step=code&email=... opens the
  // code step prefilled (no code is ever prefilled).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("step") === "code") {
      const prefill = params.get("email") ?? "";
      if (prefill) setEmail(prefill);
      setStep("code");
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(
      () => setCooldown((c) => Math.max(0, c - 1)),
      1000
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function postJson(url: string, payload: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data: unknown = await res.json().catch(() => null);
    return { res, data: (data ?? {}) as Record<string, unknown> };
  }

  function signedIn() {
    window.location.href = "/";
  }

  async function handleSendCode(
    targetEmail: string,
    purpose: "signup" | "signin"
  ): Promise<boolean> {
    const { res, data } = await postJson("/api/auth/email/send-otp", {
      email: targetEmail,
      purpose,
    });
    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : t.auth.couldNotSendCode
      );
      return false;
    }
    setNote(t.auth.codeSentToWithExpiry(targetEmail));
    setCooldown(60);
    return true;
  }

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const { res, data } = await postJson("/api/auth/email/signin", {
        email,
        password,
      });
      if (!res.ok) {
        if (data.needsVerification === true) {
          // The account exists but the email was never verified —
          // move to the code step (sign-up code) and send it.
          setOtpPurpose("signup");
          setStep("code");
          await handleSendCode(email, "signup");
          return;
        }
        setError(
          typeof data.error === "string"
            ? data.error
            : t.auth.couldNotSignIn
        );
        return;
      }
      if (data.needs2fa === true) {
        window.location.href = "/auth/2fa";
        return;
      }
      signedIn();
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const { res, data } = await postJson("/api/auth/email/signup", {
        email,
        password,
        name,
      });
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : t.auth.couldNotCreateAccount
        );
        return;
      }
      setOtpPurpose("signup");
      setStep("code");
      setNote(t.auth.codeSentToWithExpiry(email));
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
      const { res, data } = await postJson("/api/auth/email/verify-otp", {
        email,
        code: codeToVerify,
        purpose: otpPurpose,
      });
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : t.auth.codeIncorrectOrExpired
        );
        setSlotStatus("error");
        return;
      }
      setSlotStatus("success");
      if (data.needs2fa === true) {
        window.location.href = "/auth/2fa";
        return;
      }
      signedIn();
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    await verifyCode(code);
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
      active ? "bg-white text-black" : "text-neutral-400 hover:text-white"
    }`;

  return (
    <AuthShell
      title={step === "code" ? t.auth.enterCodeTitle : t.auth.signInWithEmail}
      subtitle={
        step === "code"
          ? t.auth.otpSubtitle(email, otpPurpose)
          : mode === "signin"
            ? t.auth.signInEmailSubtitle
            : t.auth.signUpEmailSubtitle
      }
    >
      <AuthError message={error} />
      <AuthNote message={note} />

      {step === "form" ? (
        <>
          <div
            className="mb-4 flex rounded-lg border border-neutral-800 bg-black p-0.5"
            role="group"
            aria-label={t.auth.signInOrCreateAccount}
          >
            <button
              type="button"
              onClick={() => setMode("signin")}
              aria-pressed={mode === "signin"}
              className={tabClass(mode === "signin")}
            >
              {t.common.signIn}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              aria-pressed={mode === "signup"}
              className={tabClass(mode === "signup")}
            >
              {t.auth.createAccount}
            </button>
          </div>

          {mode === "signin" ? (
            <form onSubmit={handleSignin} className="space-y-3">
              <input
                type="email"
                required
                placeholder={t.common.emailAddress}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
              />
              <input
                type="password"
                required
                placeholder={t.common.password}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT_CLASS}
              />
              <button type="submit" disabled={loading} className={BUTTON_CLASS}>
                {loading ? t.auth.signingIn : t.common.signIn}
              </button>
              <p className="text-center text-xs text-neutral-500">
                <button
                  type="button"
                  onClick={() => {
                    setOtpPurpose("signin");
                    setStep("code");
                    if (email) void handleSendCode(email, "signin");
                  }}
                  className="underline hover:text-white"
                >
                  {t.auth.continueWithEmailCode}
                </button>
                {" · "}
                <a href="/auth/forgot" className="underline hover:text-white">
                  {t.auth.forgotPassword}
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <input
                type="text"
                required
                placeholder={t.auth.namePlaceholder}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={INPUT_CLASS}
              />
              <input
                type="email"
                required
                placeholder={t.common.emailAddress}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
              />
              <input
                type="password"
                required
                minLength={8}
                placeholder={t.auth.passwordWithMinPlaceholder}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT_CLASS}
              />
              <button type="submit" disabled={loading} className={BUTTON_CLASS}>
                {loading ? t.auth.creatingAccount : t.auth.createAccount}
              </button>
            </form>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-neutral-800" />
            <span className="text-[11px] uppercase tracking-wider text-neutral-600">
              {t.common.or}
            </span>
            <span className="h-px flex-1 bg-neutral-800" />
          </div>
          <a
            href="/api/auth/google"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:border-neutral-600"
          >
            {t.auth.continueWithGoogle}
          </a>
        </>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-3">
          <div className="flex justify-center py-1">
            <CodeSlots
              length={6}
              value={code}
              onChange={(c) => {
                setCode(c);
                // Clear the error tint only once the user starts typing
                // fresh digits — not while the error drain is clearing.
                if (slotStatus === "error" && c !== "") setSlotStatus("idle");
              }}
              onComplete={(c) => void verifyCode(c)}
              status={slotStatus}
              disabled={loading}
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading || code.length < 6} className={BUTTON_CLASS}>
            {loading ? t.auth.verifying : t.auth.verifyAndContinue}
          </button>
          <p className="text-center text-xs text-neutral-500">
            {cooldown > 0 ? (
              <>{t.auth.resendCodeIn(cooldown)}</>
            ) : (
              <button
                type="button"
                onClick={() => void handleSendCode(email, otpPurpose)}
                className="underline hover:text-white"
              >
                {t.auth.resendCode}
              </button>
            )}
            {" · "}
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setCode("");
                setSlotStatus("idle");
                setError(null);
                setNote(null);
              }}
              className="underline hover:text-white"
            >
              {t.common.back}
            </button>
          </p>
        </form>
      )}
    </AuthShell>
  );
}

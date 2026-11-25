"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";
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
      // True when the stored TOTP secret no longer decrypts
      // (legacy account, key split) — no authenticator code can
      // ever verify, so the Disable form must offer the emailed
      // code instead. Absent for Google accounts.
      authenticatorBroken?: boolean;
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
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Enrollment state.
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [setupCode, setSetupCode] = useState("");
  // Password re-entry (H4): setup AND enable both verify it
  // server-side, so a stolen session alone cannot enroll an
  // authenticator. Typed once at setup, carried to enable.
  const [setupPassword, setSetupPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [codesSaved, setCodesSaved] = useState(false);

  // Disable state.
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisable, setShowDisable] = useState(false);
  // Second-factor method for disabling: the authenticator app
  // (default) or an emailed code — the recovery path when the
  // authenticator cannot verify (lost app, or a legacy secret
  // that no longer decrypts). A legacy account defaults to email.
  const [disableMethod, setDisableMethod] = useState<"totp" | "email">("totp");
  const [disableEmailSent, setDisableEmailSent] = useState(false);
  const [disableCooldown, setDisableCooldown] = useState(0);

  // Resend cooldown countdown for the disable email code.
  useEffect(() => {
    if (disableCooldown <= 0) return;
    const timer = setTimeout(() => setDisableCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [disableCooldown]);

  // Backup-code regeneration state.
  const [regenCode, setRegenCode] = useState("");
  const [showRegen, setShowRegen] = useState(false);

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

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const { res, data } = await postJson("/api/auth/2fa/setup", {
        password: setupPassword,
      });
      if (!res.ok) {
        setError(errorMessage(data, t.settings.couldNotStartTwoFactorSetup));
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
        password: setupPassword,
      });
      if (!res.ok) {
        setError(errorMessage(data, t.settings.twoFactorCodeIncorrect));
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
      setSetupPassword("");
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleSendDisableCode() {
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const { res, data } = await postJson("/api/auth/2fa/disable/send-code");
      if (!res.ok) {
        setError(errorMessage(data, t.settings.couldNotSendDisableCode));
        return;
      }
      setDisableEmailSent(true);
      setDisableCooldown(60);
      setNote(t.auth.codeSentToYourEmailWithExpiry);
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
        code: disableCode,
        method: disableMethod,
      });
      if (!res.ok) {
        setError(errorMessage(data, t.settings.couldNotDisableTwoFactor));
        return;
      }
      setShowDisable(false);
      setDisablePassword("");
      setDisableCode("");
      setDisableEmailSent(false);
      setDisableCooldown(0);
      setNote(t.settings.twoFactorOff);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerateBackupCodes(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setLoading(true);
    try {
      const { res, data } = await postJson("/api/auth/2fa/backup-codes", {
        code: regenCode,
      });
      if (!res.ok) {
        setError(errorMessage(data, t.settings.couldNotGenerateBackupCodes));
        return;
      }
      const codes = data.backupCodes;
      setBackupCodes(Array.isArray(codes) ? (codes as string[]) : []);
      setCodesSaved(false);
      setShowRegen(false);
      setRegenCode("");
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
        {t.auth.twoFactorTitle}
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
        <p className="mt-2 text-sm text-neutral-400">{t.common.loading}</p>
      )}

      {status !== null && !status.signedIn && (
        <>
          <p className="mt-2 text-sm text-neutral-400">
            {t.settings.twoFactorSignInRequired}
          </p>
          <a
            href="/auth/email"
            className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            {t.common.signIn}
          </a>
        </>
      )}

      {status !== null && status.signedIn && status.auth === "google" && (
        <p className="mt-2 text-sm text-neutral-400">
          {t.settings.twoFactorGoogleManaged}
        </p>
      )}

      {status !== null &&
        status.signedIn &&
        status.auth === "email" &&
        !status.totpEnabled &&
        backupCodes === null && (
          <>
            <p className="mt-2 text-sm text-neutral-400">
              {t.settings.twoFactorIntro}
            </p>
            {qr === null ? (
              <form
                onSubmit={(e) => void handleSetup(e)}
                className="mt-3 space-y-2"
              >
                <input
                  type="password"
                  required
                  placeholder={t.common.password}
                  autoComplete="current-password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={buttonClass}
                >
                  {loading ? t.settings.twoFactorStarting : t.settings.setUpTwoFactor}
                </button>
              </form>
            ) : (
              <form onSubmit={(e) => void handleEnable(e)} className="mt-4 space-y-3">
                <p className="text-xs leading-relaxed text-neutral-400">
                  {t.settings.twoFactorScanQr}
                </p>
                {qr && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qr}
                    alt={t.settings.twoFactorQrAlt}
                    width={220}
                    height={220}
                    className="rounded-lg border border-neutral-800 bg-white p-2"
                  />
                )}
                {secret && (
                  <p className="text-xs text-neutral-400">
                    {t.settings.cantScanEnterSecret}
                    <span className="select-all font-mono text-white">
                      {secret}
                    </span>
                  </p>
                )}
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder={t.common.sixDigitCodeLabel}
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) =>
                    setSetupCode(e.target.value.replace(/\D/g, ""))
                  }
                  className={`${inputClass} text-center tracking-[0.4em]`}
                />
                <input
                  type="password"
                  required
                  placeholder={t.common.password}
                  autoComplete="current-password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className={inputClass}
                />
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? t.auth.verifying : t.settings.turnOnTwoFactor}
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
              {t.settings.twoFactorOn}
            </p>
            <p className="mt-1 text-sm text-neutral-400">
              {t.settings.twoFactorOnExplainer}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowRegen((v) => !v)}
                disabled={loading}
                className="rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-neutral-300 transition hover:text-white"
              >
                <KeyRound className="mr-1 inline h-3.5 w-3.5" />
                {t.settings.newBackupCodes}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Opening the form defaults to the emailed code
                  // for a legacy account (its authenticator can
                  // never verify); closing it clears the code state.
                  if (!showDisable && status.authenticatorBroken === true) {
                    setDisableMethod("email");
                  }
                  if (showDisable) {
                    setDisableEmailSent(false);
                    setDisableCode("");
                    setDisableCooldown(0);
                  }
                  setShowDisable((v) => !v);
                }}
                className="rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-neutral-400 transition hover:text-red-400"
              >
                <ShieldOff className="mr-1 inline h-3.5 w-3.5" />
                {t.settings.disable}
              </button>
            </div>
            {showRegen && (
              <form
                onSubmit={(e) => void handleRegenerateBackupCodes(e)}
                className="mt-3 space-y-2"
              >
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder={t.common.sixDigitCodeLabel}
                  maxLength={6}
                  value={regenCode}
                  onChange={(e) =>
                    setRegenCode(e.target.value.replace(/\D/g, ""))
                  }
                  className={`${inputClass} text-center tracking-[0.4em]`}
                />
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? t.settings.twoFactorStarting : t.settings.newBackupCodes}
                </button>
              </form>
            )}
            {showDisable && (
              <form
                onSubmit={(e) => void handleDisable(e)}
                className="mt-3 space-y-2"
              >
                {status.authenticatorBroken === true && (
                  <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
                    {t.settings.authenticatorCannotVerify}
                  </p>
                )}
                <div
                  className="flex gap-1"
                  role="tablist"
                  aria-label={t.auth.secondFactorMethodLabel}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-pressed={disableMethod === "totp"}
                    onClick={() => setDisableMethod("totp")}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      disableMethod === "totp"
                        ? "border-white bg-white text-black"
                        : "border-neutral-800 bg-black text-neutral-300 hover:text-white"
                    }`}
                  >
                    {t.auth.methodAuthenticator}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-pressed={disableMethod === "email"}
                    onClick={() => setDisableMethod("email")}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      disableMethod === "email"
                        ? "border-white bg-white text-black"
                        : "border-neutral-800 bg-black text-neutral-300 hover:text-white"
                    }`}
                  >
                    {t.auth.methodEmailCode}
                  </button>
                </div>
                <p className="text-xs text-neutral-400">
                  {disableMethod === "email"
                    ? t.settings.disableTwoFactorEmailPrompt
                    : t.settings.disableTwoFactorPrompt}
                </p>
                <input
                  type="password"
                  required
                  placeholder={t.common.password}
                  autoComplete="current-password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className={inputClass}
                />
                {disableMethod === "email" && !disableEmailSent && (
                  <>
                    <p className="text-xs text-neutral-400">
                      {t.auth.emailCodeWillBeSent}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleSendDisableCode()}
                      disabled={loading}
                      className={buttonClass}
                    >
                      {loading ? t.auth.sending : t.auth.sendEmailCode}
                    </button>
                  </>
                )}
                {disableMethod === "email" && disableEmailSent && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    {disableCooldown > 0 ? (
                      <span>{t.auth.resendCodeIn(disableCooldown)}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleSendDisableCode()}
                        disabled={loading}
                        className="rounded-lg border border-neutral-800 bg-black px-3 py-1.5 text-xs text-neutral-300 transition hover:text-white disabled:opacity-50"
                      >
                        {t.auth.resendCode}
                      </button>
                    )}
                  </div>
                )}
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder={t.common.sixDigitCodeLabel}
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) =>
                    setDisableCode(e.target.value.replace(/\D/g, ""))
                  }
                  className={`${inputClass} text-center tracking-[0.4em]`}
                />
                <button type="submit" disabled={loading} className={buttonClass}>
                  {loading ? t.settings.disablingTwoFactor : t.settings.disableTwoFactor}
                </button>
              </form>
            )}
          </>
        )}

      {backupCodes !== null && (
        <div className="mt-3 rounded-lg border border-neutral-700 bg-black p-4">
          <p className="text-sm font-medium text-white">{t.settings.backupCodesTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            {t.settings.backupCodesWarning}
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
              setNote(t.settings.backupCodesSaved);
            }}
            disabled={codesSaved}
            className={`mt-3 ${buttonClass}`}
          >
            {t.settings.savedBackupCodes}
          </button>
        </div>
      )}
    </div>
  );
}

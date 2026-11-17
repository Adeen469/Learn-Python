// Outbound email — Gmail SMTP via nodemailer.
//
// The app has no custom domain, so a transactional provider that
// needs domain verification cannot reach users. Gmail SMTP needs no
// domain and no card: GMAIL_USER is the Gmail address, and
// GMAIL_APP_PASSWORD is a 16-character app password (Google account
// -> Security -> 2-Step Verification -> App passwords).
//
// Fail-closed: getEmailConfig() returns null when either var is
// missing, and sendMail() then reports { ok: false, reason:
// "not_configured" } — routes answer 503, never a silent drop and
// never a fallback sender.
//
// This file is imported ONLY by API route handlers. Never log the
// message contents, recipients beyond the event, or any code/token.

import nodemailer from "nodemailer";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export type SendMailResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "failed" };

export function getEmailConfig(): {
  user: string;
  appPassword: string;
} | null {
  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!user || !appPassword) return null;
  return { user, appPassword };
}

export async function sendMail(message: EmailMessage): Promise<SendMailResult> {
  const config = getEmailConfig();
  if (!config) return { ok: false, reason: "not_configured" };
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: config.user, pass: config.appPassword },
    });
    await transporter.sendMail({
      from: `Learn Python <${config.user}>`,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

/** Shared footer for every auth email (plain text + HTML versions). */
export function authEmailFooterText(): string {
  return "\n\n— Learn Python\nIf you didn't ask for this, you can safely ignore this email.";
}

export function authEmailFooterHtml(): string {
  return `<p style="color:#737373;font-size:12px;margin-top:24px;">— Learn Python<br>If you didn't ask for this, you can safely ignore this email.</p>`;
}

function codeBlockHtml(code: string): string {
  return `<p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0;">${code}</p>`;
}

/** Sign-up / sign-in verification code (valid 10 minutes). */
export function otpEmail(code: string, purpose: "signup" | "signin"): {
  subject: string;
  text: string;
  html: string;
} {
  const action =
    purpose === "signup"
      ? "confirm your Learn Python account"
      : "sign in to Learn Python";
  return {
    subject: `Your Learn Python code: ${code}`,
    text:
      `Your Learn Python verification code is ${code}.\n` +
      `Use it to ${action}. The code expires in 10 minutes.` +
      authEmailFooterText(),
    html:
      `<p>Your Learn Python verification code is:</p>` +
      codeBlockHtml(code) +
      `<p>Use it to ${action}. The code expires in 10 minutes.</p>` +
      authEmailFooterHtml(),
  };
}

/** Two-factor email code (valid 10 minutes). */
export function twoFaEmail(code: string): {
  subject: string;
  text: string;
  html: string;
} {
  return {
    subject: `Your Learn Python sign-in code: ${code}`,
    text:
      `Your Learn Python two-factor code is ${code}.\n` +
      `Enter it to finish signing in. The code expires in 10 minutes.` +
      authEmailFooterText(),
    html:
      `<p>Your Learn Python two-factor code is:</p>` +
      codeBlockHtml(code) +
      `<p>Enter it to finish signing in. The code expires in 10 minutes.</p>` +
      authEmailFooterHtml(),
  };
}

/** Password-reset link (valid 1 hour, single-use). */
export function resetEmail(link: string): {
  subject: string;
  text: string;
  html: string;
} {
  return {
    subject: "Reset your Learn Python password",
    text:
      `Reset your Learn Python password with this link (valid for 1 hour, one-time use):\n${link}` +
      authEmailFooterText(),
    html:
      `<p>Reset your Learn Python password with the link below (valid for 1 hour, one-time use):</p>` +
      `<p><a href="${link}">${link}</a></p>` +
      authEmailFooterHtml(),
  };
}

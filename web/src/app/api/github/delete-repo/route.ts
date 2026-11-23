import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  assertGithubOwnerAllowed,
  deleteUserRepo,
  isValidGithubSlug,
  mapGithubError,
  oversizedBodyResponse,
} from "@/lib/github";
import { logGithubTokenUse, resolveSessionGithubToken } from "@/lib/github-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkUserLimit, validateBody } from "@/lib/api-handler";
import { getAuthPrereqs } from "@/lib/auth-routes";
import {
  decryptUserTotpSecret,
  findBackupCode,
  TOTP_MAX_FAILED_ATTEMPTS,
  verifyPassword,
  verifyTotpCodeWithStep,
} from "@/lib/auth-email";
import {
  bumpTotpFailedAttempts,
  claimBackupCode,
  claimTotpStep,
  getUserByEmailResult,
} from "@/lib/auth-store";

// Delete a repository the user owns. Destructive on purpose, so the
// limit is tighter than the commit route (10/min) and the client
// must make the user type the full owner/repo name first (the
// editor's delete dialog). Only the repo OWNER can delete it:
// GitHub answers 403 for a collaborator, and 403 with
// "Resource not accessible by personal access token" when the token
// lacks the delete_repo scope. Both are surfaced separately so the
// user knows whether to ask the owner or reconnect the token.
//
// Step-up (R3-M2): a bare session is NOT enough — deleting is
// permanent, commits are not. The caller must re-enter the account
// password (when the account has one) and, when 2FA is on, a
// current TOTP code or a backup code — exactly like 2FA disable.
// A Google-only account has no LP password and no LP 2FA, so there
// is nothing to step up with there and the session gate stands.
// The client collects both in the same delete-confirmation dialog
// (GitHub page); the server enforces them — the typed owner/repo
// confirmation is client-side only and is never trusted here.
const deleteRepoSchema = z.object({
  owner: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  repo: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().max(128).optional(),
  code: z.string().max(64).optional(),
});

const DELETE_BODY_MAX_BYTES = 256 * 1024;

export async function DELETE(req: NextRequest) {
  let limit;
  try {
    limit = await checkRateLimit(`github-delete:${getClientIp(req)}`, 10, 60_000, Date.now(), { failClosed: true });
  } catch {
    return NextResponse.json(
      { error: "GitHub is temporarily unavailable." },
      { status: 503 }
    );
  }
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please slow down and retry shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  const tooLarge = oversizedBodyResponse(req, DELETE_BODY_MAX_BYTES);
  if (tooLarge) return tooLarge;

  const resolved = await resolveSessionGithubToken(req);
  if ("response" in resolved) return resolved.response;
  const { token, email } = resolved;

  // Per-user bucket alongside the per-IP one (R3-L12), so one user
  // behind a shared NAT cannot starve another user's deletes — and
  // rotating IPs does not remove all friction from step-up guessing.
  const userBlocked = await checkUserLimit(email, "github-delete", 10, 60_000);
  if (userBlocked) return userBlocked;

  try {
    const body = await req.json();
    const parsed = validateBody(body, deleteRepoSchema, "Invalid owner or repo");
    if (!parsed.ok) return parsed.response;
    if (!isValidGithubSlug(parsed.data.owner) || !isValidGithubSlug(parsed.data.repo)) {
      return NextResponse.json({ error: "Invalid owner or repo" }, { status: 400 });
    }

    // Step-up gate (R3-M2). A DB read failure fails CLOSED (503) —
    // a blip must not silently skip the password/TOTP check — while
    // a genuinely missing row (pure Google account, no LP password
    // or 2FA) has nothing to step up with and proceeds on the
    // session alone, as before.
    const row = await getUserByEmailResult(email);
    if (row.status === "error") {
      return NextResponse.json(
        { error: "Could not verify your account — please try again." },
        { status: 503 }
      );
    }
    if (row.status === "found") {
      const user = row.user;
      if (user.password_hash) {
        const password = parsed.data.password;
        if (typeof password !== "string" || password.length === 0) {
          return NextResponse.json(
            { error: "Enter your password to delete this repo." },
            { status: 400 }
          );
        }
        if (!(await verifyPassword(password, user.password_hash))) {
          return NextResponse.json({ error: "Invalid password." }, { status: 401 });
        }
      }
      if (user.totp_enabled) {
        const code = parsed.data.code;
        if (typeof code !== "string" || code.length === 0) {
          return NextResponse.json(
            { error: "Enter a code from your authenticator app (or a backup code) to delete this repo." },
            { status: 400 }
          );
        }
        // Per-account attempt cap, same 5-failure lockout as
        // 2FA verify/disable: without it the cap was bypassable
        // by guessing codes here instead.
        if ((user.totp_failed_attempts ?? 0) >= TOTP_MAX_FAILED_ATTEMPTS) {
          return NextResponse.json(
            { error: "The code is incorrect. Check your authenticator app and try again." },
            { status: 400 }
          );
        }
        // Second-factor proof, mirroring 2FA disable: a current
        // TOTP code, or one of the backup codes (consumed on use —
        // a step-up code must not stay valid for a second delete).
        // A replayed TOTP code fails the step claim below.
        let matchedStep: number | null = null;
        let codeOk = false;
        const prereqs = getAuthPrereqs(req);
        if (user.totp_secret_enc && prereqs) {
          const secret = decryptUserTotpSecret(user.totp_secret_enc);
          const matched = secret ? verifyTotpCodeWithStep(secret, code) : null;
          const replay =
            matched !== null &&
            user.totp_last_step !== null &&
            user.totp_last_step !== undefined &&
            matched.step === user.totp_last_step;
          if (matched && !replay) {
            codeOk = true;
            matchedStep = matched.step;
          }
        }
        if (!codeOk) {
          const matchedBackup = await findBackupCode(user.backup_codes ?? [], code);
          if (matchedBackup !== null) {
            codeOk = await claimBackupCode(user.id, matchedBackup);
          }
        }
        if (!codeOk) {
          await bumpTotpFailedAttempts(user.id);
          return NextResponse.json(
            { error: "The code is incorrect. Check your authenticator app and try again." },
            { status: 400 }
          );
        }
        // Replay protection: claim the step atomically BEFORE
        // deleting — a second flow presenting the same code loses
        // the claim and fails here, while the repo stays.
        if (matchedStep !== null) {
          const stepClaim = await claimTotpStep(user.id, matchedStep);
          if (stepClaim === "replay" || stepClaim === "error") {
            return NextResponse.json(
              { error: "The code is incorrect. Check your authenticator app and try again." },
              { status: 400 }
            );
          }
        }
      }
    }

    const allowed = await assertGithubOwnerAllowed(token, parsed.data.owner, parsed.data.repo);
    if (!allowed) {
      return NextResponse.json(
        { error: "You can only delete repos owned by you or your GitHub organisations." },
        { status: 403 }
      );
    }

    await deleteUserRepo(token, parsed.data.owner, parsed.data.repo);
    void logGithubTokenUse(email, "repo_deleted", `${parsed.data.owner}/${parsed.data.repo}`, getClientIp(req));
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Resource not accessible by personal access token")) {
      return NextResponse.json(
        { error: "Your token needs the delete_repo scope — create a new token from the GitHub page with repo + delete_repo." },
        { status: 403 }
      );
    }
    const mapped = mapGithubError(err);
    if (mapped.status === 403) {
      return NextResponse.json(
        { error: "Only the repo owner can delete it — collaborators cannot delete a repo they don't own." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}

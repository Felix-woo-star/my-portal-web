import crypto from "crypto";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function issuePasswordResetToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
}

export async function updatePasswordWithResetToken(rawToken: string, password: string) {
  const tokenHash = hashToken(rawToken);
  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (!token) return false;
  if (token.usedAt) return false;
  if (token.expiresAt.getTime() < Date.now()) return false;

  const hashedPassword = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: token.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: token.userId,
        id: { not: token.id },
      },
    }),
  ]);

  return true;
}

function getBaseUrlFromRequest(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

export function buildResetLink(request: Request, locale: string, token: string) {
  const configuredBase = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  const base = (configuredBase || getBaseUrlFromRequest(request)).replace(/\/$/, "");
  return `${base}/${locale}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendResetPasswordEmail(params: {
  to: string;
  resetLink: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.info(`[password-reset] Email fallback for ${params.to}: ${params.resetLink}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: "Reset your Momohubs password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset your password</h2>
          <p>Click the link below to set a new password.</p>
          <p><a href="${params.resetLink}">${params.resetLink}</a></p>
          <p>This link expires in 30 minutes.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${payload}`);
  }
}

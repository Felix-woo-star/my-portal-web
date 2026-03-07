import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  buildResetLink,
  isValidEmail,
  issuePasswordResetToken,
  normalizeEmail,
  sendResetPasswordEmail,
} from "@/lib/password-reset";

const SUPPORTED_LOCALES = ["ko", "en", "ja"];

function genericResponse() {
  return NextResponse.json({
    success: true,
    message: "If an account exists for this email, a reset link has been sent.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const locale = SUPPORTED_LOCALES.includes(String(body.locale)) ? String(body.locale) : "ko";

    if (!email || !isValidEmail(email)) {
      return genericResponse();
    }

    const user = await prisma.user.findUnique({
      where: { username: email },
      select: { id: true, username: true },
    });

    if (!user) {
      return genericResponse();
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    const token = await issuePasswordResetToken(user.id);
    const resetLink = buildResetLink(request, locale, token);

    await sendResetPasswordEmail({ to: user.username, resetLink });

    return genericResponse();
  } catch (error) {
    console.error("Forgot password error:", error);
    return genericResponse();
  }
}

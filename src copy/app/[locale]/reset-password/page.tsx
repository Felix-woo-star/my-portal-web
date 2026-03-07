"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("invalidOrExpiredToken"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("errorMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || t("invalidOrExpiredToken"));
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("resetPasswordTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("resetPasswordDescription")}</p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-2 text-center">
              <p className="text-sm text-foreground">{t("passwordResetSuccess")}</p>
              <Link href="/login" className="text-sm text-primary hover:underline">
                {t("loginLink")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder={t("newPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-white/10"
                required
                minLength={4}
              />
              <Input
                type="password"
                placeholder={t("confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-secondary/50 border-white/10"
                required
                minLength={4}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {t("resetButton")}
              </Button>
            </form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="justify-center">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              {t("forgotPasswordLink")}
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

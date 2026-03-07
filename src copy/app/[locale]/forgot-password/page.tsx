"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (!res.ok) {
        setError(t("errorGeneric"));
        return;
      }

      setSubmitted(true);
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
          <CardTitle className="text-2xl font-bold">{t("forgotPasswordTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("forgotPasswordDescription")}</p>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-2 text-center">
              <p className="text-sm text-foreground">{t("resetEmailSent")}</p>
              <p className="text-xs text-muted-foreground">{t("resetEmailSentHint")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder={t("username")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-white/10"
                required
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {t("sendResetLink")}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            {t("loginLink")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

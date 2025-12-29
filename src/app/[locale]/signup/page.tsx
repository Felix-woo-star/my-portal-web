"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

import { useTranslations } from "next-intl";

export default function SignupPage() {
    const t = useTranslations('Auth');
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError(t('errorMismatch'));
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/login");
            } else {
                setError(data.error || t('errorGeneric'));
            }
        } catch (err) {
            setError(t('errorGeneric'));
        }
    };

    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
            <Card className="w-full max-w-md bg-card/50 backdrop-blur border-white/10">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t('signupTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder={t('username')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-secondary/50 border-white/10"
                                required
                            />
                            <Input
                                type="password"
                                placeholder={t('password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-secondary/50 border-white/10"
                                required
                            />
                            <Input
                                type="password"
                                placeholder={t('confirmPassword')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-secondary/50 border-white/10"
                                required
                            />
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </div>
                        <Button type="submit" className="w-full">
                            {t('signupButton')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        {t('hasAccount')}{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            {t('loginLink')}
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

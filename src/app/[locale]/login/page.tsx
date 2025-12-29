"use client";

import { useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

import { useTranslations } from "next-intl";

export default function LoginPage() {
    const t = useTranslations('Auth');
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await login(password, username);
        if (result.success) {
            if (result.role === 'ADMIN') {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } else {
            setError(t('errorInvalid'));
        }
    };

    return (
        <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
            <Card className="w-full max-w-md bg-card/50 backdrop-blur border-white/10">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{t('loginTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
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
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </div>
                        <Button type="submit" className="w-full">
                            {t('loginButton')}
                        </Button>
                    </form>
                </CardContent>
                <div className="p-6 pt-0 flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        {t('noAccount')}{" "}
                        <Link href="/signup" className="text-primary hover:underline">
                            {t('signupLink')}
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
}

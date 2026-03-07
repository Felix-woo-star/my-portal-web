"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface User {
    username: string;
    role: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (password: string, email?: string) => Promise<{ success: boolean; role?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_KEY = "momohubs_auth";
const USER_KEY = "momohubs_user";
const LEGACY_AUTH_KEY = "mz_auth";
const LEGACY_USER_KEY = "mz_user";

function getInitialAuthState() {
    if (typeof window === "undefined") {
        return { isAuthenticated: false, user: null as User | null };
    }

    const auth = sessionStorage.getItem(AUTH_KEY) ?? sessionStorage.getItem(LEGACY_AUTH_KEY);
    const storedUser = sessionStorage.getItem(USER_KEY) ?? sessionStorage.getItem(LEGACY_USER_KEY);
    let user: User | null = null;

    if (storedUser) {
        try {
            user = JSON.parse(storedUser) as User;
        } catch {
            sessionStorage.removeItem(USER_KEY);
            sessionStorage.removeItem(LEGACY_USER_KEY);
        }
    }

    return {
        isAuthenticated: auth === "true",
        user,
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialState = useMemo(() => getInitialAuthState(), []);
    const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
    const [user, setUser] = useState<User | null>(initialState.user);
    const router = useRouter();

    const login = useCallback(async (password: string, email?: string) => {
        try {
            const normalizedEmail = email?.trim().toLowerCase();
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, email: normalizedEmail }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setIsAuthenticated(true);
                const userData = { username: data.username || normalizedEmail || 'admin', role: data.role };
                setUser(userData);
                sessionStorage.setItem(AUTH_KEY, "true");
                sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
                return { success: true, role: data.role };
            }
            return { success: false };
        } catch {
            return { success: false };
        }
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUser(null);
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(LEGACY_AUTH_KEY);
        sessionStorage.removeItem(LEGACY_USER_KEY);
        router.push("/");
    }, [router]);

    const value = useMemo(
        () => ({ isAuthenticated, user, login, logout }),
        [isAuthenticated, user, login, logout],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

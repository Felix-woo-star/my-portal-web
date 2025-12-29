"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useState, useTransition } from "react";
import { Menu, X, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const t = useTranslations('Navbar');
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { name: t('home'), href: "/" },
    { name: t('board'), href: "/board" },
    { name: t('video'), href: "/video" },
  ];

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-xl font-bold tracking-tighter text-foreground">
            MZ<span className="text-primary">PORTAL</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}




          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Switch Language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSelectChange('ko')} disabled={isPending}>
                한국어
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectChange('en')} disabled={isPending}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelectChange('ja')} disabled={isPending}>
                日本語
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary">
                  Admin
                </Link>
              )}
              <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('login')}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-background">
          <div className="flex flex-col space-y-4 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex gap-2 justify-center py-2">
              <Button variant={locale === 'ko' ? 'secondary' : 'ghost'} size="sm" onClick={() => onSelectChange('ko')}>KO</Button>
              <Button variant={locale === 'en' ? 'secondary' : 'ghost'} size="sm" onClick={() => onSelectChange('en')}>EN</Button>
              <Button variant={locale === 'ja' ? 'secondary' : 'ghost'} size="sm" onClick={() => onSelectChange('ja')}>JA</Button>
            </div>
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="default" className="w-full bg-primary text-primary-foreground" onClick={() => { logout(); setIsOpen(false); }}>
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="default" className="w-full bg-primary text-primary-foreground">
                  {t('login')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

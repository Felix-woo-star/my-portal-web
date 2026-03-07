"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function VisitTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTrackedPath.current === pathname) {
      return;
    }

    lastTrackedPath.current = pathname;

    void fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "visit",
        page: pathname,
        username: user?.username,
        userRole: user?.role,
      }),
      keepalive: true,
    }).catch(() => {
      // Tracking failures should not affect page UX.
    });
  }, [pathname, user?.role, user?.username]);

  return null;
}

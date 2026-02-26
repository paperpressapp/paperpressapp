"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, initializeAuth } from "@/stores/authStore";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/welcome", "/terms", "/privacy", "/onboarding", "/auth/callback", "/admin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isAdmin, profile } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    console.log("AuthProvider running, pathname:", pathname);

    if (pathname?.startsWith("/admin")) {
      console.log("Admin route - skipping redirect");
      return;
    }

    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || (route !== "/" && pathname?.startsWith(route + "/"))
    );
    const hasAdminToken = typeof window !== "undefined" && !!localStorage.getItem("admin_token");

    if (isAuthenticated) {
      if (pathname === "/" || pathname === "/welcome" || pathname?.startsWith("/auth")) {
        if (isAdmin || hasAdminToken) {
          router.replace("/admin");
        } else {
          router.replace("/home");
        }
      }
    } else {
      if (!isPublicRoute && !pathname?.startsWith("/_not-found")) {
        router.replace("/welcome");
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, profile, pathname, router, mounted]);

  return <>{children}</>;
}

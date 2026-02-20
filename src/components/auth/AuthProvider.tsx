"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, initializeAuth } from "@/stores/authStore";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/welcome", "/terms", "/privacy", "/onboarding", "/auth/callback"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // isLoading is the authoritative "auth not yet resolved" flag —
  // it's set to false ONLY after onAuthStateChange fires INITIAL_SESSION.
  const { isAuthenticated, isLoading, isAdmin, profile } = useAuthStore();

  useEffect(() => {
    // Start the auth listener. No need to track a separate initialized flag —
    // isLoading going false is the signal that auth state is ready.
    initializeAuth();
  }, []);

  useEffect(() => {
    // Don't do anything until Supabase has resolved the initial session
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname?.startsWith(route));

    if (isAuthenticated) {
      // Redirect away from auth/guest pages once logged in
      if (pathname === "/" || pathname === "/welcome" || pathname?.startsWith("/auth")) {
        if (isAdmin) {
          router.replace("/admin");
        } else {
          router.replace("/home");
        }
      }
      if (pathname?.startsWith("/admin") && !isAdmin) {
        router.replace("/home");
      }
    } else {
      // Redirect unauthenticated users away from protected routes
      if (!isPublicRoute && !pathname?.startsWith("/_not-found")) {
        router.replace("/welcome");
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, profile, pathname, router]);

  return <>{children}</>;
}

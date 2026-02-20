"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { AppLayout } from "./AppLayout";
import { BottomNavigation } from "./BottomNavigation";

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
  requireOnboarding?: boolean;
}

export function MainLayout({
  children,
  showBottomNav = true,
  className = "",
  requireOnboarding = false,
}: MainLayoutProps) {
  const router = useRouter();
  const loadUser = useUserStore((state) => state.loadFromStorage);
  const { isAuthenticated, profile } = useAuthStore();

  useEffect(() => {
    loadUser();

    if (requireOnboarding) {
      const userName = localStorage.getItem("paperpress_user_name");
      if (!userName) {
        router.replace("/welcome");
      }
    }
  }, [router, loadUser, requireOnboarding]);

  // Use inline style so both 88px nav height + safe-area-inset-bottom are combined.
  // Two pb-* Tailwind classes can't stack — only one wins in the stylesheet.
  const paddingBottomStyle = showBottomNav
    ? { paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))" }
    : { paddingBottom: "env(safe-area-inset-bottom, 0px)" };

  return (
    <AppLayout>
      <div
        className={cn(
          "flex flex-col min-h-screen gpu-accelerate",
          className
        )}
        style={paddingBottomStyle}
      >
        <main className="flex-1 overflow-x-hidden smooth-scroll">
          {children}
        </main>

        {showBottomNav && <BottomNavigation />}
      </div>
    </AppLayout>
  );
}

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

  return (
    <AppLayout>
      <div
        className={cn(
          "relative min-h-screen",
          className
        )}
      >
        {/* Main content area */}
        <div 
          className="min-h-screen"
          style={{ 
            paddingBottom: showBottomNav 
              ? "calc(90px + env(safe-area-inset-bottom, 0px))" 
              : "env(safe-area-inset-bottom, 0px)" 
          }}
        >
          {children}
        </div>

        {/* Fixed bottom navigation */}
        {showBottomNav && <BottomNavigation />}
      </div>
    </AppLayout>
  );
}

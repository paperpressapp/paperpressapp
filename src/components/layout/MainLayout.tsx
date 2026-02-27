"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { AppLayout } from "./AppLayout";
import { BottomNavigation } from "./BottomNavigation";
import { Header } from "@/components/Header";

interface MainLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  className?: string;
  requireOnboarding?: boolean;
  topSafe?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
}

export function MainLayout({
  children,
  showBottomNav = true,
  className = "",
  requireOnboarding = false,
  topSafe = true,
  showHeader = true,
  headerTitle = "PaperPress",
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
    <AppLayout topSafe={topSafe} bottomSafe={false}>
      <div className={cn("h-full flex flex-col bg-[#0A0A0A]", className)}>
        {showHeader && <Header title={headerTitle} />}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        {showBottomNav && <BottomNavigation />}
      </div>
    </AppLayout>
  );
}

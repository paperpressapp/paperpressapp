"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, initializeAuth } from "@/stores/authStore";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (hasChecked.current) return;
    hasChecked.current = true;

    if (requireAuth && !isAuthenticated) {
      router.replace("/welcome");
      return;
    }

    if (requireAdmin && profile?.role !== 'admin') {
      router.replace("/home");
      return;
    }

    setIsAuthorized(true);
  }, [isLoading, isAuthenticated, profile, requireAuth, requireAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl">
          <FileText className="w-8 h-8 text-[#1E88E5]" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return fallback || null;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile } = useAuthStore();
  const [canShow, setCanShow] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      if (profile?.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
      return;
    }

    if (!isAuthenticated) {
      setCanShow(true);
    }
  }, [isLoading, isAuthenticated, profile, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl">
          <FileText className="w-8 h-8 text-[#1E88E5]" />
        </div>
      </div>
    );
  }

  if (isAuthenticated || !canShow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl">
          <FileText className="w-8 h-8 text-[#1E88E5]" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

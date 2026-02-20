"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { AppLoader } from "@/components/shared";
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
  const pathname = usePathname();
  const { isAuthenticated, isLoading, profile } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const redirecting = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      if (!redirecting.current) {
        redirecting.current = true;
        router.replace("/welcome");
      }
      return;
    }

    if (requireAdmin && profile?.role !== 'admin') {
      if (!redirecting.current) {
        redirecting.current = true;
        router.replace("/home");
      }
      return;
    }

    setIsAuthorized(true);
  }, [isLoading, isAuthenticated, profile, requireAuth, requireAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl mb-4"
          >
            <FileText className="w-8 h-8 text-[#1E88E5]" />
          </motion.div>
          <motion.div
            className="flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-white/60"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
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
  const [mounted, setMounted] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      if (profile?.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    }
  }, [mounted, isLoading, isAuthenticated, profile, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FileText className="w-8 h-8 text-white/50" />
        </motion.div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

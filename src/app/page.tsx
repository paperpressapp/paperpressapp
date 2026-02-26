"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore, initializeAuth } from "@/stores/authStore";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

export default function SplashPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, profile } = useAuthStore();
  const [logoError, setLogoError] = useState(false);
  const hasNavigated = useRef(false);
  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    initializeAuth();

    // Force navigation after 3 seconds max (increased from 2s for safety)
    const forceTimer = setTimeout(() => {
      if (!hasNavigated.current) {
        setForceReady(true);
      }
    }, 3000);

    return () => clearTimeout(forceTimer);
  }, []);

  useEffect(() => {
    // Navigate when loading is done OR force ready
    if (hasNavigated.current) return;

    if (!isLoading || forceReady) {
      hasNavigated.current = true;

      const navigate = async () => {
        if (Capacitor.isNativePlatform()) {
          try { await SplashScreen.hide(); } catch (e) { }
        }
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fixed routing logic - Supabase auth takes priority
        if (isAuthenticated && profile) {
          // Authenticated Supabase user - always go home (or admin)
          router.replace(profile.role === 'admin' ? "/admin" : "/home");
        } else {
          // Guest - check if they've done onboarding
          const hasOnboarded = typeof window !== 'undefined' && 
            localStorage.getItem("paperpress_user_name");
          router.replace(hasOnboarded ? "/home" : "/welcome");
        }
      };

      navigate();
    }
  }, [isLoading, forceReady, isAuthenticated, profile, router]);

  return (
    <div className="min-h-screen bg-[#1E88E5] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1565C0] via-[#1E88E5] to-[#42A5F5]" />

      {/* Subtle Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-[100px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-black/10 blur-[120px]"
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="flex flex-col items-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo with Premium Shadow */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-125" />

          {!logoError ? (
            <motion.img
              src="/logo.png"
              alt="PaperPress"
              className="relative w-24 h-24 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)] z-10"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="relative w-24 h-24 rounded-[28px] bg-white flex items-center justify-center shadow-2xl z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100 opacity-50" />
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="relative">
                  <div className="absolute -inset-2 bg-blue-500/20 blur-xl rounded-full" />
                  <svg className="w-12 h-12 text-[#1E88E5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* App Name - Professional Typography */}
        <div className="text-center">
          <motion.h1
            className="text-white text-2xl font-bold tracking-tight mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            PaperPress
          </motion.h1>

          {/* Tagline - Professional, no developer credit */}
          <motion.p
            className="text-white/70 text-sm font-medium tracking-wide uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Professional Exam Paper Generator
          </motion.p>
        </div>
      </motion.div>

      {/* Modern Loader */}
      <div className="absolute bottom-32 flex flex-col items-center gap-4">
        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            className="absolute inset-0 bg-white/60"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      {/* Professional Bottom Info */}
      <div className="absolute bottom-10 flex flex-col items-center gap-1">
        <motion.p
          className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Professional Exam Paper Generator App
        </motion.p>
      </div>
    </div>
  );
}

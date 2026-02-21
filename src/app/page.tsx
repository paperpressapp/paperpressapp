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
  const [animationComplete, setAnimationComplete] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) setAuthChecked(true);
  }, [isLoading]);

  useEffect(() => {
    if (!animationComplete || !authChecked || hasNavigated.current) return;
    hasNavigated.current = true;

    const navigate = async () => {
      if (Capacitor.isNativePlatform()) {
        try { await SplashScreen.hide(); } catch (e) {}
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      if (isAuthenticated && profile) {
        router.replace(profile.role === 'admin' ? "/admin" : "/home");
      } else {
        const hasLocalUser = localStorage.getItem("paperpress_user_name");
        router.replace(hasLocalUser ? "/home" : "/welcome");
      }
    };

    navigate();
  }, [animationComplete, authChecked, isAuthenticated, profile, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#1E88E5] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="flex flex-col items-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2, duration: 1 }}
        >
          <motion.div
            className="absolute inset-0 bg-white/30 blur-3xl rounded-full scale-150"
            animate={{ scale: [1.5, 1.8, 1.5], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {!logoError ? (
            <motion.img
              src="/logo.png"
              alt="PaperPress"
              className="relative w-28 h-28 object-contain drop-shadow-2xl z-10"
              onError={() => setLogoError(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
          ) : (
            <motion.div
              className="relative w-28 h-28 rounded-3xl bg-white flex items-center justify-center shadow-2xl z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-5xl font-bold text-[#1E88E5]">P</span>
            </motion.div>
          )}
        </motion.div>

        {/* App name */}
        <motion.h1
          className="text-white text-3xl font-bold tracking-wide mb-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
        >
          PaperPress
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-white/80 text-base text-center tracking-wide mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Generate Perfect Papers in Seconds
        </motion.p>

        {/* Credit */}
        <motion.div
          className="mt-6 px-5 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <span className="text-white/90 text-sm font-medium tracking-wider">
            PaperPress By Hamza Khan
          </span>
        </motion.div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-white/70"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </div>
      </motion.div>

      {/* Version */}
      <motion.p
        className="absolute bottom-8 text-white/40 text-xs font-light tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        v1.0.0
      </motion.p>
    </div>
  );
}

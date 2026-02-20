"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, profile } = useAuthStore();
  const [logoError, setLogoError] = useState(false);
  const [minDelayPassed, setMinDelayPassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayPassed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!minDelayPassed || isLoading) return;

    if (isAuthenticated && profile) {
      if (profile.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    } else {
      const hasLocalUser = localStorage.getItem("paperpress_user_name");
      if (hasLocalUser) {
        router.replace("/home");
      } else {
        router.replace("/welcome");
      }
    }
  }, [minDelayPassed, isLoading, isAuthenticated, profile, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#1E88E5] flex flex-col items-center justify-center relative overflow-hidden">
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

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <motion.div
        className="flex flex-col items-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150" />
          {!logoError ? (
            <img
              src="/logo.png"
              alt="PaperPress"
              className="relative w-24 h-24 object-contain drop-shadow-2xl"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="relative w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
              <span className="text-4xl font-bold text-[#1E88E5]">P</span>
            </div>
          )}
        </motion.div>

        <motion.h1
          className="text-white text-2xl font-bold tracking-wide mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          PaperPress
        </motion.h1>

        <motion.p
          className="text-white/70 text-sm text-center tracking-wide mb-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Generate Perfect Papers in Seconds
        </motion.p>

        <motion.div
          className="mt-4 px-4 py-1.5 rounded-full border border-white/20 bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <span className="text-white/60 text-xs font-medium tracking-wider">
            PaperPress By Hamza Khan
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </div>
      </motion.div>

      <motion.p
        className="absolute bottom-6 text-white/30 text-[10px] font-light tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        v1.0.0
      </motion.p>
    </div>
  );
}

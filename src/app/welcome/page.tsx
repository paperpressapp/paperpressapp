"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile } = useAuthStore();
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && profile) {
      if (profile.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    }
  }, [isAuthenticated, isLoading, profile, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-[20px] bg-[#B9FF66] flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-[#0A0A0A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#B9FF66]/60"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#B9FF66]/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#B9FF66]/5 blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-[#1A1A1A] rounded-[20px] p-6 border border-[#2A2A2A] shadow-[0px_8px_32px_rgba(0,0,0,0.5)]">
          <motion.div
            className="text-center mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="PaperPress"
                  className="w-full h-full object-contain drop-shadow-lg"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-[#0A0A0A]">P</span>
                </div>
              )}
            </div>
            <h1 className="text-lg font-bold text-white">Welcome to PaperPress</h1>
            <p className="text-[#A0A0A0] text-sm mt-1">Generate Perfect Papers in Seconds</p>
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link href="/auth/login" className="block w-full">
              <Button
                size="lg"
                className="w-full h-12 rounded-[40px] font-semibold text-sm bg-[#B9FF66] text-[#0A0A0A] hover:brightness-110 shadow-lg shadow-[#B9FF66]/30 transition-all group"
              >
                <LogIn className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
                Sign In
              </Button>
            </Link>

            <Link href="/auth/signup" className="block w-full">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 rounded-[40px] font-semibold text-sm border-2 border-[#B9FF66] text-[#B9FF66] hover:bg-[#B9FF66]/10 transition-all group"
              >
                <UserPlus className="w-4 h-4 mr-2 group-hover:scale-105 transition-transform" />
                Create Account
              </Button>
            </Link>
          </motion.div>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2A2A2A]" />
            <span className="text-sm text-[#A0A0A0]">or</span>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
          </div>

          <div className="text-center">
            <Link
              href="/home"
              className="text-sm text-[#A0A0A0] hover:text-[#B9FF66] inline-flex items-center gap-1"
            >
              Continue as Guest
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <motion.p
          className="text-center mt-6 text-white/40 text-xs font-light tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          PaperPress By Hamza Khan
        </motion.p>
      </motion.div>
    </div>
  );
}

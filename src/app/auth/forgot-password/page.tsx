"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          <div className="bg-[#1A1A1A] rounded-[20px] p-6 border border-[#2A2A2A] shadow-[0px_8px_32px_rgba(0,0,0,0.5)] text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#22c55e]/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Check className="w-8 h-8 text-[#22c55e]" />
            </motion.div>

            <h1 className="text-lg font-bold text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-[#A0A0A0] text-sm mb-6">
              We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>.
            </p>

            <Link href="/auth/login">
              <Button
                variant="outline"
                className="w-full h-11 rounded-[40px] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A] text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
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
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-[16px] bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-[#0A0A0A]">P</span>
            </div>
            <h1 className="text-xl font-bold text-white">Forgot Password</h1>
            <p className="text-[#A0A0A0] text-sm mt-1">Enter your email to reset password</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[12px] bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-[#A0A0A0] text-sm">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-11 rounded-[12px] bg-[#2A2A2A] border-[#2A2A2A] text-white"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-[40px] font-semibold bg-[#B9FF66] text-[#0A0A0A] hover:brightness-110"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-[#A0A0A0] hover:text-[#B9FF66] inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
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

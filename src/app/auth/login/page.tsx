"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, WifiOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { AppLoader } from "@/components/shared";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const {
    signIn,
    isAuthenticated,
    profile,
    isLoading: authLoading,
    isOffline
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect authenticated users away from login page
    // Note: we do NOT gate on isSubmitting here — once auth state is set, redirect immediately
    if (mounted && isAuthenticated && !authLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      if (profile?.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    }
  }, [mounted, isAuthenticated, authLoading, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (isOffline) {
      setError("No internet connection. Please check your network.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        let errorMsg = result.error;

        if (errorMsg.includes("Invalid login credentials") || errorMsg.includes("400")) {
          errorMsg = "Invalid email or password. Please try again or sign up if you don't have an account.";
        } else if (errorMsg.includes("Email not confirmed")) {
          errorMsg = "Please verify your email first. Check your inbox for the verification code.";
        }

        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      if (result.user && result.session) {
        localStorage.setItem("paperpress_user_name", result.user.user_metadata?.full_name || email.split('@')[0]);
        localStorage.setItem("paperpress_user_email", email);
        // ✅ Reset submitting state so the redirect useEffect can fire
        setIsSubmitting(false);
      } else {
        setError("Login failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#1E88E5] flex items-center justify-center">
        <AppLoader message="Loading..." />
      </div>
    );
  }

  if (isAuthenticated && !isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#1E88E5] flex items-center justify-center">
        <AppLoader message="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#1E88E5] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-panel rounded-2xl p-6 shadow-2xl bg-white/95 backdrop-blur-xl">
          {isOffline && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs flex items-center gap-2"
            >
              <WifiOff className="w-4 h-4" />
              <span>No internet connection.</span>
            </motion.div>
          )}

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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">P</span>
                </div>
              )}
            </div>
            <h1 className="text-lg font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to PaperPress</p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-11 rounded-xl border-gray-200 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 rounded-xl border-gray-200 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#1E88E5] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:opacity-90 shadow-lg shadow-[#1E88E5]/30 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="text-center space-y-3">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-[#1E88E5] font-semibold hover:underline">
                Create one
              </Link>
            </p>

            <Link
              href="/home"
              className="text-sm text-gray-400 hover:text-gray-600 inline-block"
            >
              Continue as Guest
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

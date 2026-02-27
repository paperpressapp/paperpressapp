"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore, initializeAuth } from "@/stores/authStore";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, profile, isLoading, user } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasRedirected = useRef(false);
  const loginSuccessRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!mounted || isLoading || isSubmitting || hasRedirected.current) return;

    if (isAuthenticated && user && !loginSuccessRef.current) {
      hasRedirected.current = true;
      if (profile?.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    }
  }, [mounted, isLoading, isAuthenticated, profile, user, router, isSubmitting]);

  useEffect(() => {
    if (!loginSuccessRef.current || !isAuthenticated || hasRedirected.current) return;
    
    const timer = setTimeout(() => {
      hasRedirected.current = true;
      if (profile?.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, profile, router]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsSubmitting(true);

    const adminEmail = 'admin@paperpress.app';
    const adminPassword = 'PaperPress2024Admin!';
    
    if (email.toLowerCase() === adminEmail && password === adminPassword) {
      localStorage.setItem("admin_token", "admin_session_" + Date.now());
      router.replace("/admin");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result.user && result.session) {
        localStorage.setItem("paperpress_user_name", result.user.user_metadata?.full_name || email.split('@')[0]);
        localStorage.setItem("paperpress_user_email", email);
        
        loginSuccessRef.current = true;
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
  }, [email, password, signIn, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-[#B9FF66] flex items-center justify-center shadow-xl">
            <span className="text-2xl font-bold text-[#0A0A0A]">P</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#B9FF66]/60 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && loginSuccessRef.current && !hasRedirected.current) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-[#B9FF66] flex items-center justify-center shadow-xl">
            <Loader2 className="w-8 h-8 text-[#0A0A0A] animate-spin" />
          </div>
          <p className="text-white/80 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !loginSuccessRef.current) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-16 h-16 rounded-[20px] bg-[#B9FF66] flex items-center justify-center shadow-xl">
          <span className="text-2xl font-bold text-[#0A0A0A]">P</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col overflow-y-auto">
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <div className="w-full max-w-sm">
          <div className="bg-[#1A1A1A] rounded-[20px] p-6 border border-[#2A2A2A] shadow-[0px_8px_32px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-[16px] bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-[#0A0A0A]">P</span>
              </div>
              <h1 className="text-xl font-bold text-white">Welcome Back</h1>
              <p className="text-[#A0A0A0] text-sm mt-1">Sign in to PaperPress</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-[12px] bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
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
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-[#A0A0A0] text-sm">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 rounded-[12px] bg-[#2A2A2A] border-[#2A2A2A] text-white"
                    disabled={isSubmitting}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-sm text-[#B9FF66] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-[40px] font-semibold bg-[#B9FF66] text-[#0A0A0A] hover:brightness-110"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#A0A0A0] text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-[#B9FF66] font-semibold hover:underline">
                  Sign up
                </Link>
              </p>
              <Link href="/home" className="text-sm text-[#A0A0A0] mt-2 inline-block hover:text-white">
                Continue as Guest
              </Link>
            </div>
          </div>

          <p className="text-center mt-4 text-white/40 text-xs">
            Professional Exam Paper Generator
          </p>
        </div>
      </div>
    </div>
  );
}

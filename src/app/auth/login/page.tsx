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

  // Handle redirect for already authenticated users
  useEffect(() => {
    if (!mounted || isLoading || isSubmitting || hasRedirected.current) return;

    // Only redirect if authenticated and NOT from a fresh login
    // (fresh login handles its own redirect after state updates)
    if (isAuthenticated && user && !loginSuccessRef.current) {
      hasRedirected.current = true;
      if (profile?.role === 'admin') {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    }
  }, [mounted, isLoading, isAuthenticated, profile, user, router, isSubmitting]);

  // Separate effect to handle redirect after successful login
  useEffect(() => {
    if (!loginSuccessRef.current || !isAuthenticated || hasRedirected.current) return;
    
    // Wait a bit for state to settle
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
        
        // Mark as successful login - redirect will happen via useEffect
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
  }, [email, password, signIn]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1565C0] to-[#1E88E5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl">
            <span className="text-2xl font-bold text-[#1E88E5]">P</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/60 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting after successful login
  if (isAuthenticated && loginSuccessRef.current && !hasRedirected.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1565C0] to-[#1E88E5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl">
            <Loader2 className="w-8 h-8 text-[#1E88E5] animate-spin" />
          </div>
          <p className="text-white/80 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show loading if authenticated (not from fresh login)
  if (isAuthenticated && !loginSuccessRef.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1565C0] to-[#1E88E5] flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl">
          <span className="text-2xl font-bold text-[#1E88E5]">P</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1565C0] to-[#1E88E5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">P</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to PaperPress</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 text-sm">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-11 rounded-xl"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 text-sm">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 rounded-xl"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-[#1E88E5] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white"
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
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-[#1E88E5] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
            <Link href="/home" className="text-sm text-gray-400 mt-2 inline-block hover:text-gray-500">
              Continue as Guest
            </Link>
          </div>
        </div>

        <p className="text-center mt-4 text-white/60 text-xs">
          PaperPress By Hamza Khan
        </p>
      </div>
    </div>
  );
}

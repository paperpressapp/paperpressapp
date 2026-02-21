"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isValidLink, setIsValidLink] = useState(true);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    // Support both flows:
    // • PKCE flow (newer): Supabase appends ?code= to the URL
    // • Implicit flow (older): Supabase appends #type=recovery to the URL
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const hash = window.location.hash;
    const hasRecoveryHash = hash.includes('type=recovery');

    if (!code && !hasRecoveryHash) {
      setIsValidLink(false);
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, []);

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // PKCE flow: exchange the code for a session before updating the password
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("Reset link is invalid or has expired. Please request a new one.");
          setIsValidLink(false);
          setIsLoading(false);
          return;
        }
      }

      const { error } = await supabase.auth.updateUser({ password });

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

  if (!isValidLink) {
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
        >
          <div className="glass-panel rounded-2xl p-6 shadow-2xl bg-white/95 backdrop-blur-xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-lg font-bold text-gray-900 mb-2">
              Invalid Link
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              {error}
            </p>

            <Link href="/auth/forgot-password">
              <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-sm">
                Request New Link
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

  if (isSuccess) {
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
          <div className="glass-panel rounded-2xl p-6 shadow-2xl bg-white/95 backdrop-blur-xl text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Check className="w-8 h-8 text-green-600" />
            </motion.div>

            <h1 className="text-lg font-bold text-gray-900 mb-2">
              Password Updated!
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Your password has been reset successfully.
            </p>

            <Link href="/auth/login">
              <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-sm">
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
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
    <div className="min-h-screen bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#1E88E5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
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
          {/* Logo */}
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
                  <Lock className="w-7 h-7 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-lg font-bold text-gray-900">New Password</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your new password below
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a new password"
                  className="pl-10 pr-10 h-11 rounded-xl border-gray-200 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password requirements */}
              {password && (
                <div className="space-y-1 mt-2">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {req.met && <Check className="w-2.5 h-2.5 text-green-500" />}
                      </div>
                      <span className={req.met ? 'text-green-600' : 'text-gray-400'}>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 h-11 rounded-xl border-gray-200 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:opacity-90 shadow-lg shadow-[#1E88E5]/30 transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
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

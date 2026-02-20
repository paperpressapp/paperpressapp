"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, 
  Check, WifiOff, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { AppLoader } from "@/components/shared";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: storeLoading, isOffline, resendOtp } = useAuthStore();
  
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [logoError, setLogoError] = useState(false);

  // Check if coming back from email link
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const emailParam = searchParams.get('email');
    
    if (token && type === 'signup' && emailParam) {
      setEmail(emailParam);
      setStep('verify');
    }
  }, [searchParams]);

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  ];

  const otpRefs = Array(6).fill(0).map((_, i) => i);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Store password temporarily for after OTP verification
      sessionStorage.setItem('paperpress_signup_password', password);
      sessionStorage.setItem('paperpress_signup_name', fullName);
      sessionStorage.setItem('paperpress_signup_email', email);

      // Sign up with email and password - Supabase will send OTP
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      // If user is created but needs email confirmation
      if (data.user && !data.session) {
        setStep("verify");
        startResendTimer();
        setSuccess("Verification code sent to your email!");
      } else if (data.session) {
        // Auto-confirmed (rare case)
        localStorage.setItem("paperpress_user_name", fullName);
        localStorage.setItem("paperpress_user_email", email);
        router.push("/home");
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Signup error:', err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && value) {
      const fullOtp = [...newOtp.slice(0, 5), value].join("");
      if (fullOtp.length === 6) {
        setTimeout(() => handleVerifyOTP(fullOtp), 100);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async (otpString?: string) => {
    const code = otpString || otp.join("");
    
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });

      if (verifyError) {
        setError(verifyError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Clear temporary storage
        sessionStorage.removeItem('paperpress_signup_password');
        sessionStorage.removeItem('paperpress_signup_name');
        sessionStorage.removeItem('paperpress_signup_email');

        // Store user info
        localStorage.setItem("paperpress_user_name", fullName);
        localStorage.setItem("paperpress_user_email", email);
        
        setSuccess("Account verified successfully!");
        
        setTimeout(() => {
          router.push("/home");
        }, 500);
      } else {
        setError("Verification failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError("Invalid OTP. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError("");
    
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setSuccess("New code sent!");
        startResendTimer();
        setOtp(["", "", "", "", "", ""]);
        document.getElementById('otp-0')?.focus();
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError("Failed to resend code. Please try again.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (step === "verify") {
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
    }
  }, [step]);

  if (storeLoading) {
    return <AppLoader message="Loading..." />;
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
          {/* Offline Warning */}
          {isOffline && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs flex items-center gap-2"
            >
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <span>No internet connection</span>
            </motion.div>
          )}

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
                  <span className="text-2xl font-bold text-white">P</span>
                </div>
              )}
            </div>
            <h1 className="text-lg font-bold text-gray-900">
              {step === "signup" ? "Create Account" : "Verify Email"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === "signup" 
                ? "Sign up with email and password" 
                : `Enter the code sent to ${email}`}
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-xs flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === "signup" ? (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Hamza Maqsood"
                      className="pl-10 h-11 rounded-xl border-gray-200 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                      disabled={isLoading || isOffline}
                    />
                  </div>
                </div>

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
                      disabled={isLoading || isOffline}
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
                      placeholder="Create a strong password"
                      className="pl-10 pr-10 h-11 rounded-xl border-gray-200 text-sm focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                      disabled={isLoading || isOffline}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {password && (
                    <div className="space-y-1">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100' : 'bg-gray-100'}`}>
                            {req.met && <Check className="w-3 h-3 text-green-500" />}
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
                      disabled={isLoading || isOffline}
                    />
                    {confirmPassword && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {password === confirmPassword ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="terms"
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]" 
                    required
                    disabled={isLoading || isOffline}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#1E88E5] hover:underline">Terms</Link>
                    {" "}&{" "}
                    <Link href="/privacy" className="text-[#1E88E5] hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isOffline}
                  className="w-full h-11 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:opacity-90 shadow-lg shadow-[#1E88E5]/30 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }}
                className="space-y-5"
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#1E88E5]/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-[#1E88E5]" />
                  </div>
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit code to
                  </p>
                  <p className="font-semibold text-gray-900">{email}</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-700 text-sm font-medium text-center block">Enter verification code</Label>
                  <div className="flex justify-center gap-2">
                    {otpRefs.map((_, index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={otp[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                          if (pastedData.length === 6) {
                            setOtp(pastedData.split(''));
                          }
                        }}
                        maxLength={1}
                        className="w-11 h-12 text-center text-xl font-bold rounded-xl border-gray-200 focus:border-[#1E88E5] focus:ring-[#1E88E5] p-0"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.join("").length !== 6}
                  className="w-full h-11 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:opacity-90 shadow-lg shadow-[#1E88E5]/30 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>

                <div className="text-center space-y-3">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend code in <span className="font-semibold text-gray-700">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-sm text-[#1E88E5] hover:underline font-medium disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  )}
                </div>

                <div className="text-center pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("signup");
                      setOtp(["", "", "", "", "", ""]);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Use different email
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {step === "signup" && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="text-center space-y-3">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-[#1E88E5] font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>

                <Link 
                  href="/home" 
                  className="text-sm text-gray-400 hover:text-gray-600 inline-block"
                >
                  Continue as Guest
                </Link>
              </div>
            </>
          )}
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

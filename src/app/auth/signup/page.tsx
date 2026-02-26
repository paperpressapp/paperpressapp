"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Check, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore, initializeAuth } from "@/stores/authStore";
import { validatePasswordStrength } from "@/lib/utils/validation";
import Link from "next/link";

// Always use the deployed API URL for auth (or local in development)
const getApiUrl = () => {
  // In development or on server, use the default
  return process.env.NEXT_PUBLIC_API_URL || 'https://paperpressapp.vercel.app';
};

const API_URL = getApiUrl();

export default function SignUpPage() {
  const router = useRouter();
  const { isLoading: storeLoading, isAuthenticated } = useAuthStore();
  
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
  const hasRedirected = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!mounted || storeLoading) return;
    
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/home");
    }
  }, [mounted, storeLoading, isAuthenticated, router]);

  const passwordStrength = validatePasswordStrength(password);
  
  const passwordRequirements = [
    { label: "At least 8 characters", met: passwordStrength.requirements.length },
    { label: "Contains a number", met: passwordStrength.requirements.number },
    { label: "Contains uppercase letter", met: passwordStrength.requirements.uppercase },
    { label: "Contains lowercase letter", met: passwordStrength.requirements.lowercase },
  ];

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!passwordStrength.valid) {
      setError("Password does not meet requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      setStep("verify");
      startResendTimer();
      
      // In development, show the OTP directly
      if (data.devOtp) {
        setSuccess(`Verification code: ${data.devOtp} (shown for testing)`);
        setOtp(data.devOtp.split(''));
      } else {
        setSuccess("Verification code sent to your email!");
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError("Failed to send verification code. Please check your internet connection and try again.");
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) value = value.slice(0, 1);
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

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
      // First verify OTP with server
      const verifyResponse = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.valid) {
        setError(verifyData.error || "Invalid verification code");
        setIsLoading(false);
        return;
      }

      // OTP verified - create account using our API (auto-confirms email)
      const signupResponse = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        setError(signupData.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // Store user info
      localStorage.setItem("paperpress_user_name", fullName);
      localStorage.setItem("paperpress_user_email", email);

      setSuccess("Account created successfully!");

      // Now sign in the user
      const { supabase } = await import('@/lib/supabase/client');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Account created but auto-login failed - redirect to login
        setSuccess("Account created! Please login.");
        setTimeout(() => router.push("/auth/login"), 1500);
      } else {
        // Logged in successfully - redirect to home
        setTimeout(() => router.push("/home"), 500);
      }
      setIsLoading(false);
    } catch (err) {
      setError("Verification failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend code');
      } else {
        setSuccess("New code sent!");
        startResendTimer();
        setOtp(["", "", "", "", "", ""]);
        document.getElementById('otp-0')?.focus();
      }
    } catch (err) {
      setError("Failed to resend code.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (step === "verify") {
      setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
    }
  }, [step]);

  if (!mounted || storeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1565C0] to-[#1E88E5] flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl">
          <span className="text-2xl font-bold text-[#1E88E5]">P</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
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
            <h1 className="text-xl font-bold text-gray-900">
              {step === "signup" ? "Create Account" : "Verify Email"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === "signup" ? "Sign up to get started" : `Enter code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {success}
            </div>
          )}

          {step === "signup" ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label className="text-gray-700 text-sm">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Hamza Maqsood"
                    className="pl-10 h-11 rounded-xl"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 text-sm">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 h-11 rounded-xl"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 text-sm">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 h-11 rounded-xl"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
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

              <div>
                <Label className="text-gray-700 text-sm">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 h-11 rounded-xl"
                    disabled={isLoading}
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded" required disabled={isLoading} />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the <Link href="/terms" className="text-[#1E88E5]">Terms</Link> & <Link href="/privacy" className="text-[#1E88E5]">Privacy Policy</Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#1E88E5]/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#1E88E5]" />
                </div>
                <p className="text-sm text-gray-600">We've sent a 6-digit code to</p>
                <p className="font-semibold text-gray-900">{email}</p>
              </div>

              <div>
                <Label className="text-gray-700 text-sm text-center block">Enter verification code</Label>
                <div className="flex justify-center gap-2 mt-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
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
                        if (pastedData.length === 6) setOtp(pastedData.split(''));
                      }}
                      maxLength={1}
                      className="w-11 h-12 text-center text-xl font-bold rounded-xl p-0"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleVerifyOTP()}
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend code in <span className="font-semibold">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-[#1E88E5] font-medium"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <div className="text-center pt-2 border-t border-gray-100">
                <button
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
            </div>
          )}

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
                  <Link href="/auth/login" className="text-[#1E88E5] font-semibold">
                    Sign in
                  </Link>
                </p>
                <Link href="/home" className="text-sm text-gray-400">
                  Continue as Guest
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center mt-4 text-white/60 text-xs">
          PaperPress By Hamza Khan
        </p>
      </div>
    </div>
  );
}

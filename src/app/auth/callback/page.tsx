"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (errorParam) {
          setError(errorDescription || errorParam);
          setStatus("error");
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setError(error.message);
            setStatus("error");
            return;
          }
          setStatus("success");
          setTimeout(() => router.replace("/home"), 1500);
          return;
        }

        if (token && type) {
          const email = searchParams.get("email");
          if (email) {
            router.replace(`/auth/verify?token=${token}&type=${type}&email=${encodeURIComponent(email)}`);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus("success");
          setTimeout(() => router.replace("/home"), 1500);
        } else {
          setError("No session found. Please try logging in again.");
          setStatus("error");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An unexpected error occurred");
        setStatus("error");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#1E88E5] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center"
      >
        {status === "loading" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#1E88E5]/20 border-t-[#1E88E5]"
            />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifying...</h2>
            <p className="text-sm text-gray-500">Please wait while we confirm your identity</p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-green-600" />
            </motion.div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Success!</h2>
            <p className="text-sm text-gray-500">Redirecting you now...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={() => router.replace("/auth/login")}
              className="text-[#1E88E5] text-sm font-medium hover:underline"
            >
              Back to Sign In
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

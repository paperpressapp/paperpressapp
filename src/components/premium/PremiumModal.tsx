"use client";

/**
 * Premium Activation Modal
 * 
 * Allows users to enter secret code to unlock premium features.
 * Works completely offline.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePremiumCode, type PremiumStatus } from "@/lib/premium";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (status: PremiumStatus) => void;
}

export function PremiumModal({ isOpen, onClose, onSuccess }: PremiumModalProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setResult({ type: 'error', message: 'Please enter a code' });
      return;
    }

    setIsValidating(true);
    setResult(null);

    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validatePremiumCode(code);
    
    if (validation.valid) {
      setResult({ type: 'success', message: validation.message });
      
      // Get the updated premium status
      const status = JSON.parse(localStorage.getItem('paperpress_premium_status') || '{}');
      
      // Call onSuccess callback after a brief delay
      setTimeout(() => {
        onSuccess?.(status);
        onClose();
        setCode("");
        setResult(null);
      }, 1500);
    } else {
      setResult({ type: 'error', message: validation.message });
    }

    setIsValidating(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Go Premium</h2>
                  <p className="text-white/80 text-sm">Unlock unlimited papers</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Benefits */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Unlimited papers per month</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>All subjects and chapters</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Professional PDF templates</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Priority support</span>
                </div>
              </div>

              {/* Code Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Premium Code
                  </label>
                  <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g., PPBHK656)"
                    className="h-12 text-center text-lg tracking-wider uppercase"
                    maxLength={10}
                    disabled={isValidating}
                  />
                </div>

                {/* Result Message */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 p-3 rounded-xl ${
                      result.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {result.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{result.message}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isValidating || !code.trim()}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0] font-semibold shadow-lg shadow-[#1E88E5]/30 disabled:opacity-50"
                >
                  {isValidating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Activate Premium'
                  )}
                </Button>
              </form>

              {/* Footer */}
              <p className="mt-4 text-center text-xs text-gray-500">
                Premium codes work completely offline. No internet required.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

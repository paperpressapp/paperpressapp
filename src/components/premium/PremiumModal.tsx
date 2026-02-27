"use client";

/**
 * Premium Activation Modal
 * 
 * Beautiful premium activation with:
 * - Personalized code based on user name
 * - Auto-activation for existing users
 * - Works offline on both web and Android
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Sparkles, Zap, CheckCircle, Copy, Key, User, ArrowRight, Gift, Infinity, Image, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validatePremiumCode, generatePremiumCode, checkPremiumStatus, getUserPremiumCode, type PremiumStatus, PREMIUM_FEATURES } from "@/lib/premium";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (status: PremiumStatus) => void;
}

export function PremiumModal({ isOpen, onClose, onSuccess }: PremiumModalProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userCode, setUserCode] = useState("");
  const [userName, setUserName] = useState("");
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);
  const isPremium = checkPremiumStatus().isPremium;

  useEffect(() => {
    if (isOpen) {
      const code = getUserPremiumCode();
      const name = getUserName();
      setUserCode(code);
      setUserName(name);
      setCode("");
      setResult(null);
    }
  }, [isOpen]);

  // Get username from localStorage
  function getUserName(): string {
    if (typeof window === 'undefined') return '';
    
    // Try auth store first
    const authStore = localStorage.getItem('paperpress-auth');
    if (authStore) {
      try {
        const parsed = JSON.parse(authStore);
        if (parsed.state?.user?.user_metadata?.full_name) {
          return parsed.state.user.user_metadata.full_name;
        }
        if (parsed.state?.user?.email) {
          return parsed.state.user.email.split('@')[0];
        }
      } catch (e) {
        // Continue
      }
    }
    
    // Try userStore
    const userStore = localStorage.getItem('paperpress-user');
    if (userStore) {
      try {
        const parsed = JSON.parse(userStore);
        if (parsed.state?.name) {
          return parsed.state.name;
        }
      } catch (e) {
        // Ignore
      }
    }
    
    return '';
  }

  const handleCopyCode = () => {
    if (userCode) {
      navigator.clipboard.writeText(userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAutoActivate = async () => {
    if (!userCode || !userName) return;
    
    setActivating(true);
    setCode(userCode);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const validation = validatePremiumCode(userCode, userName);
    
    if (validation.valid) {
      setResult({ type: 'success', message: 'Premium activated successfully!' });
      
      setTimeout(() => {
        const status = checkPremiumStatus();
        onSuccess?.(status);
        onClose();
      }, 1500);
    } else {
      setResult({ type: 'error', message: 'Code not valid. Contact support.' });
    }
    
    setActivating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setResult({ type: 'error', message: 'Please enter a code' });
      return;
    }

    setIsValidating(true);
    setResult(null);

    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validatePremiumCode(code, userName);
    
    if (validation.valid) {
      setResult({ type: 'success', message: 'Premium activated successfully!' });
      
      setTimeout(() => {
        const status = checkPremiumStatus();
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

  if (isPremium) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
                  >
                    <Crown className="w-10 h-10 text-yellow-300" />
                  </motion.div>
                    <h2 className="text-2xl font-bold mb-2">You're Premium</h2>
                  <p className="text-white/90">You have unlimited access to all features</p>
                </div>
              </div>
              <div className="p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">Thank you for being a premium member!</p>
                <Button
                  onClick={onClose}
                  className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-semibold"
                >
                  Awesome!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Animated Header */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 p-6 text-white overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12"></div>
              </div>
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center"
                >
                  <Crown className="w-7 h-7 text-yellow-300" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold">Upgrade to Premium</h2>
                  <p className="text-white/80 text-sm">Unlock unlimited potential</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* User's Personalized Code */}
              {userCode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-semibold text-violet-700">Your Personal Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-white rounded-xl border border-violet-200 font-mono text-lg font-bold text-violet-700 tracking-wider uppercase">
                      {userCode.toUpperCase()}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-3 bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
                    >
                      {copied ? <CheckCircle className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                  <p className="text-xs text-violet-600 mt-2">
                    {copied ? "Copied! Use this code anytime." : "Tap copy to save your personal code"}
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAutoActivate}
                    disabled={activating}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/25 disabled:opacity-70"
                  >
                    {activating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Activate My Premium
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}

              {/* Features */}
              <div className="mb-6 space-y-3">
                {[
                  { icon: <Infinity className="w-5 h-5 text-[#B9FF66]" />, text: PREMIUM_FEATURES.unlimitedPapers },
                  { icon: <Image className="w-5 h-5 text-[#B9FF66]" />, text: PREMIUM_FEATURES.customLogo },
                  { icon: <FileText className="w-5 h-5 text-[#B9FF66]" />, text: PREMIUM_FEATURES.bubbleSheet },
                  { icon: <Key className="w-5 h-5 text-[#B9FF66]" />, text: PREMIUM_FEATURES.answerKey },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-sm text-[#A0A0A0]"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Or enter code manually</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Manual Code Input */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Premium Code
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="h-12 pl-12 pr-4 text-center text-lg tracking-wider uppercase"
                      maxLength={15}
                      disabled={isValidating}
                    />
                  </div>
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
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{result.message}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isValidating || !code.trim()}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Activate Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <p className="mt-4 text-center text-xs text-gray-400">
                Premium works offline. Your code is unique to you.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

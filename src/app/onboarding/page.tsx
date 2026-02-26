"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Building2, ArrowRight, FileText, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLoader, LoadingSpinner } from "@/components/shared";
import { useToast } from "@/hooks";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    instituteName: "",
    instituteLogo: null as string | null,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const checkExisting = () => {
      const userName = localStorage.getItem("paperpress_user_name");
      const userInstitute = localStorage.getItem("paperpress_user_institute");

      if (userName && userInstitute && window.location.pathname === "/onboarding") {
        router.replace("/home");
      } else {
        setIsChecking(false);
      }
    };

    checkExisting();
  }, [router]);

  const handleLogoSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg,image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({ ...prev, instituteLogo: dataUrl }));
        setLogoPreview(dataUrl);
        toast.success("Logo uploaded successfully");
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, instituteLogo: null }));
    setLogoPreview(null);
  };

  const handleContinue = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.instituteName.trim()) {
      toast.error("Please enter your institute name");
      return;
    }

    setIsLoading(true);

    try {
      localStorage.setItem("paperpress_user_name", formData.name.trim());
      localStorage.setItem("paperpress_user_institute", formData.instituteName.trim());
      
      if (formData.instituteLogo) {
        localStorage.setItem("paperpress_user_logo", formData.instituteLogo);
      } else {
        localStorage.removeItem("paperpress_user_logo");
      }

      toast.success("Welcome to PaperPress!");
      router.push("/home");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return <AppLoader message="Checking..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-white/3 blur-2xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center">
            <FileText className="w-10 h-10 text-[#1E88E5]" strokeWidth={2} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Let&apos;s Get Started
          </h1>
          <p className="text-white/70">
            Personalize your papers with your details
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full max-w-[360px] glass-panel rounded-3xl p-6"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Your Name
              </Label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#1E88E5]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#1E88E5]" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-16 h-14 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors text-base"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instituteName" className="text-gray-700 font-medium">
                Institute Name
              </Label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#1E88E5]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#1E88E5]" />
                </div>
                <Input
                  id="instituteName"
                  type="text"
                  placeholder="e.g., City Grammar School"
                  className="pl-16 h-14 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors text-base"
                  value={formData.instituteName}
                  onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                Institute Logo <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <div className="flex items-center gap-3">
                {logoPreview ? (
                  <motion.div 
                    className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#1E88E5]/30 bg-white"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogoSelect}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#1E88E5]/50 hover:bg-[#1E88E5]/5 transition-colors"
                  >
                    <ImagePlus className="w-6 h-6 text-gray-400" />
                  </button>
                )}
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={handleLogoSelect}
                    className="text-sm text-[#1E88E5] font-medium hover:underline"
                  >
                    {logoPreview ? 'Change logo' : 'Upload logo'}
                  </button>
                  <p className="text-xs text-gray-400 mt-0.5">
                    JPG, PNG or WebP, max 2MB
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 pl-1">
                This logo will appear on your exam paper headers.
              </p>
            </div>

            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full h-14 rounded-xl text-base font-semibold bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:opacity-90 transition-opacity shadow-lg shadow-[#1E88E5]/30"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Start Creating
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-xs text-white/60"
        >
          No account needed! Your info is stored locally on your device.
        </motion.p>
      </div>
    </div>
  );
}

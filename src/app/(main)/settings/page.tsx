"use client";

/**
 * Settings Page - With Auth Integration
 * 
 * Enhanced settings with:
 * - User authentication status
 * - Login/Logout functionality
 * - Premium status display
 * - Admin access (if applicable)
 */

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User, LogOut, Trash2, ChevronRight, FileText,
  Edit3, X, Check, Download, ImagePlus, Crown,
  LogIn, Shield, Mail, Sparkles, UserPlus, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MainLayout, ScrollView } from "@/components/layout";
import { ConfirmDialog, AppLoader } from "@/components/shared";
import Skeleton from "react-loading-skeleton";
import { useToast } from "@/hooks";
import { getPapers, exportPapers, importPapers } from "@/lib/storage/papers";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { checkPremiumStatus, getUsageStats, type PremiumStatus } from "@/lib/premium";
import { useAuthStore } from "@/stores/authStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isAuthenticated,
    user,
    profile,
    signOut,
    isAdmin,
    isPremium
  } = useAuthStore();

  const [userName, setUserName] = useState("Guest User");
  const [instituteName, setInstituteName] = useState("Not set");
  const [instituteLogo, setInstituteLogo] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", institute: "", email: "" });

  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({ isPremium: false, activatedAt: null, code: null });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [usageStats, setUsageStats] = useState({ used: 0, limit: 30, isPremium: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Load local user data
    const localName = localStorage.getItem("paperpress_user_name");
    const localInstitute = localStorage.getItem("paperpress_user_institute");
    const localLogo = localStorage.getItem("paperpress_user_logo");
    const localEmail = localStorage.getItem("paperpress_user_email");

    // Use auth profile data if available, otherwise fall back to localStorage
    if (isAuthenticated && profile) {
      setUserName(profile.full_name || localName || "User");
      setEmail(profile.email || localEmail || user?.email || "");
    } else {
      setUserName(localName || "Guest User");
      setEmail(localEmail || "");
    }

    setInstituteName(localInstitute || "Not set");
    setInstituteLogo(localLogo || null);
    setEditForm({
      name: localName || "",
      institute: localInstitute || "",
      email: localEmail || ""
    });

    const status = checkPremiumStatus();
    setPremiumStatus(status);

    const stats = getUsageStats();
    setUsageStats(stats);
    
    setIsLoading(false);
  }, [isAuthenticated, profile, user]);

  const papersCount = getPapers().length;

  const handleSave = () => {
    if (editForm.name.trim()) {
      localStorage.setItem("paperpress_user_name", editForm.name.trim());
      setUserName(editForm.name.trim());
    }
    if (editForm.institute.trim()) {
      localStorage.setItem("paperpress_user_institute", editForm.institute.trim());
      setInstituteName(editForm.institute.trim());
    }
    if (editForm.email.trim()) {
      localStorage.setItem("paperpress_user_email", editForm.email.trim());
      setEmail(editForm.email.trim());
    }
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

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
        localStorage.setItem("paperpress_user_logo", dataUrl);
        setInstituteLogo(dataUrl);
        toast.success("Logo updated successfully");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleRemoveLogo = () => {
    localStorage.removeItem("paperpress_user_logo");
    setInstituteLogo(null);
    toast.success("Logo removed");
  };

  const handleLogout = async () => {
    await signOut();
    setShowLogoutConfirm(false);
    toast.success("Logged out successfully");
    router.push("/welcome");
  };

  const handleReset = useCallback(() => {
    // Clear only PaperPress-specific data, not all localStorage
    const paperpressKeys = [
      'paperpress_user_name',
      'paperpress_user_institute',
      'paperpress_user_logo',
      'paperpress_user_email',
      'paperpress_papers',
      'paperpress_settings',
      'paperpress_premium',
      'paperpress_usage',
    ];
    paperpressKeys.forEach(key => localStorage.removeItem(key));
    setShowResetConfirm(false);
    router.push("/welcome");
    toast.success("All data cleared");
  }, [router, toast]);

  const handleClearPapers = useCallback(() => {
    import("@/lib/storage/papers").then(({ clearAllPapers }) => {
      clearAllPapers();
      setShowClearConfirm(false);
      toast.success("All papers cleared");
      window.location.reload();
    });
  }, [toast]);

  const handleExportData = useCallback(async () => {
    const data = exportPapers();
    const json = JSON.stringify(data, null, 2);
    const filename = `paperpress-backup-${new Date().toISOString().split("T")[0]}.json`;

    // Check if running on Android/Capacitor
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      try {
        const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');

        await Filesystem.writeFile({
          path: filename,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        const uri = await Filesystem.getUri({
          path: filename,
          directory: Directory.Cache,
        });

        await Share.share({
          title: 'PaperPress Backup',
          text: 'Your PaperPress papers backup',
          url: uri.uri,
          dialogTitle: 'Export Papers',
        });

        toast.success("Backup exported successfully");
      } catch (error) {
        console.error('Export error:', error);
        toast.error("Failed to export. Please try again.");
      }
    } else {
      // Web: use blob download
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    }
  }, [toast]);

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importPapers(data);
        toast.success("Data imported successfully");
        window.location.reload();
      } catch (error) {
        toast.error("Invalid file format");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    event.target.value = '';
  }, [toast]);

  const userInitial = userName.charAt(0).toUpperCase();

  if (isLoading) {
    return (
      <MainLayout showBottomNav headerTitle="Settings" className="bg-[#0A0A0A]">
        <div className="p-4 space-y-4">
          <Skeleton height={120} borderRadius={16} className="bg-[#2A2A2A]" />
          <Skeleton height={200} borderRadius={16} className="bg-[#2A2A2A]" />
          <Skeleton height={80} borderRadius={16} className="bg-[#2A2A2A]" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBottomNav headerTitle="Settings" className="bg-[#0A0A0A]">
        <div className="min-h-screen pb-24">
          <ScrollView
            className="flex-1"
            style={{ paddingTop: '16px' }}
          >
            {/* Auth Status Section */}
            <motion.div
              className="px-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-[#1A1A1A] rounded-[20px] overflow-hidden border border-[#2A2A2A] shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
                {isEditing ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white">Edit Profile</h3>
                      <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="h-8 w-8 rounded-full bg-[#2A2A2A]">
                        <X className="w-3 h-3 text-[#A0A0A0]" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#A0A0A0]">Your Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="h-10 rounded-[12px] text-sm bg-[#2A2A2A] border-[#2A2A2A] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#A0A0A0]">Institute Name</Label>
                      <Input
                        value={editForm.institute}
                        onChange={(e) => setEditForm({ ...editForm, institute: e.target.value })}
                        className="h-10 rounded-[12px] text-sm bg-[#2A2A2A] border-[#2A2A2A] text-white"
                      />
                    </div>

                    {!isAuthenticated && (
                      <div className="space-y-2">
                        <Label className="text-[#A0A0A0]">Email (optional)</Label>
                        <Input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="h-10 rounded-[12px] text-sm bg-[#2A2A2A] border-[#2A2A2A] text-white"
                          placeholder="your@email.com"
                        />
                      </div>
                    )}

                    <Button onClick={handleSave} className="w-full h-10 rounded-[40px] bg-[#B9FF66] text-[#0A0A0A] font-semibold text-sm">
                      <Check className="w-3 h-3 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="relative mb-3">
                      {instituteLogo ? (
                        <div className="w-16 h-16 rounded-[16px] bg-[#2A2A2A] border border-[#2A2A2A] flex items-center justify-center overflow-hidden shadow-lg">
                          <img src={instituteLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                        </div>
                      ) : (
                        <div className={`w-16 h-16 rounded-[16px] flex items-center justify-center text-2xl font-bold text-white shadow-lg ${isAuthenticated
                            ? 'bg-gradient-to-br from-[#B9FF66] to-[#22c55e]'
                            : 'bg-gradient-to-br from-[#B9FF66] to-[#22c55e]'
                          }`}>
                          {userInitial}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={instituteLogo ? handleRemoveLogo : handleLogoSelect}
                        className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full shadow-md ${instituteLogo
                            ? 'bg-[#FF4D4D] text-white hover:bg-[#FF4D4D]/80'
                            : 'bg-[#B9FF66] text-[#0A0A0A] hover:bg-[#B9FF66]/80'
                          }`}
                      >
                        {instituteLogo ? <X className="w-3 h-3" /> : <ImagePlus className="w-3 h-3" />}
                      </Button>

                      {/* Auth Status Badge */}
                      {isAuthenticated && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <h2 className="text-lg font-bold text-white mb-1">{userName}</h2>
                    <p className="text-xs text-[#A0A0A0] mb-1">{instituteName}</p>
                    {email && (
                      <div className="flex items-center gap-1 text-xs text-[#A0A0A0]">
                        <Mail className="w-3 h-3" />
                        {email}
                      </div>
                    )}

                    {/* Auth Status Badge */}
                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {isAuthenticated ? (
                        <span className="px-2 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-xs font-medium flex items-center gap-1">
                          <Check className="w-2 h-2" />
                          Signed In
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-[#2A2A2A] text-[#A0A0A0] text-xs font-medium">
                          Guest Mode
                        </span>
                      )}

                      {isPremium && (
                        <span className="px-2 py-1 rounded-full bg-[#B9FF66]/20 text-[#B9FF66] text-xs font-medium flex items-center gap-1">
                          <Crown className="w-2 h-2" />
                          Premium
                        </span>
                      )}

                      {isAdmin && (
                        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium flex items-center gap-1">
                          <Shield className="w-2 h-2" />
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Theme Toggle */}
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className="text-xs text-[#A0A0A0]">Dark</span>
                      <ThemeToggle />
                      <span className="text-xs text-[#A0A0A0]">Light</span>
                    </div>

                    {/* Papers Count */}
                    <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-[12px] px-3 py-2 mt-3">
                      <FileText className="w-3 h-3 text-[#B9FF66]" />
                      <span className="text-xs font-medium text-white">{papersCount} Papers</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Auth Actions Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="px-4 mb-4"
            >
              {isAuthenticated ? (
                /* Logged In - Show Logout Button */
                <div className="bg-[#1A1A1A] rounded-[20px] overflow-hidden border border-[#2A2A2A] shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
                  <div className="px-4 py-3 border-b border-[#2A2A2A]">
                    <p className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wide">Account</p>
                  </div>

                  <div className="p-3 hover:bg-[#FF4D4D]/10 cursor-pointer" onClick={() => setShowLogoutConfirm(true)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[8px] bg-[#FF4D4D]/20 flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-[#FF4D4D]" />
                        </div>
                        <div>
                          <span className="font-medium text-[#FF4D4D] block">Sign Out</span>
                          <span className="text-xs text-[#A0A0A0]">Log out of your account</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Not Logged In - Show Login/Signup */
                <div className="bg-[#1A1A1A] rounded-[20px] overflow-hidden border border-[#2A2A2A] shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
                  <div className="px-4 py-3 border-b border-[#2A2A2A]">
                    <p className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wide">Account</p>
                  </div>

                  <Link href="/auth/login">
                    <div className="p-3 hover:bg-[#2A2A2A] cursor-pointer border-b border-[#2A2A2A]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[8px] bg-[#1E88E5]/20 flex items-center justify-center">
                            <LogIn className="w-4 h-4 text-[#1E88E5]" />
                          </div>
                          <div>
                            <span className="font-medium text-white block">Sign In</span>
                            <span className="text-xs text-[#A0A0A0]">Access your account</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
                      </div>
                    </div>
                  </Link>

                  <Link href="/auth/signup">
                    <div className="p-3 hover:bg-[#2A2A2A] cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[8px] bg-[#22c55e]/20 flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-[#22c55e]" />
                          </div>
                          <div>
                            <span className="font-medium text-white block">Create Account</span>
                            <span className="text-xs text-[#A0A0A0]">Join PaperPress today</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Admin Access Section (Only for Admins) */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
className="px-4 mb-4"
              >
                <Link href="/admin">
                  <div className="bg-[#1A1A1A] rounded-[20px] overflow-hidden border border-purple-500/30 shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">Admin Dashboard</h3>
                            <p className="text-sm text-[#A0A0A0]">Manage users, questions & analytics</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Premium Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="px-4 mb-4"
            >
              {!isPremium && !premiumStatus.isPremium ? (
                <div className="bg-[#1A1A1A] rounded-[20px] overflow-hidden border border-[#B9FF66]/30 shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center shadow-lg">
                          <Crown className="w-6 h-6 text-[#0A0A0A]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Go Premium</h3>
                          <p className="text-sm text-[#A0A0A0]">
                            {usageStats.isPremium ? 'Unlimited papers' : `${Math.max(0, usageStats.limit - usageStats.used)} papers remaining this month`}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowPremiumModal(true)}
                        className="h-10 px-4 rounded-[40px] bg-[#B9FF66] text-[#0A0A0A] font-semibold shadow-lg shadow-[#B9FF66]/30"
                      >
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1A1A1A] rounded-[20px] overflow-hidden border border-[#22c55e]/30 shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center shadow-lg">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Premium Active</h3>
                        <p className="text-sm text-[#A0A0A0]">
                          {premiumStatus.activatedAt 
                            ? `Active since ${new Date(premiumStatus.activatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : 'You have unlimited access'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Data Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-4 mb-4"
            >
              <div className="bg-[#1A1A1A] rounded-[20px] overflow-hidden border border-[#2A2A2A] shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
                <div className="px-4 py-3 border-b border-[#2A2A2A]">
                  <p className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wide">Data Management</p>
                </div>

                <div className="p-4 hover:bg-[#2A2A2A] cursor-pointer border-b border-[#2A2A2A]" onClick={handleExportData}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#1E88E5]/20 flex items-center justify-center">
                        <Download className="w-5 h-5 text-[#1E88E5]" />
                      </div>
                      <div>
                        <span className="font-medium text-white block">Export Papers</span>
                        <span className="text-xs text-[#A0A0A0]">Backup to JSON file</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                  </div>
                </div>

                <label className="p-4 block hover:bg-[#2A2A2A] cursor-pointer border-b border-[#2A2A2A]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#22c55e]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-white block">Import Papers</span>
                        <span className="text-xs text-[#A0A0A0]">Restore from backup</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                  </div>
                  <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                </label>

                <div className="p-4 hover:bg-[#FF4D4D]/10 cursor-pointer" onClick={() => setShowClearConfirm(true)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#FF4D4D]/20 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-[#FF4D4D]" />
                      </div>
                      <span className="font-medium text-[#FF4D4D]">Clear All Papers</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="px-4 mb-4"
            >
              <div className="bg-[#1A1A1A] rounded-[20px] border border-[#FF4D4D]/30 shadow-[0px_8px_24px_rgba(0,0,0,0.4)] overflow-hidden">
                {/* Danger Zone Header */}
                <div className="px-4 py-3 border-b border-[#FF4D4D]/20 bg-[#FF4D4D]/5">
                  <p className="text-xs font-semibold text-[#FF4D4D] uppercase tracking-wide">
                    Danger Zone
                  </p>
                </div>
                <div className="p-4 hover:bg-[#FF4D4D]/10 cursor-pointer" onClick={() => setShowResetConfirm(true)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#FF4D4D]/20 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-[#FF4D4D]" />
                      </div>
                      <div>
                        <span className="font-medium text-[#FF4D4D] block">Reset App</span>
                        <span className="text-xs text-[#A0A0A0]">Delete everything and start over</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Version Info */}
            <div className="text-center py-4">
              <p className="text-xs text-white/60">PaperPress v1.0.0</p>
              <p className="text-xs text-white/40 mt-1">PaperPress</p>
            </div>

            <div className="h-8" />
          </ScrollView>

          {/* Confirmation Dialogs */}
          <ConfirmDialog
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={handleLogout}
            title="Sign Out?"
            message="You'll need to sign in again to access your account."
            confirmText="Sign Out"
            cancelText="Cancel"
            variant="default"
          />

          <ConfirmDialog
            isOpen={showResetConfirm}
            onClose={() => setShowResetConfirm(false)}
            onConfirm={handleReset}
            title="Reset Everything?"
            message="This will delete all your papers and reset your profile. This cannot be undone."
            confirmText="Reset Everything"
            cancelText="Cancel"
            variant="destructive"
          />

          <ConfirmDialog
            isOpen={showClearConfirm}
            onClose={() => setShowClearConfirm(false)}
            onConfirm={handleClearPapers}
            title="Clear All Papers?"
            message="This will delete all your saved papers. Your profile will be kept."
            confirmText="Clear Papers"
            cancelText="Cancel"
            variant="destructive"
          />

          <PremiumModal
            isOpen={showPremiumModal}
            onClose={() => setShowPremiumModal(false)}
            onSuccess={(status) => {
              setPremiumStatus(status);
              const stats = getUsageStats();
              setUsageStats(stats);
            }}
          />
        </div>
      </MainLayout>
  );
}

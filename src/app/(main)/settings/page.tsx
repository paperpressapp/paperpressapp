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
  LogIn, Shield, Mail, Sparkles, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MainLayout, ScrollView } from "@/components/layout";
import { ConfirmDialog } from "@/components/shared";
import { useToast } from "@/hooks";
import { getPapers, exportPapers, importPapers } from "@/lib/storage/papers";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { checkPremiumStatus, getUsageStats, type PremiumStatus } from "@/lib/premium";
import { useAuthStore } from "@/stores/authStore";
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

  useEffect(() => {
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
    localStorage.clear();
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

  const handleExportData = useCallback(() => {
    const data = exportPapers();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paperpress-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
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
  }, [toast]);

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <MainLayout showBottomNav>
        <div className="min-h-screen pb-24">
          {/* Header */}
          <div className="fixed top-0 left-0 right-0 z-50 pt-safe">
            <div className="mx-auto max-w-[428px]">
              <div className="glass-panel border-b border-gray-100/50">
                <div className="px-4 h-14 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-gray-100"
                      onClick={() => router.back()}
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </Button>
                    <h1 className="font-bold text-lg text-gray-900">Settings</h1>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-[#1E88E5] hover:bg-[#1E88E5]/10"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <ScrollView className="pt-[56px]">
            {/* Auth Status Section */}
            <motion.div 
              className="px-5 mb-6" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`glass-panel rounded-3xl overflow-hidden ${isAuthenticated ? 'bg-gradient-to-br from-green-50/50 to-emerald-50/50' : ''}`}>
                {isEditing ? (
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">Edit Profile</h3>
                      <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">Your Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">Institute Name</Label>
                      <Input
                        value={editForm.institute}
                        onChange={(e) => setEditForm({ ...editForm, institute: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>

                    {!isAuthenticated && (
                      <div className="space-y-2">
                        <Label className="text-gray-700">Email (optional)</Label>
                        <Input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="h-12 rounded-xl"
                          placeholder="your@email.com"
                        />
                      </div>
                    )}

                    <Button onClick={handleSave} className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0]">
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="relative mb-4">
                      {instituteLogo ? (
                        <div className="w-24 h-24 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center overflow-hidden shadow-lg">
                          <img src={instituteLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                        </div>
                      ) : (
                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg ${
                          isAuthenticated 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                            : 'bg-gradient-to-br from-[#1E88E5] to-[#1565C0]'
                        }`}>
                          {userInitial}
                        </div>
                      )}
                      <button
                        onClick={instituteLogo ? handleRemoveLogo : handleLogoSelect}
                        className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                          instituteLogo 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white text-[#1E88E5] hover:bg-gray-50'
                        }`}
                      >
                        {instituteLogo ? <X className="w-4 h-4" /> : <ImagePlus className="w-4 h-4" />}
                      </button>
                      
                      {/* Auth Status Badge */}
                      {isAuthenticated && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{userName}</h2>
                    <p className="text-sm text-gray-500 mb-1">{instituteName}</p>
                    {email && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />
                        {email}
                      </div>
                    )}

                    {/* Auth Status Badge */}
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {isAuthenticated ? (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Signed In
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          Guest Mode
                        </span>
                      )}
                      
                      {isPremium && (
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                      
                      {isAdmin && (
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Papers Count */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 mt-4">
                      <FileText className="w-4 h-4 text-[#1E88E5]" />
                      <span className="text-sm font-medium">{papersCount} Papers Created</span>
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
              className="px-5 mb-6"
            >
              {isAuthenticated ? (
                /* Logged In - Show Logout Button */
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</p>
                  </div>
                  
                  <div className="p-4 hover:bg-red-50 cursor-pointer" onClick={() => setShowLogoutConfirm(true)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                          <LogOut className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <span className="font-medium text-red-600 block">Sign Out</span>
                          <span className="text-xs text-red-400">Log out of your account</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Not Logged In - Show Login/Signup */
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</p>
                  </div>
                  
                  <Link href="/auth/login">
                    <div className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <LogIn className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 block">Sign In</span>
                            <span className="text-xs text-gray-500">Access your account</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/auth/signup">
                    <div className="p-4 hover:bg-green-50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 block">Create Account</span>
                            <span className="text-xs text-gray-500">Join PaperPress today</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
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
                className="px-5 mb-6"
              >
                <Link href="/admin">
                  <div className="glass-panel rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Admin Dashboard</h3>
                            <p className="text-sm text-gray-600">Manage users, questions & analytics</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-purple-400" />
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
              className="px-5 mb-6"
            >
              {!isPremium && !premiumStatus.isPremium ? (
                <div className="glass-panel rounded-2xl overflow-hidden bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Go Premium</h3>
                          <p className="text-sm text-gray-600">
                            {usageStats.isPremium ? 'Unlimited papers' : `${Math.max(0, usageStats.limit - usageStats.used)} papers remaining this month`}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowPremiumModal(true)}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg shadow-yellow-500/30"
                      >
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Premium Active</h3>
                        <p className="text-sm text-gray-600">You have unlimited access</p>
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
              className="px-5 mb-6"
            >
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Data Management</p>
                </div>
                
                <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100" onClick={handleExportData}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Download className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block">Export Papers</span>
                        <span className="text-xs text-gray-500">Backup to JSON file</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                <label className="p-4 block hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block">Import Papers</span>
                        <span className="text-xs text-gray-500">Restore from backup</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                </label>
                
                <div className="p-4 hover:bg-red-50 cursor-pointer" onClick={() => setShowClearConfirm(true)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="font-medium text-red-600">Clear All Papers</span>
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
              className="px-5 mb-6"
            >
              <div className="bg-white/95 rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                <div className="p-4 hover:bg-red-50 cursor-pointer" onClick={() => setShowResetConfirm(true)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <LogOut className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <span className="font-medium text-red-600 block">Reset App</span>
                        <span className="text-xs text-red-400">Delete everything and start over</span>
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
    </div>
  );
}

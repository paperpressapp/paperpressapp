"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, FileText, BookOpen, Settings, LogOut, ChevronRight, Crown, FileQuestion, Sparkles } from "lucide-react";
import { checkPremiumStatus, getUserPremiumCode } from "@/lib/premium";
import { useAuthStore } from "@/stores/authStore";
import { PremiumModal } from "@/components/premium/PremiumModal";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ title = "PaperPress", showBack = false, onBack }: HeaderProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, user, signOut } = useAuthStore();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const userPremiumCode = getUserPremiumCode();

  useEffect(() => {
    setMounted(true);
    setIsPremium(checkPremiumStatus().isPremium);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
      setUserName(name);
      setUserEmail(user.email || "");
    } else {
      const storedName = localStorage.getItem("paperpress_user_name");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: FileQuestion, label: "Notes Hub", href: "/notes" },
    { icon: FileText, label: "My Papers", href: "/my-papers" },
    { icon: BookOpen, label: "Subjects", href: "/subjects" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between px-3 h-14">
          {/* Left - Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center hover:bg-[#2A2A2A] transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Center - Title */}
          <h1 className="text-base font-bold text-white">{title}</h1>

          {/* Right - Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                mounted && isPremium 
                  ? 'bg-gradient-to-br from-[#B9FF66] to-[#22C55E] shadow-[0_0_20px_rgba(185,255,102,0.4)]' 
                  : 'bg-[#B9FF66] hover:brightness-110'
              }`}
            >
              <span className="text-[#0A0A0A] text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
            </button>
            
            {/* Premium Crown Badge */}
            {mounted && isPremium && (
              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0A0A0A] flex items-center justify-center border-2 border-[#B9FF66]">
                <Crown className="w-2 h-2 text-[#B9FF66]" />
              </div>
            )}

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-72 bg-[#1A1A1A] rounded-[20px] border border-[#2A2A2A] shadow-[0px_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  {/* User Info */}
                  <div className="p-4 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-3">
                      <div className={`relative w-12 h-12 rounded-[12px] flex items-center justify-center ${
                        mounted && isPremium 
                          ? 'bg-gradient-to-br from-[#B9FF66] to-[#22C55E] shadow-[0_0_15px_rgba(185,255,102,0.3)]' 
                          : 'bg-[#B9FF66]'
                      }`}>
                        <span className="text-[#0A0A0A] font-bold text-lg">{userName.charAt(0).toUpperCase()}</span>
                        {mounted && isPremium && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0A0A0A] flex items-center justify-center border border-[#B9FF66]">
                            <Crown className="w-2 h-2 text-[#B9FF66]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{userName}</p>
                        {userEmail && (
                          <p className="text-xs text-[#A0A0A0] truncate">{userEmail}</p>
                        )}
                      </div>
                      {mounted && isPremium && (
                        <div className="px-2 py-1 rounded-full bg-[#B9FF66]/20 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#B9FF66]" />
                          <span className="text-xs text-[#B9FF66] font-medium">Premium</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Premium Upgrade (if not premium) */}
                      {!mounted || !isPremium && (
                    <div className="p-3 border-b border-[#2A2A2A]">
                      <button
                        onClick={() => { setProfileOpen(false); setShowPremiumModal(true); }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] bg-gradient-to-r from-[#B9FF66]/10 to-[#22C55E]/10 border border-[#B9FF66]/20 hover:border-[#B9FF66]/40 transition-colors"
                      >
                        <Crown className="w-5 h-5 text-[#B9FF66]" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-[#B9FF66]">Upgrade to Premium</p>
                          <p className="text-xs text-[#A0A0A0]">Unlock unlimited papers</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#B9FF66] ml-auto" />
                      </button>
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => { router.push("/settings"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-[#2A2A2A] transition-colors"
                    >
                      <Settings className="w-5 h-5 text-[#A0A0A0]" />
                      <span className="text-white">Settings</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="p-2 border-t border-[#2A2A2A]">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-[#FF4D4D]/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5 text-[#FF4D4D]" />
                      <span className="text-[#FF4D4D] font-medium">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0A0A0A] z-50 border-r border-[#2A2A2A] shadow-2xl"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#B9FF66] flex items-center justify-center">
                    <span className="text-[#0A0A0A] font-bold">P</span>
                  </div>
                  <span className="text-white font-bold text-lg">PaperPress</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 h-10 rounded-[12px] bg-[#1A1A1A] flex items-center justify-center hover:bg-[#2A2A2A] transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Premium Badge */}
              {mounted && isPremium && (
                <div className="mx-4 mt-4 p-3 bg-[#B9FF66]/10 rounded-[12px] border border-[#B9FF66]/20">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#B9FF66]" />
                    <span className="text-[#B9FF66] font-semibold text-sm">Premium Active</span>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-[12px] bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-[#A0A0A0] group-hover:text-[#B9FF66] transition-colors" />
                      <span className="text-white font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
                  </button>
                ))}
              </nav>

              {/* User Info at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2A2A2A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#B9FF66] flex items-center justify-center">
                    <span className="text-[#0A0A0A] font-bold">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{userName}</p>
                    {mounted && isPremium ? (
                      <p className="text-xs text-[#B9FF66]">Premium Member</p>
                    ) : userPremiumCode ? (
                      <p className="text-xs text-[#A0A0A0]">Code: {userPremiumCode.toUpperCase()}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Premium Modal */}
      <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}

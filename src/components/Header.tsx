"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, FileText, BookOpen, Settings, LogOut, ChevronRight, User as UserIcon, Crown, FileQuestion } from "lucide-react";
import { checkPremiumStatus, getUserPremiumCode } from "@/lib/premium";
import { useAuthStore } from "@/stores/authStore";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function Header({ title = "PaperPress", showBack = false, onBack }: HeaderProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, user, signOut } = useAuthStore();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const isPremium = checkPremiumStatus().isPremium;
  const userPremiumCode = getUserPremiumCode();

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
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left - Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-[12px] bg-[#1A1A1A] flex items-center justify-center hover:bg-[#2A2A2A] transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Center - Title */}
          <h1 className="text-lg font-bold text-white">{title}</h1>

          {/* Right - Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-10 h-10 rounded-[12px] bg-[#B9FF66] flex items-center justify-center hover:brightness-110 transition-all"
            >
              <span className="text-[#0A0A0A] font-bold">{userName.charAt(0).toUpperCase()}</span>
            </button>

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
                      <div className="w-12 h-12 rounded-[12px] bg-[#B9FF66] flex items-center justify-center">
                        <span className="text-[#0A0A0A] font-bold text-lg">{userName.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{userName}</p>
                        {userEmail && (
                          <p className="text-xs text-[#A0A0A0] truncate">{userEmail}</p>
                        )}
                      </div>
                      {isPremium && (
                        <div className="w-8 h-8 rounded-[8px] bg-[#B9FF66]/20 flex items-center justify-center">
                          <Crown className="w-4 h-4 text-[#B9FF66]" />
                        </div>
                      )}
                    </div>
                  </div>

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
              {isPremium && (
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
                    {isPremium ? (
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

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}

"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { Menu, FileText, Settings, BookOpen, Home, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: FileText, label: "My Papers", href: "/my-papers" },
  { icon: BookOpen, label: "Subjects", href: "/subjects" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const MenuItem = memo(function MenuItem({
  item,
  index,
  onClick,
}: {
  item: typeof menuItems[0];
  index: number;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 active:bg-gray-100 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <div className="w-10 h-10 rounded-xl bg-[#1E88E5]/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#1E88E5]" />
      </div>
      <span className="font-medium">{item.label}</span>
    </motion.button>
  );
});

export function HomeHeader() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [showMenu, setShowMenu] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("paperpress_user_name") || "User";
    setUserName(name);
  }, []);

  const userInitial = userName.charAt(0).toUpperCase();

  const handleMenuItemClick = (href: string) => {
    setShowMenu(false);
    router.push(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Safe Area Background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-gray-100/50" />

      <div className="mx-auto max-w-[428px] relative pt-safe">
        <div className="h-14 flex items-center px-4 justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
            onClick={() => setShowMenu(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </Button>

          <div className="flex items-center gap-2">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="PaperPress"
                className="w-7 h-7 object-contain drop-shadow-sm"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">P</span>
              </div>
            )}
            <span className="font-bold text-base text-gray-900 tracking-tight">PaperPress</span>
          </div>

          <button
            onClick={() => router.push("/settings")}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white flex items-center justify-center text-xs font-bold shadow-md shadow-[#1E88E5]/20 active:scale-95 transition-all"
            aria-label="Open settings"
          >
            {userInitial}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setShowMenu(false)}
            />

            <motion.div
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl gpu-accelerate"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              <div className="p-4 pt-safe pb-6 bg-gradient-to-br from-[#1E88E5] to-[#1565C0]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      {!logoError ? (
                        <img src="/logo.png" alt="" className="w-8 h-8 object-contain" onError={() => setLogoError(true)} />
                      ) : (
                        <span className="text-white text-xl font-bold">P</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{userName}</p>
                      <p className="text-white/70 text-sm">Welcome back</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {menuItems.map((item, index) => (
                  <MenuItem key={item.label} item={item} index={index} onClick={() => handleMenuItemClick(item.href)} />
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

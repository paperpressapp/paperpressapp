"use client";

import { FileText, Settings } from "lucide-react";

interface HomeHeaderProps {
  userName: string;
  onSettingsPress: () => void;
}

export function HomeHeader({ userName, onSettingsPress }: HomeHeaderProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB]"
      style={{ 
        paddingTop: "max(16px, env(safe-area-inset-top, 16px))",
        height: "calc(56px + max(16px, env(safe-area-inset-top, 16px)))"
      }}
    >
      <div className="mx-auto max-w-[428px] h-full">
        <div className="h-14 px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[17px] text-[#111827] tracking-tight">
              PaperPress
            </span>
          </div>

          {/* Settings avatar */}
          <button
            onClick={onSettingsPress}
            className="w-9 h-9 rounded-full bg-[#1E88E5] flex items-center justify-center text-white font-bold text-sm shadow-sm active:scale-95 transition-transform"
          >
            {initial}
          </button>
        </div>
      </div>
    </header>
  );
}

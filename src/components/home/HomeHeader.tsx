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
      className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-[#2A2A2A]"
      style={{ 
        paddingTop: "max(16px, env(safe-area-inset-top, 16px))",
        height: "calc(56px + max(16px, env(safe-area-inset-top, 16px)))"
      }}
    >
      <div className="mx-auto max-w-[428px] h-full">
        <div className="h-14 px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B9FF66] to-[#22c55e] flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-[#0A0A0A]" />
            </div>
            <span className="font-bold text-[17px] text-white tracking-tight">
              PaperPress
            </span>
          </div>

          {/* Settings avatar */}
          <button
            onClick={onSettingsPress}
            className="w-9 h-9 rounded-full bg-[#B9FF66] flex items-center justify-center text-[#0A0A0A] font-bold text-sm shadow-sm active:scale-95 transition-transform"
          >
            {initial}
          </button>
        </div>
      </div>
    </header>
  );
}

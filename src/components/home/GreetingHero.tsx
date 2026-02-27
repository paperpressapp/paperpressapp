"use client";

import { GraduationCap } from "lucide-react";

interface GreetingHeroProps {
  userName: string;
  instituteName: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function GreetingHero({ userName, instituteName }: GreetingHeroProps) {
  return (
    <div className="mb-0 relative -mt-6 -mx-4">
      {/* Full Width Hero Container */}
      <div className="relative h-48 overflow-hidden rounded-b-3xl">
        {/* Background - gradient instead of external image */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A]" />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/90 via-[#1A1A1A]/80 to-[#0A0A0A]/90" />
        
        {/* Only 10% visible gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-gradient-to-t from-white to-transparent" />
        
        {/* Decorative blur elements */}
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-2 left-8 w-16 h-16 rounded-full bg-white/5" />
        <div className="absolute top-8 left-1/3 w-8 h-8 rounded-full bg-white/10" />
        
        {/* Content */}
        <div className="relative z-10 px-6 pt-12">
          {/* Decorative Icon */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#B9FF66]/20 backdrop-blur-sm flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#B9FF66]" />
            </div>
            <span className="text-xs font-semibold text-[#B9FF66] uppercase tracking-wider">
              PaperPress
            </span>
          </div>

          <p className="text-sm text-white/90 font-medium mb-0.5">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-white leading-tight">
            {userName}
          </h1>
          {instituteName ? (
            <p className="text-sm text-white/80 mt-1">{instituteName}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

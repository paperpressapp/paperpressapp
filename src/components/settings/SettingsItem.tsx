"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/hooks";
import { motion } from "framer-motion";

interface SettingsItemProps {
  icon?: LucideIcon;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleState?: boolean;
  onToggle?: (value: boolean) => void;
  onClick?: () => void;
  danger?: boolean;
  chevron?: boolean;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

export function SettingsItem({
  icon: Icon,
  label,
  value,
  toggle,
  toggleState,
  onToggle,
  onClick,
  danger,
  chevron = true,
  rightElement,
  disabled,
}: SettingsItemProps) {
  const handleClick = () => {
    if (disabled) return;
    triggerHaptic('light');
    if (onClick) {
      onClick();
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    if (onToggle) {
      onToggle(!toggleState);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-[12px] transition-colors",
        "bg-transparent hover:bg-[#1A1A1A] active:bg-[#252525]",
        danger && "hover:bg-[#FF4D4D]/10",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={cn(
              "w-9 h-9 rounded-[10px] flex items-center justify-center",
              danger
                ? "bg-[#FF4D4D]/20"
                : "bg-[#2A2A2A]"
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4",
                danger ? "text-[#FF4D4D]" : "text-[#A0A0A0]"
              )}
            />
          </div>
        )}
        
        <span
          className={cn(
            "text-sm font-medium",
            danger ? "text-[#FF4D4D]" : "text-white"
          )}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {value && (
          <span className="text-sm text-[#6B6B6B]">{value}</span>
        )}
        
        {rightElement}
        
        {toggle && (
          <div
            onClick={handleToggle}
            className={cn(
              "w-11 h-6 rounded-full p-1 transition-colors cursor-pointer",
              toggleState ? "bg-[#B9FF66]" : "bg-[#2A2A2A]"
            )}
          >
            <motion.div
              animate={{ x: toggleState ? 20 : 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="w-4 h-4 rounded-full bg-white shadow-sm"
            />
          </div>
        )}
        
        {chevron && !toggle && !rightElement && (
          <svg
            className="w-4 h-4 text-[#6B6B6B]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </div>
    </motion.button>
  );
}

// Section Header Component
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider px-4 mb-2">
        {title}
      </h3>
      <div className="bg-[#1A1A1A] rounded-[16px] border border-[#2A2A2A] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

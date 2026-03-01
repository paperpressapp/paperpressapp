"use client";

import { useState } from 'react';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/stores';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useThemeStore();
  const [showOptions, setShowOptions] = useState(false);

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  const currentOption = options.find(o => o.value === theme) || options[1];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-3 py-2 rounded-[20px] bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-all border border-[#2A2A2A]"
        aria-label="Change theme"
      >
        <CurrentIcon className="w-4 h-4 text-[#B9FF66]" />
        <span className="text-xs text-white font-medium">{currentOption.label}</span>
      </button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] rounded-[16px] border border-[#2A2A2A] shadow-xl p-1 min-w-[140px]"
          >
            {options.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setShowOptions(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all ${
                    isActive 
                      ? 'bg-[#B9FF66]/10 text-[#B9FF66]' 
                      : 'text-white hover:bg-[#2A2A2A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium flex-1 text-left">{option.label}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowOptions(false)} 
        />
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function ThemeToggleCompact() {
  const { theme, toggleTheme } = useThemeStore();
  
  return (
    <button
      onClick={toggleTheme}
      className="w-12 h-7 rounded-full bg-[#2A2A2A] p-1 transition-colors relative"
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-5 h-5 rounded-full flex items-center justify-center"
        animate={{ 
          x: theme === 'light' ? 20 : theme === 'dark' ? 0 : 10 
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-[#B9FF66]" />
        ) : theme === 'light' ? (
          <Sun className="w-3 h-3 text-amber-500" />
        ) : (
          <Monitor className="w-3 h-3 text-[#B9FF66]" />
        )}
      </motion.div>
    </button>
  );
}

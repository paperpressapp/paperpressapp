"use client";

import { useState, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, FileText, Settings, Plus, BookOpen, X, ChevronRight, ArrowLeft, FileQuestion, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePaperStore } from "@/stores";
import { CLASSES } from "@/constants/classes";
import { SUBJECTS } from "@/constants/subjects";
import { triggerHaptic } from "@/hooks";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/my-papers", label: "Papers", icon: FileText },
  { href: "/notes", label: "Notes", icon: FileQuestion },
  { href: "/settings", label: "Settings", icon: Settings },
];

const NavItem = memo(function NavItem({
  item,
  isActive,
  onClick,
}: {
  item: typeof navItems[0];
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    triggerHaptic('light');
    onClick(e);
  };

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center flex-1 h-full py-0.5 rounded-lg transition-all duration-200",
        isActive
          ? "text-[#B9FF66] bg-[#B9FF66]/10"
          : "text-[#A0A0A0] hover:text-white active:bg-[#2A2A2A]"
      )}
    >
      <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
      <span className={cn("text-[10px] font-medium mt-0", isActive && "font-semibold")}>
        {item.label}
      </span>
    </Link>
  );
});

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedClass, setClass, setSubject } = usePaperStore();

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);

  const isActive = useCallback((href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname.startsWith(href);
  }, [pathname]);

  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    if (pathname === href) e.preventDefault();
  }, [pathname]);

  const openCreateFlow = useCallback(() => setShowCreatePopup(true), []);

  const closePopup = useCallback(() => {
    setShowCreatePopup(false);
    setShowSubjectSelector(false);
  }, []);

  const handleSelectClass = useCallback((classId: string) => {
    setClass(classId as any);
    setShowSubjectSelector(true);
  }, [setClass]);

  const handleSelectSubject = useCallback((subjectId: string) => {
    const currentClass = usePaperStore.getState().selectedClass || "9th";
    setSubject(subjectId as any);
    setShowCreatePopup(false);
    setShowSubjectSelector(false);
    router.push(`/templates?class=${currentClass}&subject=${subjectId.toLowerCase()}`);
  }, [setSubject, router]);

  const classColors: Record<string, string> = {
    '9th': 'from-emerald-400 to-green-500',
    '10th': 'from-[#B9FF66] to-[#22c55e]',
    '11th': 'from-amber-400 to-orange-500',
    '12th': 'from-violet-500 to-purple-600',
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] px-2 pointer-events-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <nav className="relative z-10 glass-panel-dark rounded-t-xl max-w-[428px] mx-auto pointer-events-auto shadow-[0_-8px_32px_rgba(0,0,0,0.5)] border-t border-white/5">
          <div className="flex items-center justify-between h-16 px-1 relative">

            {/* Left Nav Items */}
            <div className="flex items-center justify-around flex-1">
              {navItems.slice(0, 2).map((item) => (
                <NavItem key={item.href} item={item} isActive={isActive(item.href)} onClick={(e) => handleNavClick(e, item.href)} />
              ))}
            </div>

            {/* Center Floating Create Action */}
            <div className="relative px-1 shrink-0">
              <button
                onClick={() => { triggerHaptic('medium'); openCreateFlow(); }}
                className="relative -mt-8 z-20 touch-manipulation group"
                aria-label="Create new paper"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#B9FF66] to-[#22c55e] text-[#0A0A0A] shadow-[0_6px_24px_rgba(185,255,102,0.4)] border-4 border-[#0A0A0A] group-active:scale-95 transition-all duration-200">
                  <Plus className="w-6 h-6" strokeWidth={2.5} />
                </div>
              </button>
            </div>

            {/* Right Nav Items */}
            <div className="flex items-center justify-around flex-1">
              {navItems.slice(2).map((item) => (
                <NavItem key={item.href} item={item} isActive={isActive(item.href)} onClick={(e) => handleNavClick(e, item.href)} />
              ))}
            </div>

          </div>
        </nav>
      </div>

      {showCreatePopup && (
        <div className="fixed inset-0 z-[200] animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePopup} />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center max-h-[90vh]">
            <div className="w-full max-w-2xl mx-auto glass-panel-dark rounded-t-[32px] overflow-hidden animate-slideUp border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white tracking-tight">Create New Paper</h2>
                  <Button variant="ghost" size="icon" onClick={closePopup} className="h-10 w-10 rounded-full bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </Button>
                </div>

                {!showSubjectSelector && (
                  <div className="space-y-4">
                    <p className="text-sm text-[#A0A0A0]">Select a class</p>
                    <div className="grid grid-cols-2 gap-4">
                      {CLASSES.map((classInfo) => (
                        <motion.button
                          key={classInfo.id}
                          onClick={() => {
                            triggerHaptic('light');
                            handleSelectClass(classInfo.id);
                          }}
                          className="flex flex-col items-center justify-center gap-3 bg-[#1A1A1A] rounded-2xl p-5 transition-all duration-200 border border-[#2A2A2A] hover:border-[#B9FF66]/30 hover:bg-[#252525]"
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${classColors[classInfo.id]} flex items-center justify-center shadow-lg`}>
                            <span className="text-[#0A0A0A] font-bold text-xl">{classInfo.id}</span>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-white tracking-tight">{classInfo.name}</p>
                            <p className="text-xs text-[#6B6B6B] mt-1">{classInfo.subjectCount} subjects</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {showSubjectSelector && (
                  <div className="space-y-4">
                    <Button variant="ghost" onClick={() => setShowSubjectSelector(false)} className="mb-2 justify-start h-11 text-[#B9FF66] font-medium hover:bg-[#B9FF66]/10 hover:text-[#B9FF66]">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Classes
                    </Button>
                    <p className="text-sm text-[#A0A0A0]">Select a subject</p>
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto scrollbar-hide">
                      {SUBJECTS.map((subject, index) => {
                        const colors = [
                          'from-[#B9FF66] to-[#22c55e]',
                          'from-emerald-400 to-green-500',
                          'from-violet-500 to-purple-600',
                          'from-amber-400 to-orange-500',
                          'from-rose-400 to-pink-500',
                          'from-cyan-400 to-teal-500',
                        ];
                        const colorClass = colors[index % colors.length];

                        return (
                          <motion.button
                            key={subject.id}
                            onClick={() => {
                              triggerHaptic('medium');
                              handleSelectSubject(subject.id);
                            }}
                            className="w-full flex items-center gap-4 bg-[#1A1A1A] rounded-2xl p-4 transition-all duration-200 border border-[#2A2A2A] hover:border-[#B9FF66]/30 hover:bg-[#252525]"
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md`}>
                              <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-semibold text-white flex-1 text-left tracking-tight">{subject.name}</span>
                            <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                              <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="h-4 pb-safe bg-[#1A1A1A]/80 backdrop-blur-md" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

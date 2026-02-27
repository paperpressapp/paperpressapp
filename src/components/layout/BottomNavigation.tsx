"use client";

import { useState, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, FileText, Settings, Plus, BookOpen, X, ChevronRight, ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePaperStore } from "@/stores";
import { CLASSES } from "@/constants/classes";
import { SUBJECTS } from "@/constants/subjects";

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
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center flex-1 h-full py-1 rounded-2xl transition-all duration-200",
        isActive
          ? "text-[#B9FF66] bg-[#B9FF66]/10"
          : "text-[#A0A0A0] hover:text-white active:bg-[#2A2A2A]"
      )}
    >
      <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
      <span className={cn("text-[11px] font-medium mt-0.5", isActive && "font-semibold")}>
        {item.label}
      </span>
    </Link>
  );
});

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedClass, setClass, setSubject, selectAllChapters } = usePaperStore();

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
    selectAllChapters([]);
    setShowCreatePopup(false);
    setShowSubjectSelector(false);
    router.push(`/chapters/${currentClass}/${subjectId.toLowerCase()}`);
  }, [setSubject, selectAllChapters, router]);

  const classColors: Record<string, string> = {
    '9th': 'from-emerald-400 to-green-500',
    '10th': 'from-[#1E88E5] to-[#1565C0]',
    '11th': 'from-amber-400 to-orange-500',
    '12th': 'from-violet-500 to-purple-600',
  };

  return (
    <>
      <div 
        className="fixed bottom-0 left-0 right-0 z-[100]"
        style={{ height: 'auto' }}
      >
        <nav className="relative z-10 bg-[#1A1A1A] shadow-xl shadow-black/30 border-t border-[#2A2A2A] max-w-[428px] mx-auto">
          <div 
            className="flex items-center justify-center h-16"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            <div className="flex items-center justify-around flex-1 mx-auto w-full px-2">
              {navItems.slice(0, 2).map((item) => (
                <NavItem key={item.href} item={item} isActive={isActive(item.href)} onClick={(e) => handleNavClick(e, item.href)} />
              ))}
            </div>

            <button onClick={openCreateFlow} className="relative -mt-5 z-20 touch-manipulation" aria-label="Create new paper">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#B9FF66] to-[#22c55e] text-[#0A0A0A] shadow-lg shadow-[#B9FF66]/30 border-4 border-[#1A1A1A] active:scale-90 transition-transform duration-100">
                <Plus className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#B9FF66] whitespace-nowrap">Create</span>
            </button>

            <div className="flex items-center justify-around flex-1 mx-auto w-full px-2">
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
            <div className="w-full max-w-2xl mx-auto bg-[#1A1A1A] rounded-t-[32px] overflow-hidden animate-slideUp border-t border-[#2A2A2A]">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Create New Paper</h2>
                  <Button variant="ghost" size="icon" onClick={closePopup} className="h-12 w-12 rounded-full bg-[#2A2A2A]">
                    <X className="w-5 h-5 text-white" />
                  </Button>
                </div>

                {!showSubjectSelector && (
                  <div className="space-y-3">
                    <p className="text-sm text-[#A0A0A0] mb-4">Select a class</p>
                    {CLASSES.map((classInfo) => (
                      <button
                        key={classInfo.id}
                        onClick={() => handleSelectClass(classInfo.id)}
                        className="w-full flex items-center gap-3 bg-[#2A2A2A] rounded-[16px] p-4 active:bg-[#3A3A3A] transition-colors min-h-[64px] border border-[#2A2A2A] hover:border-[#B9FF66]/30"
                      >
                        <div className={`w-12 h-12 rounded-[12px] bg-gradient-to-br ${classColors[classInfo.id]} flex items-center justify-center shadow-lg`}>
                          <span className="text-white font-bold text-lg">{classInfo.id}</span>
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-white">{classInfo.name}</p>
                          <p className="text-sm text-[#A0A0A0]">{classInfo.subjectCount} subjects</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                      </button>
                    ))}
                  </div>
                )}

                {showSubjectSelector && (
                  <div className="space-y-3">
                    <Button variant="ghost" onClick={() => setShowSubjectSelector(false)} className="mb-4 justify-start h-11 text-[#B9FF66] font-medium">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Classes
                    </Button>
                    <p className="text-sm text-[#A0A0A0] mb-4">Select a subject</p>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                      {SUBJECTS.map((subject, index) => {
                        const colors = [
                          'from-[#1E88E5] to-[#1565C0]',
                          'from-emerald-400 to-green-500',
                          'from-violet-500 to-purple-600',
                          'from-amber-400 to-orange-500',
                          'from-rose-400 to-pink-500',
                          'from-cyan-400 to-teal-500',
                        ];
                        const colorClass = colors[index % colors.length];
                        
                        return (
                          <button
                            key={subject.id}
                            onClick={() => handleSelectSubject(subject.id)}
                            className="w-full flex items-center gap-3 bg-[#2A2A2A] rounded-[12px] p-4 active:bg-[#3A3A3A] transition-colors min-h-[56px] border border-[#2A2A2A] hover:border-[#B9FF66]/30"
                          >
                            <div className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md`}>
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-medium text-white flex-1 text-left">{subject.name}</span>
                            <ChevronRight className="w-5 h-5 text-[#A0A0A0]" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 pb-safe" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

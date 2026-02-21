"use client";

import { useState, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, FileText, Settings, Plus, BookOpen, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePaperStore } from "@/stores";
import { CLASSES } from "@/constants/classes";
import { SUBJECTS } from "@/constants/subjects";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/my-papers", label: "Papers", icon: FileText },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
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
          ? "text-[#1E88E5] bg-[#1E88E5]/10"
          : "text-gray-400 hover:text-gray-600 active:bg-gray-100/50"
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
    setSubject(subjectId as any);
    selectAllChapters([]);
    setShowCreatePopup(false);
    setShowSubjectSelector(false);

    const classId = selectedClass || "9th";
    router.push(`/chapters/${classId}/${subjectId.toLowerCase()}`);
  }, [selectedClass, setSubject, selectAllChapters, router]);

  const classColors: Record<string, string> = {
    '9th': 'from-emerald-400 to-green-500',
    '10th': 'from-[#1E88E5] to-[#1565C0]',
    '11th': 'from-amber-400 to-orange-500',
    '12th': 'from-violet-500 to-purple-600',
  };

  return (
    <>
      {/* Fixed navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100]">
        <div className="absolute inset-0 bg-gray-50" />
        <nav className="relative z-10">
          <div className="mx-auto max-w-[428px] px-3 py-2" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
            <div className="flex items-center h-16 px-2 bg-white rounded-2xl shadow-xl shadow-gray-300/30 border border-gray-100">
              <div className="flex items-center flex-1">
                {navItems.slice(0, 2).map((item) => (
                  <NavItem key={item.href} item={item} isActive={isActive(item.href)} onClick={(e) => handleNavClick(e, item.href)} />
                ))}
              </div>

              <button onClick={openCreateFlow} className="relative -mt-5 mx-1 z-20" aria-label="Create new paper">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white shadow-lg shadow-[#1E88E5]/40 border-4 border-white active:scale-95 transition-transform">
                  <Plus className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#1E88E5] whitespace-nowrap">Create</span>
              </button>

              <div className="flex items-center flex-1">
                {navItems.slice(2).map((item) => (
                  <NavItem key={item.href} item={item} isActive={isActive(item.href)} onClick={(e) => handleNavClick(e, item.href)} />
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Create Paper Popup */}
      <AnimatePresence>
        {showCreatePopup && (
          <div className="fixed inset-0 z-[200]">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closePopup} />

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center max-h-[90vh]">
              <motion.div
                className="w-full max-w-[428px] mx-auto bg-white rounded-t-[32px] overflow-hidden"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create New Paper</h2>
                    <button onClick={closePopup} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {!showSubjectSelector && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-500 mb-4">Select a class</p>
                      {CLASSES.map((classInfo) => (
                        <button
                          key={classInfo.id}
                          onClick={() => handleSelectClass(classInfo.id)}
                          className="w-full flex items-center gap-3 bg-gray-50 rounded-xl p-4 active:bg-gray-100 transition-colors"
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${classColors[classInfo.id]} flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold text-lg">{classInfo.id}</span>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">{classInfo.name}</p>
                            <p className="text-sm text-gray-500">{classInfo.subjectCount} subjects</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                        </button>
                      ))}
                    </div>
                  )}

                  {showSubjectSelector && (
                    <div className="space-y-3">
                      <button onClick={() => setShowSubjectSelector(false)} className="text-sm text-[#1E88E5] font-medium mb-4 flex items-center gap-1">
                        <X className="w-4 h-4 rotate-45" /> Change Class
                      </button>
                      <p className="text-sm text-gray-500 mb-4">Select a subject</p>
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
                              className="w-full flex items-center gap-3 bg-gray-50 rounded-xl p-4 active:bg-gray-100 transition-colors"
                            >
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md`}>
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-medium text-gray-900">{subject.name}</span>
                              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-6" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

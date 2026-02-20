"use client";

import { useState, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, FileText, Settings, Plus, BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePaperStore } from "@/stores";
import { CLASSES } from "@/constants/classes";
import { SUBJECTS } from "@/constants/subjects";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared";

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
        "flex flex-col items-center justify-center flex-1 h-full py-1 rounded-2xl transition-colors duration-150",
        isActive
          ? "text-[#1E88E5] bg-[#1E88E5]/10"
          : "text-gray-500 active:bg-gray-100/50"
      )}
    >
      <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
      <span className={cn("text-[11px] font-medium mt-0.5", isActive && "font-semibold")}>
        {item.label}
      </span>
    </Link>
  );
});

const ClassCard = memo(function ClassCard({
  classInfo,
  onClick,
}: {
  classInfo: typeof CLASSES[0];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-gray-50 active:bg-[#1E88E5] rounded-2xl p-5 border-2 border-transparent transition-colors text-left w-full"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold mb-3"
        style={{ backgroundColor: classInfo.color }}
      >
        {classInfo.id.replace(/\D/g, "")}
      </div>
      <p className="font-bold text-gray-900 group-active:text-white transition-colors">
        {classInfo.name}
      </p>
      <p className="text-xs text-gray-500 group-active:text-white/70 transition-colors mt-1">
        {classInfo.subjectCount} Subjects
      </p>
    </button>
  );
});

const SubjectCard = memo(function SubjectCard({
  subject,
  onClick,
}: {
  subject: typeof SUBJECTS[0];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-gray-50 active:bg-gradient-to-br active:from-[#1E88E5] active:to-[#1565C0] rounded-2xl p-4 border-2 border-transparent transition-colors text-left w-full"
    >
      <p className="font-bold text-gray-900 group-active:text-white transition-colors text-sm">
        {subject.name}
      </p>
      <p className="text-xs text-gray-500 group-active:text-white/70 transition-colors mt-1">
        {subject.chapterCount} Chapters
      </p>
    </button>
  );
});

const SPRING_CONFIG = { type: "spring", damping: 30, stiffness: 400 } as const;

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { setClass, setSubject, selectedMcqIds, selectedShortIds, selectedLongIds, resetQuestions } = usePaperStore();

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const hasUnsavedChanges = selectedMcqIds.length > 0 || selectedShortIds.length > 0 || selectedLongIds.length > 0;

  const isActive = useCallback((href: string) => {
    if (href === "/home") return pathname === "/home" || pathname === "/";
    if (href === "/my-papers") return pathname.startsWith("/my-papers") || pathname.startsWith("/paper/");
    if (href === "/subjects") return pathname.startsWith("/subjects") || pathname.startsWith("/chapters");
    return pathname.startsWith(href);
  }, [pathname]);

  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    if (!hasUnsavedChanges || href === pathname) return;
    e.preventDefault();
    setPendingHref(href);
    setShowConfirmDialog(true);
  }, [hasUnsavedChanges, pathname]);

  const confirmNavigate = useCallback(() => {
    resetQuestions();
    setShowConfirmDialog(false);
    if (pendingHref) router.push(pendingHref);
    setPendingHref(null);
  }, [resetQuestions, router, pendingHref]);

  const cancelNavigate = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingHref(null);
  }, []);

  const handleClassSelect = useCallback((classId: string) => {
    setSelectedClass(classId);
  }, []);

  const handleSubjectSelect = useCallback((subjectId: string) => {
    if (!selectedClass) return;

    const subject = SUBJECTS.find((s) => s.id === subjectId);
    if (subject) {
      setClass(selectedClass as "9th" | "10th" | "11th" | "12th");
      setSubject(subject.name as "Physics" | "Chemistry" | "Biology" | "Mathematics" | "Computer" | "English");
      setShowCreatePopup(false);
      setSelectedClass(null);
      router.push(`/chapters/${selectedClass}/${subjectId}`);
    }
  }, [selectedClass, setClass, setSubject, router]);

  const closePopup = useCallback(() => {
    setShowCreatePopup(false);
    setSelectedClass(null);
  }, []);

  const goBack = useCallback(() => {
    if (selectedClass) {
      setSelectedClass(null);
    } else {
      setShowCreatePopup(false);
    }
  }, [selectedClass]);

  const selectedClassInfo = CLASSES.find((c) => c.id === selectedClass);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe">
        <div className="mx-auto max-w-[428px]">
          <div className="relative flex items-center h-16 px-2 mt-2 glass-panel rounded-2xl gpu-accelerate">
            <div className="flex items-center flex-1">
              {navItems.slice(0, 2).map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  onClick={(e) => handleNavClick(e, item.href)}
                />
              ))}
            </div>

            <button
              onClick={() => setShowCreatePopup(true)}
              className="relative -mt-5 mx-1 touch-manipulation"
              aria-label="Create new paper"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white shadow-lg shadow-[#1E88E5]/30 border-4 border-white active:scale-95 transition-transform">
                <Plus className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-[#1E88E5] whitespace-nowrap">
                Create
              </span>
            </button>

            <div className="flex items-center flex-1">
              {navItems.slice(2).map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isActive={isActive(item.href)}
                  onClick={(e) => handleNavClick(e, item.href)}
                />
              ))}
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showCreatePopup && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closePopup}
            />

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center max-h-[90vh]">
              <motion.div
                className="w-full max-w-[428px] bg-white rounded-t-3xl overflow-hidden shadow-2xl flex flex-col gpu-accelerate"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={SPRING_CONFIG}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                <div className="px-5 pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {selectedClass ? "Select Subject" : "Select Class"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedClass ? `For ${selectedClassInfo?.name}` : "Choose your class"}
                      </p>
                    </div>
                    <button
                      onClick={goBack}
                      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
                      aria-label={selectedClass ? "Go back" : "Close"}
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="p-5 overflow-y-auto max-h-[50vh] smooth-scroll">
                  {!selectedClass ? (
                    <div className="grid grid-cols-2 gap-3">
                      {CLASSES.map((classInfo) => (
                        <ClassCard
                          key={classInfo.id}
                          classInfo={classInfo}
                          onClick={() => handleClassSelect(classInfo.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {SUBJECTS.map((subject) => (
                        <SubjectCard
                          key={subject.id}
                          subject={subject}
                          onClick={() => handleSubjectSelect(subject.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-5 pb-safe pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={goBack}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
                  >
                    {selectedClass ? "Back to Classes" : "Cancel"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={cancelNavigate}
        onConfirm={confirmNavigate}
        title="Discard Changes?"
        message="You have unsaved questions. Are you sure you want to leave?"
        confirmText="Discard"
        cancelText="Keep"
        variant="destructive"
      />
    </>
  );
}

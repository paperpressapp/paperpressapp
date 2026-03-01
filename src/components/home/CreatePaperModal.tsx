"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles, GraduationCap, Users, Crown, BookOpen, Atom, FlaskConical, Calculator, Laptop, BookText, Leaf } from "lucide-react";
import { SUBJECTS } from "@/constants/subjects";
import { CLASSES } from "@/constants/classes";
import { usePaperStore } from "@/stores";
import { cn } from "@/lib/utils";

interface CreatePaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "class" | "subject";

const CLASSES_DATA = [
  { id: "9th", name: "Class 9th", icon: GraduationCap, color: "from-blue-500 to-blue-600" },
  { id: "10th", name: "Class 10th", icon: Users, color: "from-emerald-500 to-emerald-600" },
  { id: "11th", name: "Class 11th", icon: Crown, color: "from-violet-500 to-violet-600" },
  { id: "12th", name: "Class 12th", icon: BookOpen, color: "from-amber-500 to-amber-600" },
];

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  physics: <Atom className="w-5 h-5" />,
  chemistry: <FlaskConical className="w-5 h-5" />,
  biology: <Leaf className="w-5 h-5" />,
  mathematics: <Calculator className="w-5 h-5" />,
  computer: <Laptop className="w-5 h-5" />,
  english: <BookText className="w-5 h-5" />,
};

export function CreatePaperModal({ isOpen, onClose }: CreatePaperModalProps) {
  const router = useRouter();
  const { setClass, setSubject } = usePaperStore();
  const [step, setStep] = useState<Step>("class");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("class");
      setSelectedClass(null);
      setSelectedSubject(null);
    }
  }, [isOpen]);

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setStep("subject");
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const handleContinue = () => {
    if (!selectedClass || !selectedSubject) return;

    const subject = SUBJECTS.find((s) => s.id === selectedSubject);
    if (subject) {
      setClass(selectedClass as "9th" | "10th" | "11th" | "12th");
      setSubject(subject.name as "Physics" | "Chemistry" | "Biology" | "Mathematics" | "Computer" | "English");
      onClose();
      router.push(`/templates?class=${selectedClass}&subject=${selectedSubject}`);
    }
  };

  const handleBack = () => {
    if (step === "subject") {
      setStep("class");
      setSelectedSubject(null);
    }
  };

  const selectedSubjectData = SUBJECTS.find((s) => s.id === selectedSubject);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-[24px] border-t border-[#2A2A2A] shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3 cursor-grab">
              <div className="w-10 h-1 rounded-full bg-[#2A2A2A]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-2">
              <div className="flex items-center gap-3">
                {step === "subject" && (
                  <button
                    onClick={handleBack}
                    className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center hover:bg-[#3A3A3A] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white rotate-180" />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#B9FF66]" />
                    Create Paper
                  </h2>
                  <p className="text-sm text-[#A0A0A0]">
                    {step === "class" ? "Select your class" : "Choose a subject"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center hover:bg-[#3A3A3A] transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              <AnimatePresence mode="wait">
                {step === "class" ? (
                  <motion.div
                    key="class"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Class Pills - Horizontal Scroll */}
                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                      {CLASSES_DATA.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => handleClassSelect(cls.id)}
                          className={cn(
                            "flex-shrink-0 px-5 py-3 rounded-[16px] border transition-all",
                            selectedClass === cls.id
                              ? "bg-gradient-to-r from-[#B9FF66] to-[#22C55E] border-transparent text-[#0A0A0A]"
                              : "bg-[#2A2A2A] border-[#2A2A2A] text-white hover:border-[#B9FF66]/50"
                          )}
                        >
                          <cls.icon className={cn("w-5 h-5 mx-auto mb-1", selectedClass === cls.id ? "text-[#0A0A0A]" : "text-[#A0A0A0]")} />
                          <span className="text-sm font-medium">{cls.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-4 p-4 bg-[#2A2A2A]/50 rounded-[16px]">
                      <p className="text-sm text-[#A0A0A0] text-center">
                        Select a class to see available subjects
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="subject"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Selected Class Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-[#B9FF66]/20 text-[#B9FF66] text-sm font-medium">
                        Class {selectedClass}
                      </span>
                      <span className="text-[#A0A0A0] text-sm">Select a subject</span>
                    </div>

                    {/* Subject Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {SUBJECTS.map((subject) => (
                        <button
                          key={subject.id}
                          onClick={() => handleSubjectSelect(subject.id)}
                          className={cn(
                            "p-4 rounded-[16px] border text-left transition-all",
                            selectedSubject === subject.id
                              ? "bg-[#B9FF66]/10 border-[#B9FF66]"
                              : "bg-[#2A2A2A]/50 border-[#2A2A2A] hover:border-[#B9FF66]/50"
                          )}
                        >
                          <div
                            className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-2"
                            style={{
                              backgroundColor: `${subject.color}20`,
                              color: subject.color
                            }}
                          >
                            {SUBJECT_ICONS[subject.id]}
                          </div>
                          <h3 className="font-semibold text-white">{subject.name}</h3>
                          <p className="text-xs text-[#A0A0A0]">{subject.chapterCount} Chapters</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Continue Button */}
            {step === "subject" && (
              <div className="p-4 border-t border-[#2A2A2A]">
                <button
                  onClick={handleContinue}
                  disabled={!selectedSubject}
                  className={cn(
                    "w-full h-14 rounded-[20px] flex items-center justify-center gap-2 font-semibold text-base transition-all",
                    selectedSubject
                      ? "bg-gradient-to-r from-[#B9FF66] to-[#22C55E] text-[#0A0A0A] shadow-lg shadow-[#B9FF66]/20"
                      : "bg-[#2A2A2A] text-[#6B6B6B] cursor-not-allowed"
                  )}
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

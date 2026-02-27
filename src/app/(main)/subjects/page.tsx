"use client";

/**
 * Subjects Page - Redesigned with Class Selection Popup
 * 
 * Shows all subjects first, then class selection popup when subject is clicked.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, BookOpen, ChevronRight, Atom, FlaskConical, Leaf, Calculator, Laptop, BookText } from "lucide-react";
import { ScrollView, MainLayout } from "@/components/layout";
import { SUBJECTS } from "@/constants/subjects";
import { CLASSES } from "@/constants/classes";
import { usePaperStore } from "@/stores";
import { Button } from "@/components/ui/button";

// Subject icons mapping
const subjectIcons: Record<string, React.ReactNode> = {
  physics: <Atom className="w-5 h-5" />,
  chemistry: <FlaskConical className="w-5 h-5" />,
  biology: <Leaf className="w-5 h-5" />,
  mathematics: <Calculator className="w-5 h-5" />,
  computer: <Laptop className="w-5 h-5" />,
  english: <BookText className="w-5 h-5" />,
};

export default function SubjectsPage() {
  const router = useRouter();
  const { setClass, setSubject, resetAll } = usePaperStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [showClassPopup, setShowClassPopup] = useState(false);

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setShowClassPopup(true);
  };

  const handleClassSelect = (classId: string) => {
    if (!selectedSubjectId) return;

    const subject = SUBJECTS.find((s) => s.id === selectedSubjectId);
    if (subject) {
      setClass(classId as "9th" | "10th" | "11th" | "12th");
      setSubject(subject.name as "Physics" | "Chemistry" | "Biology" | "Mathematics" | "Computer" | "English");
      router.push(`/chapters/${classId}/${selectedSubjectId}`);
    }
  };

  const handleBack = () => {
    resetAll();
    router.push("/home");
  };

  const selectedSubject = SUBJECTS.find((s) => s.id === selectedSubjectId);

  return (
    <MainLayout showBottomNav className="bg-[#0A0A0A]">
      <header className="bg-[#0A0A0A] border-b border-[#2A2A2A] sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-12 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </Button>
          <h1 className="font-bold text-base text-white">Select Subject</h1>
          <div className="w-8" />
        </div>
      </header>

      <ScrollView className="flex-1 pb-20">
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-[#B9FF66]" />
            <h2 className="text-base font-bold text-white">Select Subject</h2>
          </div>
        </div>

          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {SUBJECTS.map((subject) => (
                <Button
                  key={subject.id}
                  variant="ghost"
                  onClick={() => handleSubjectClick(subject.id)}
                  className="group justify-start h-auto bg-[#1A1A1A] rounded-[20px] p-4 border border-[#2A2A2A] shadow-[0px_8px_24px_rgba(0,0,0,0.4)] active:scale-[0.98] transition-all text-left"
                >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-2"
                  style={{
                    backgroundColor: `${subject.color}20`,
                    color: subject.color
                  }}
                >
                  {subjectIcons[subject.id]}
                </div>
                <h3 className="font-semibold text-sm text-white">{subject.name}</h3>
                <p className="text-xs text-[#A0A0A0] mt-0.5">{subject.chapterCount} Chapters</p>
              </Button>
            ))}
          </div>
        </div>
      </ScrollView>

      {/* Class Selection Popup */}
      <AnimatePresence>
        {showClassPopup && selectedSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClassPopup(false)}
            />
            <motion.div
              className="relative bg-[#1A1A1A] rounded-[20px] w-full max-w-sm overflow-hidden border border-[#2A2A2A] shadow-[0px_8px_32px_rgba(0,0,0,0.5)]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-4 border-b border-[#2A2A2A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                      style={{
                        backgroundColor: selectedSubject ? `${selectedSubject.color}20` : '#2A2A2A',
                        color: selectedSubject?.color || '#A0A0A0'
                      }}
                    >
                      {selectedSubject ? subjectIcons[selectedSubject.id] : null}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{selectedSubject?.name}</h3>
                      <p className="text-xs text-[#A0A0A0]">Select your class</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowClassPopup(false)} className="h-8 w-8 rounded-[12px]">
                    <X className="w-4 h-4 text-[#A0A0A0]" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs font-medium text-[#A0A0A0] mb-3">Available Classes</p>
                <div className="grid grid-cols-2 gap-2">
                  {CLASSES.map((classInfo) => (
                    <motion.button
                      key={classInfo.id}
                      onClick={() => handleClassSelect(classInfo.id)}
                      className="group bg-[#2A2A2A] hover:bg-[#B9FF66] rounded-[12px] p-3 border border-transparent hover:border-[#B9FF66] transition-all text-left"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[8px] bg-[#1A1A1A] group-hover:bg-[#0A0A0A]/20 flex items-center justify-center text-sm font-bold text-white group-hover:text-[#0A0A0A] transition-colors">
                          {classInfo.id.replace(/\D/g, "")}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white group-hover:text-[#0A0A0A] transition-colors">
                            {classInfo.name}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-[#2A2A2A]">
                <Button
                  variant="outline"
                  onClick={() => setShowClassPopup(false)}
                  className="w-full h-10 rounded-[40px] border border-[#2A2A2A] font-medium text-white text-sm bg-transparent hover:bg-[#2A2A2A]"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

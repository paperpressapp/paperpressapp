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
import { cn } from "@/lib/utils";

// Subject icons mapping
const subjectIcons: Record<string, React.ReactNode> = {
  physics: <Atom className="w-8 h-8" />,
  chemistry: <FlaskConical className="w-8 h-8" />,
  biology: <Leaf className="w-8 h-8" />,
  mathematics: <Calculator className="w-8 h-8" />,
  computer: <Laptop className="w-8 h-8" />,
  english: <BookText className="w-8 h-8" />,
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
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <MainLayout showBottomNav>
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="fixed top-0 left-0 right-0 z-50 pt-safe">
            <div className="mx-auto max-w-[428px]">
              <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100">
                <div className="px-4 h-14 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl active:bg-gray-100"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </Button>
                  <h1 className="font-bold text-lg text-gray-900">Select Subject</h1>
                  <div className="w-10" />
                </div>
              </div>
            </div>
          </header>

          <ScrollView className="pt-[56px] flex-1">
            <div className="px-5 py-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Choose a Subject</h2>
                <p className="text-white/70">Select your subject to create paper</p>
              </div>
            </div>

            <div className="px-5 pb-6">
              <div className="grid grid-cols-2 gap-4">
                {SUBJECTS.map((subject, index) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject.id)}
                    className="group relative bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg overflow-hidden text-left active:scale-[0.98] transition-transform"
                  >
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                      style={{ 
                        backgroundColor: `${subject.color}15`,
                        color: subject.color 
                      }}
                    >
                      {subjectIcons[subject.id]}
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1">{subject.name}</h3>
                    <p className="text-sm text-gray-500">{subject.chapterCount} Chapters</p>

                    <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>

                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
                      style={{ backgroundColor: subject.color }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Spacer */}
            <div className="h-24" />
          </ScrollView>

          {/* Class Selection Popup */}
          <AnimatePresence>
            {showClassPopup && selectedSubject && (
              <div className="fixed inset-0 z-[100]">
                {/* Backdrop */}
                <motion.div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowClassPopup(false)}
                />

                {/* Popup */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-center sm:items-center">
                  <motion.div
                    className="w-full max-w-[428px] bg-white rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Handle */}
                    <div className="flex justify-center pt-4 pb-2 bg-white shrink-0">
                      <div className="w-12 h-1.5 rounded-full bg-gray-200" />
                    </div>

                    {/* Header */}
                    <div className="px-6 pb-4 border-b border-gray-100 bg-white shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${selectedSubject.color}15`,
                              color: selectedSubject.color 
                            }}
                          >
                            {subjectIcons[selectedSubject.id]}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">{selectedSubject.name}</h3>
                            <p className="text-sm text-gray-500">Select your class</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowClassPopup(false)}
                          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Class Options */}
                    <div className="p-6 flex-1 overflow-y-auto">
                      <p className="text-sm font-medium text-gray-500 mb-4">Available Classes</p>
                      <div className="grid grid-cols-2 gap-3">
                        {CLASSES.map((classInfo) => (
                          <motion.button
                            key={classInfo.id}
                            onClick={() => handleClassSelect(classInfo.id)}
                            className="group relative bg-gray-50 hover:bg-[#1E88E5] rounded-2xl p-5 border-2 border-transparent hover:border-[#1E88E5] transition-all text-left"
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-white/20 flex items-center justify-center text-lg font-bold text-gray-700 group-hover:text-white transition-colors">
                                {classInfo.id.replace(/\D/g, "")}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-white transition-colors">
                                  {classInfo.name}
                                </p>
                                <p className="text-xs text-gray-500 group-hover:text-white/70 transition-colors">
                                  {classInfo.subjectCount} Subjects
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-white/50 transition-colors" />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 bg-white shrink-0">
                      <Button
                        variant="outline"
                        onClick={() => setShowClassPopup(false)}
                        className="w-full h-14 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </MainLayout>
    </div>
  );
}

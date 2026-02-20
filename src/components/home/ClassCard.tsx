"use client";

/**
 * ClassCard Component - Professional Design
 * 
 * Card for selecting a class with subject popup
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronRight, X, Atom, FlaskConical, Leaf, Calculator, Laptop, BookText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SUBJECTS } from "@/constants/subjects";
import { usePaperStore } from "@/stores";
import { useRouter } from "next/navigation";

const subjectIcons: Record<string, React.ReactNode> = {
  physics: <Atom className="w-6 h-6" />,
  chemistry: <FlaskConical className="w-6 h-6" />,
  biology: <Leaf className="w-6 h-6" />,
  mathematics: <Calculator className="w-6 h-6" />,
  computer: <Laptop className="w-6 h-6" />,
  english: <BookText className="w-6 h-6" />,
};

interface ClassCardProps {
  classInfo: {
    id: string;
    name: string;
    subtitle: string;
    color: string;
    subjectCount: number;
  };
}

export function ClassCard({ classInfo }: ClassCardProps) {
  const router = useRouter();
  const { setClass, setSubject } = usePaperStore();
  const [showSubjectPopup, setShowSubjectPopup] = useState(false);

  const classNumber = classInfo.id.replace(/\D/g, "");

  const handleSubjectSelect = (subjectId: string) => {
    const subject = SUBJECTS.find((s) => s.id === subjectId);
    if (subject) {
      setClass(classInfo.id as "9th" | "10th" | "11th" | "12th");
      setSubject(subject.name as "Physics" | "Chemistry" | "Biology" | "Mathematics" | "Computer" | "English");
      router.push(`/chapters/${classInfo.id}/${subjectId}`);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setShowSubjectPopup(true)}
        className={cn(
          "relative w-full bg-white rounded-2xl overflow-hidden",
          "shadow-sm hover:shadow-xl transition-all duration-300",
          "flex flex-col p-4 text-left border border-gray-100",
          "group h-[160px] justify-between"
        )}
        style={{ borderLeftWidth: "4px", borderLeftColor: classInfo.color }}
        whileTap={{ scale: 0.98 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* Class badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md mb-2"
          style={{ backgroundColor: classInfo.color }}
        >
          {classNumber}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            {classInfo.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {classInfo.subtitle}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-500">
              {classInfo.subjectCount} Subjects
            </span>
          </div>

          {/* Arrow */}
          <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#1E88E5] transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </motion.button>

      {/* Subject Selection Popup */}
      <AnimatePresence>
        {showSubjectPopup && (
          <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubjectPopup(false)}
            />

            {/* Popup */}
            <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center sm:items-center">
              <motion.div
                className="w-full max-w-[428px] glass-panel rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Handle */}
                <div className="flex justify-center pt-4 pb-2">
                  <div className="w-12 h-1.5 rounded-full bg-gray-200" />
                </div>

                {/* Header */}
                <div className="px-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold"
                        style={{ backgroundColor: classInfo.color }}
                      >
                        {classNumber}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{classInfo.name}</h3>
                        <p className="text-sm text-gray-500">Select a subject</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSubjectPopup(false)}
                      className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Subjects List */}
                <div className="p-6 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-500 mb-4">Available Subjects</p>
                  <div className="grid grid-cols-2 gap-3">
                    {SUBJECTS.map((subject) => (
                      <motion.button
                        key={subject.id}
                        onClick={() => handleSubjectSelect(subject.id)}
                        className="group relative bg-gray-50 hover:bg-gradient-to-br hover:from-[#1E88E5] hover:to-[#1565C0] rounded-2xl p-4 border-2 border-transparent hover:border-[#1E88E5] transition-all text-left"
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors"
                          style={{
                            backgroundColor: `${subject.color}20`,
                            color: subject.color
                          }}
                        >
                          {subjectIcons[subject.id]}
                        </div>
                        <p className="font-bold text-gray-900 group-hover:text-white transition-colors text-sm">
                          {subject.name}
                        </p>
                        <p className="text-xs text-gray-500 group-hover:text-white/70 transition-colors mt-1">
                          {subject.chapterCount} Chapters
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setShowSubjectPopup(false)}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 font-semibold text-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

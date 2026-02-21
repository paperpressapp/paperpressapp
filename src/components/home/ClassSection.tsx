"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CLASSES } from "@/constants/classes";
import { SUBJECTS } from "@/constants/subjects";
import { GraduationCap, ChevronRight, BookOpen } from "lucide-react";
import { usePaperStore } from "@/stores";

export function ClassSection() {
  const router = useRouter();
  const { setClass, setSubject, selectAllChapters } = usePaperStore();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showSubjects, setShowSubjects] = useState(false);

  const classColors: Record<string, string> = {
    '9th': 'from-emerald-400 to-green-500',
    '10th': 'from-[#1E88E5] to-[#1565C0]',
    '11th': 'from-amber-400 to-orange-500',
    '12th': 'from-violet-500 to-purple-600',
  };

  const handleClassClick = (classId: string) => {
    setSelectedClassId(classId);
    setShowSubjects(true);
  };

  const handleSubjectClick = (subjectId: string) => {
    if (!selectedClassId) return;
    
    setClass(selectedClassId as any);
    setSubject(subjectId as any);
    selectAllChapters([]);
    router.push(`/chapters/${selectedClassId}/${subjectId.toLowerCase()}`);
  };

  const selectedClassInfo = CLASSES.find((c) => c.id === selectedClassId);

  return (
    <section className="px-5 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center shadow-lg shadow-blue-500/30">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Select Class</h2>
          <p className="text-xs text-gray-500">Choose your class to start</p>
        </div>
      </div>

      {/* Class Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CLASSES.map((classInfo) => (
          <button
            key={classInfo.id}
            onClick={() => handleClassClick(classInfo.id)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform text-left"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${classColors[classInfo.id]} flex items-center justify-center shadow-lg mb-3`}>
              <span className="text-white font-bold text-lg">{classInfo.id}</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{classInfo.name}</p>
            <p className="text-xs text-gray-500 mt-1">{classInfo.subjectCount} subjects</p>
          </button>
        ))}
      </div>

      {/* Subject Modal */}
      <AnimatePresence>
        {showSubjects && selectedClassInfo && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowSubjects(false)} />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              <div className="p-5">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${classColors[selectedClassInfo.id]} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{selectedClassInfo.id}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedClassInfo.name}</h3>
                    <p className="text-sm text-gray-500">Select a subject</p>
                  </div>
                </div>

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
                        onClick={() => handleSubjectClick(subject.id)}
                        className="w-full flex items-center justify-between bg-gray-50 rounded-xl p-4 active:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md`}>
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{subject.name}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="h-6" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

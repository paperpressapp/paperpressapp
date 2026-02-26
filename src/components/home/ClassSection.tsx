"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ChevronRight, BookOpen, Atom, FlaskConical, Leaf, Calculator, Laptop, BookText, Microscope, X, BookMarked } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CLASSES } from "@/constants/classes";
import { SUBJECTS } from "@/constants/subjects";
import { usePaperStore } from "@/stores";

const CLASS_ICONS = {
  '9th': GraduationCap,
  '10th': BookOpen,
  '11th': Atom,
  '12th': Microscope,
};

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Leaf,
  Mathematics: Calculator,
  Computer: Laptop,
  English: BookText,
};

export function ClassSection() {
  const router = useRouter();
  const { setClass, setSubject, selectAllChapters } = usePaperStore();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showSubjects, setShowSubjects] = useState(false);

  const classColors: Record<string, string> = {
    '9th': 'from-emerald-400 to-green-600',
    '10th': 'from-blue-500 to-indigo-600',
    '11th': 'from-amber-400 to-orange-500',
    '12th': 'from-violet-500 to-purple-600',
  };

  const classGradients: Record<string, string> = {
    '9th': 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200',
    '10th': 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
    '11th': 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200',
    '12th': 'bg-gradient-to-br from-violet-50 to-purple-100 border-violet-200',
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
    <section className="px-4 py-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#2563EB] flex items-center justify-center shadow-md">
          <BookMarked className="w-4 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Select Class</h2>
          <p className="text-xs text-gray-500">Choose your class</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {CLASSES.map((classInfo, index) => {
          const Icon = CLASS_ICONS[classInfo.id as keyof typeof CLASS_ICONS] || GraduationCap;
          return (
            <motion.button
              key={classInfo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClassClick(classInfo.id)}
              className={`${classGradients[classInfo.id]} rounded-xl p-3 border shadow-sm transition-all`}
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${classColors[classInfo.id]} flex items-center justify-center shadow mb-2`}>
                <Icon className="w-4 h-5 text-white" />
              </div>
              <p className="font-bold text-gray-900 text-sm">{classInfo.name}</p>
              <p className="text-[10px] text-gray-500">{classInfo.subjectCount} Subjects</p>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showSubjects && selectedClassInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
              onClick={() => setShowSubjects(false)} 
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[65vh] overflow-hidden"
            >
              <div className="p-4">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = CLASS_ICONS[selectedClassInfo.id as keyof typeof CLASS_ICONS] || GraduationCap;
                      return (
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${classColors[selectedClassInfo.id]} flex items-center justify-center shadow`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{selectedClassInfo.name}</h3>
                      <p className="text-xs text-gray-500">Select a subject</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSubjects(false)}
                    className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                  {SUBJECTS.map((subject, index) => {
                    const colors = [
                      'from-blue-500 to-indigo-600',
                      'from-emerald-400 to-green-600',
                      'from-violet-500 to-purple-600',
                      'from-amber-400 to-orange-500',
                      'from-rose-400 to-pink-500',
                      'from-cyan-400 to-teal-500',
                    ];
                    const colorClass = colors[index % colors.length];
                    const SubjectIcon = SUBJECT_ICONS[subject.name] || BookOpen;
                    
                    return (
                      <motion.button
                        key={subject.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleSubjectClick(subject.id)}
                        className="w-full flex items-center justify-between bg-gray-50 rounded-xl p-3 active:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-sm`}>
                            <SubjectIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{subject.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
             
              <div className="h-6 pb-safe" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Calculator, Atom, FlaskConical, Leaf, Laptop, FileQuestion, FileText, Files, BookLock, CheckCircle, Zap, Search, Download, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollView } from "@/components/layout";
import { toast } from "@/hooks";
import { NOTES_DATA, getNoteTypeInfo } from "@/data/notesData";
import type { SubjectNotes, Note } from "@/data/notesData";

const CLASSES = [
  { id: '9th', label: '9th Class' },
  { id: '10th', label: '10th Class' },
];

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Laptop,
};

const NOTE_TYPE_ICONS: Record<string, React.ElementType> = {
  FileQuestion,
  FileText,
  Files,
  BookLock,
  CheckCircle,
  Zap,
};

const formatDownloads = (count: number): string => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return diffDays + ' days ago';
  if (diffDays < 30) return Math.floor(diffDays / 7) + ' weeks ago';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export default function NotesHubPage() {
  const router = useRouter();
  const [activeClass, setActiveClass] = useState('9th');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectNotes | null>(null);
  const [showNoteTypes, setShowNoteTypes] = useState(false);

  const classData = NOTES_DATA[activeClass];

  const filteredSubjects = useMemo(() => {
    if (!classData) return [];
    if (!searchQuery) return classData.subjects;
    
    return classData.subjects.filter(subject =>
      subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.notes.some(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [classData, searchQuery]);

  const handleSubjectClick = (subject: SubjectNotes) => {
    setSelectedSubject(subject);
    setShowNoteTypes(true);
  };

  const handleDownloadNote = (note: Note) => {
    toast.success('Downloading ' + note.title + '...');
  };

  const handleBack = () => {
    if (showNoteTypes) {
      setShowNoteTypes(false);
      setSelectedSubject(null);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="bg-[#0A0A0A] border-b border-[#2A2A2A] sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-[12px]"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <h1 className="font-bold text-lg text-white">Notes Hub</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <ScrollView className="flex-1 pb-24">
        <div className="px-4 pt-3">
          <p className="text-[#A0A0A0] text-sm">Download study materials for your class</p>
        </div>

        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full h-12 pl-10 pr-4 rounded-[12px] bg-[#1A1A1A] border border-[#2A2A2A] text-white placeholder-[#A0A0A0] focus:outline-none focus:border-[#B9FF66]"
            />
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setActiveClass(cls.id)}
                className={`px-4 py-2 rounded-[20px] font-medium text-sm whitespace-nowrap transition-all ${
                  activeClass === cls.id
                    ? 'bg-[#B9FF66] text-[#0A0A0A]'
                    : 'bg-[#1A] text-white border border-[#21A1AA2A2A] hover:border-[#B9FF66]/50'
                }`}
              >
                {cls.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredSubjects.map((subject) => {
              const IconComponent = SUBJECT_ICONS[subject.icon] || BookOpen;
              const totalDownloads = subject.notes.reduce((sum, note) => sum + note.downloadCount, 0);
              
              return (
                <motion.button
                  key={subject.subjectId}
                  onClick={() => handleSubjectClick(subject)}
                  className="bg-[#1A1A1A] rounded-[20px] p-4 border border-[#2A2A2A] shadow-[0px_8px_24px_rgba(0,0,0,0.4)] text-left active:scale-[0.98] transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-3"
                    style={{ backgroundColor: subject.color + '20' }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: subject.color }} />
                  </div>
                  <h3 className="font-bold text-white mb-1">{subject.subjectName}</h3>
                  <p className="text-xs text-[#A0A0A0] mb-2">{subject.chapters} Chapters</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#B9FF66]">{formatDownloads(totalDownloads)} downloads</span>
                    <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {filteredSubjects.length === 0 && (
          <div className="px-4 pt-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-[20px] bg-[#1A1A1A] flex items-center justify-center">
              <Search className="w-8 h-8 text-[#A0A0A0]" />
            </div>
            <h3 className="font-bold text-white mb-1">No notes found</h3>
            <p className="text-sm text-[#A0A0A0]">Try searching for something else</p>
          </div>
        )}

        <div className="h-8" />
      </ScrollView>

      <AnimatePresence>
        {showNoteTypes && selectedSubject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowNoteTypes(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-[20px] border-t border-[#2A2A2A] z-50 max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="w-12 h-1.5 rounded-full bg-[#2A2A2A] mx-auto mt-3" />

              <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
                <div className="flex items-center gap-3">
                  {(() => {
                    const IconComponent = SUBJECT_ICONS[selectedSubject.icon] || BookOpen;
                    return (
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                        style={{ backgroundColor: selectedSubject.color + '20' }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: selectedSubject.color }} />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="font-bold text-white">{selectedSubject.subjectName}</h2>
                    <p className="text-xs text-[#A0A0A0]">{selectedSubject.notes.length} note types available</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-[12px]"
                  onClick={() => setShowNoteTypes(false)}
                >
                  <X className="w-5 h-5 text-white" />
                </Button>
              </div>

              <ScrollView className="flex-1 p-4">
                <div className="space-y-3">
                  {selectedSubject.notes.map((note) => {
                    const noteTypeInfo = getNoteTypeInfo(note.type);
                    const NoteTypeIcon = NOTE_TYPE_ICONS[noteTypeInfo.icon] || FileText;
                    
                    return (
                      <motion.div
                        key={note.id}
                        className="bg-[#0A0A0A] rounded-[16px] p-4 border border-[#2A2A2A]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: noteTypeInfo.color + '20' }}
                          >
                            <NoteTypeIcon className="w-5 h-5" style={{ color: noteTypeInfo.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-white text-sm">{note.title}</h3>
                                <p className="text-xs text-[#A0A0A0] mt-0.5">{note.description}</p>
                              </div>
                              <Button
                                size="sm"
                                className="h-8 px-3 rounded-[20px] bg-[#B9FF66] text-[#0A0A0A] font-medium text-xs flex-shrink-0"
                                onClick={() => handleDownloadNote(note)}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-[#A0A0A0]">{note.fileSize}</span>
                              <span className="text-xs text-[#A0A0A0]">•</span>
                              <span className="text-xs text-[#B9FF66]">{formatDownloads(note.downloadCount)} downloads</span>
                              <span className="text-xs text-[#A0A0A0]">•</span>
                              <span className="text-xs text-[#A0A0A0]">{formatDate(note.lastUpdated)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollView>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

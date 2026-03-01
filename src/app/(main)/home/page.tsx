"use client";
// Force reload: 123456


import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, FileText, Crown, Clock, Users, GraduationCap,
  Plus, ChevronRight, Sparkles, Calendar, ArrowRight, Download, Share2, FileQuestion, Pencil, Library, LayoutTemplate, X
} from "lucide-react";
import { MainLayout } from "@/components/layout";
import { HomeSkeleton } from "@/components/ui/loading-skeletons";
import { Button } from "@/components/ui/button";
import { getFromLocalStorage } from "@/lib/utils/storage";
import { useAuthStore } from "@/stores/authStore";
import { usePaperStore } from "@/stores";
import { getUsageStats, checkPremiumStatus, getUserPremiumCode } from "@/lib/premium";
import { PremiumModal } from "@/components/premium/PremiumModal";
import { CreatePaperModal } from "@/components/home/CreatePaperModal";
import { SUBJECTS } from "@/constants/subjects";
import type { GeneratedPaper } from "@/types";
import { triggerHaptic } from "@/hooks";

const CLASSES = [
  { id: '9th', name: 'Class 9th', icon: GraduationCap, color: 'from-blue-500 to-blue-600' },
  { id: '10th', name: 'Class 10th', icon: BookOpen, color: 'from-emerald-500 to-emerald-600' },
  { id: '11th', name: 'Class 11th', icon: Users, color: 'from-violet-500 to-violet-600' },
  { id: '12th', name: 'Class 12th', icon: Crown, color: 'from-amber-500 to-amber-600' },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, profile } = useAuthStore();
  const { setSubject } = usePaperStore();

  const [userName, setUserName] = useState("Teacher");
  const [instituteName, setInstituteName] = useState("");
  const [recentPapers, setRecentPapers] = useState<GeneratedPaper[]>([]);
  const [usageStats, setUsageStats] = useState({ used: 0, limit: 30, isPremium: false });
  const [isLoading, setIsLoading] = useState(true);
  const [userPremiumCode, setUserPremiumCode] = useState("");
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedClassForModal, setSelectedClassForModal] = useState<string | null>(null);
  const [longPressClass, setLongPressClass] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isPremium = checkPremiumStatus().isPremium;

  const handleLongPressStart = useCallback((classId: string) => {
    triggerHaptic('light');
    longPressTimer.current = setTimeout(() => {
      triggerHaptic('medium');
      setLongPressClass(classId);
    }, 800);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    try {
      let displayName = "Teacher";
      if (isAuthenticated && profile) {
        displayName =
          profile.full_name?.split(" ")[0] ||
          user?.user_metadata?.full_name?.split(" ")[0] ||
          user?.email?.split("@")[0] ||
          "Teacher";
      } else {
        const stored = localStorage.getItem("paperpress_user_name");
        if (stored) displayName = stored.split(" ")[0];
      }
      setUserName(displayName);
      setUserPremiumCode(getUserPremiumCode());
      setInstituteName(localStorage.getItem("paperpress_user_institute") || "");

      const papers = getFromLocalStorage<GeneratedPaper[]>("paperpress_papers", []);
      setRecentPapers(
        papers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );

      const stats = getUsageStats();
      setUsageStats({
        used: stats.used === -1 ? 0 : stats.used,
        limit: stats.limit === -1 ? 30 : stats.limit,
        isPremium: stats.isPremium,
      });
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, profile]);

  if (isLoading) return <HomeSkeleton />;

  const remainingPapers = usageStats.isPremium ? 'Unlimited' : Math.max(0, usageStats.limit - usageStats.used);

  return (
    <MainLayout showBottomNav headerTitle="PaperPress" className="bg-[#0A0A0A]">
      <div className="p-3 space-y-5 max-w-[428px] mx-auto pb-24">

        {/* Top Section Bento Grid */}
        <div className="bento-grid">

          {/* Greeting & Main Stats Item (Spans Full Width in Mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-item col-span-full flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#B9FF66] tracking-tight">{getGreeting()}</p>
                <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                  {userName}
                </h1>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center shadow-inner">
                <span className="text-base font-bold text-white">{userName.charAt(0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="flex items-center gap-3 bg-[#0A0A0A]/50 rounded-lg p-3 border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-[#2A2A2A] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{recentPapers.length}</p>
                  <p className="text-xs text-[#A0A0A0] mt-1 font-medium">Papers</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#0A0A0A]/50 rounded-lg p-3 border border-white/5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${usageStats.isPremium ? 'bg-gradient-to-br from-[#B9FF66] to-[#22c55e]' : 'bg-[#2A2A2A]'}`}>
                  <Crown className={`w-4 h-4 ${usageStats.isPremium ? 'text-[#0A0A0A]' : 'text-white'}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-none">{remainingPapers}</p>
                  <p className="text-xs text-[#A0A0A0] mt-1 font-medium">{usageStats.isPremium ? 'Premium' : 'Credits'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Bento Items */}
          <div className="col-span-full grid grid-cols-3 gap-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { triggerHaptic('light'); setShowCreateModal(true); }}
              className="bento-item flex flex-col items-center justify-center gap-3 aspect-square !p-4 hover:bg-[#B9FF66]/5 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#B9FF66] flex items-center justify-center shadow-[0_4px_20px_rgba(185,255,102,0.3)] group-active:scale-95 transition-transform">
                <Plus className="w-5 h-5 text-[#0A0A0A]" strokeWidth={2.5} />
              </div>
              <p className="font-bold text-white text-sm tracking-tight text-center">Create</p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { triggerHaptic('light'); router.push("/templates"); }}
              className="bento-item flex flex-col items-center justify-center gap-3 aspect-square !p-4 group hover:bg-[#8B5CF6]/5"
            >
              <div className="w-10 h-10 rounded-full bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center group-hover:border-[#8B5CF6]/50 transition-colors">
                <LayoutTemplate className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <p className="font-semibold text-white text-sm tracking-tight text-center">Templates</p>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { triggerHaptic('light'); setShowNotesModal(true); }}
              className="bento-item flex flex-col items-center justify-center gap-3 aspect-square !p-4 group hover:bg-[#22c55e]/5"
            >
              <div className="w-10 h-10 rounded-full bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center group-hover:border-[#22c55e]/50 transition-colors">
                <Library className="w-4 h-4 text-[#22c55e]" />
              </div>
              <p className="font-semibold text-white text-sm tracking-tight text-center">Notes</p>
            </motion.button>
          </div>

          {/* Premium Banner (if applicable) inside Bento Grid */}
          {!isPremium && userPremiumCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bento-item col-span-full bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] !border-l-4 !border-l-[#B9FF66]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#B9FF66]/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#B9FF66]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white tracking-tight">Premium Code</p>
                    <p className="text-xs font-mono text-[#A0A0A0] mt-0.5">{userPremiumCode.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    navigator.clipboard.writeText(userPremiumCode);
                    const modal = document.getElementById('premium-modal-trigger');
                    modal?.click();
                  }}
                  className="px-4 py-2 bg-[#B9FF66] hover:bg-white rounded-lg text-xs font-bold text-[#0A0A0A] active:scale-95 transition-all shadow-lg shadow-[#B9FF66]/20"
                >
                  Activate
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Classes Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Select Class</h2>
            <span className="text-xs font-medium text-[#A0A0A0] bg-[#2A2A2A]/50 px-2 py-1 rounded-md">Hold for subjects</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {CLASSES.map((cls, index) => (
              <motion.button
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedClassForModal(cls.id);
                }}
                onMouseDown={() => handleLongPressStart(cls.id)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(cls.id)}
                onTouchEnd={handleLongPressEnd}
                className="glass-panel-dark rounded-lg p-4 flex flex-col gap-3 text-left hover:border-[#B9FF66]/30 hover:bg-white/[0.02] active:bg-black/20 transition-all group relative overflow-hidden"
              >
                {/* Subtle gradient wash on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${cls.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                  <cls.icon className="w-6 h-6 text-white" />
                </div>
                <div className="mt-1">
                  <p className="font-bold text-lg text-white tracking-tight leading-tight">{cls.name}</p>
                  <p className="text-xs text-[#A0A0A0] mt-0.5">Explore subjects</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Papers - Horizontal Scroll */}
        {recentPapers.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Papers</h2>
              <button
                onClick={() => router.push("/my-papers")}
                className="text-sm text-[#B9FF66] font-medium flex items-center gap-1 hover:text-white transition-colors"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
              {recentPapers.slice(0, 5).map((paper, index) => (
                <motion.button
                  key={paper.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { triggerHaptic('light'); router.push(`/paper?id=${paper.id}`); }}
                  className="snap-start flex-shrink-0 w-[240px] glass-panel-dark rounded-lg p-5 text-left hover:border-[#B9FF66]/30 hover:bg-white/[0.02] active:bg-black/20 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[130px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <span className="text-xs font-mono text-[#B9FF66] bg-[#B9FF66]/10 px-2 py-1 rounded-md">
                      {new Date(paper.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center group-hover:bg-[#B9FF66] transition-colors">
                      <ArrowRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#0A0A0A]" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="font-bold text-white text-lg truncate tracking-tight">{paper.subject}</p>
                    <p className="text-sm text-[#A0A0A0] mt-1 flex items-center gap-2">
                      <span>{paper.classId}</span>
                      <span className="w-1 h-1 rounded-full bg-[#3A3A3A]" />
                      <span>{paper.questionCount} Qs</span>
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>

      {/* Hidden trigger for premium modal */}
      <button
        id="premium-modal-trigger"
        onClick={() => setIsPremiumModalOpen(true)}
        className="hidden"
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />

      <CreatePaperModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Class Subject Selection Modal */}
      <AnimatePresence>
        {selectedClassForModal && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedClassForModal(null)} />
            <motion.div
              className="absolute bottom-0 left-0 right-0 glass-panel-dark rounded-t-[32px] max-h-[80vh] overflow-hidden border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              <div className="p-6 border-b border-[#2A2A2A]/50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white tracking-tight">Select Subject</h3>
                <button
                  onClick={() => { triggerHaptic('light'); setSelectedClassForModal(null); }}
                  className="w-10 h-10 rounded-full bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide pb-safe">
                {SUBJECTS.map((subject, index) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      triggerHaptic('medium');
                      setSubject(subject.name as any);
                      setSelectedClassForModal(null);
                      router.push(`/templates?class=${selectedClassForModal}&subject=${subject.id}`);
                    }}
                    className="w-full flex items-center gap-4 bg-[#1A1A1A] rounded-lg p-4 active:scale-98 transition-all duration-200 border border-[#2A2A2A] hover:border-[#B9FF66]/30 hover:bg-[#252525]"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                      style={{ background: `linear-gradient(135deg, ${subject.color}40, ${subject.color}10)` }}
                    >
                      <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
                    </div>
                    <span className="font-semibold text-white flex-1 text-left tracking-tight">{subject.name}</span>
                    <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {showNotesModal && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNotesModal(false)} />
            <motion.div
              className="absolute bottom-0 left-0 right-0 glass-panel-dark rounded-t-[32px] max-h-[85vh] overflow-hidden border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            >
              <div className="p-6 border-b border-[#2A2A2A]/50 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/50 backdrop-blur-md z-10">
                <h3 className="text-xl font-bold text-white tracking-tight">Browse Notes</h3>
                <button
                  onClick={() => { triggerHaptic('light'); setShowNotesModal(false); }}
                  className="w-10 h-10 rounded-full bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide pb-safe">
                <p className="text-sm text-[#A0A0A0] px-1">Select a class to view available notes</p>
                <div className="grid grid-cols-2 gap-4">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        triggerHaptic('medium');
                        setShowNotesModal(false);
                        router.push(`/notes?class=${cls.id}`);
                      }}
                      className="flex flex-col items-center justify-center gap-3 bg-[#1A1A1A] rounded-lg p-5 active:scale-95 transition-all duration-200 border border-[#2A2A2A] hover:border-[#22c55e]/30 hover:bg-[#252525]"
                    >
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cls.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-[#0A0A0A] font-bold text-xl">{cls.id}</span>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-white tracking-tight">{cls.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Long Press Quick Subject Modal */}
      <AnimatePresence>
        {longPressClass && (
          <motion.div
            className="fixed inset-0 z-[110]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setLongPressClass(null)} />
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-[28px] max-h-[70vh] overflow-hidden border-t border-[#B9FF66]/30 shadow-[0_0_40px_rgba(185,255,102,0.2)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
            >
              <div className="p-5 border-b border-[#2A2A2A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${CLASSES.find(c => c.id === longPressClass)?.color} flex items-center justify-center`}>
                      {CLASSES.find(c => c.id === longPressClass) && (
                        (() => {
                          const cls = CLASSES.find(c => c.id === longPressClass)!;
                          const Icon = cls.icon;
                          return <Icon className="w-6 h-6 text-white" />;
                        })()
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{CLASSES.find(c => c.id === longPressClass)?.name}</h3>
                      <p className="text-xs text-[#B9FF66]">Quick Subjects</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLongPressClass(null)}
                    className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
                {SUBJECTS.slice(0, 6).map((subject, index) => (
                  <motion.button
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      triggerHaptic('medium');
                      setSubject(subject.name as any);
                      setLongPressClass(null);
                      router.push(`/templates?class=${longPressClass}&subject=${subject.id}`);
                    }}
                    className="w-full flex items-center gap-4 bg-[#2A2A2A] rounded-[14px] p-4 active:scale-[0.98] transition-all hover:bg-[#3A3A3A]"
                  >
                    <div
                      className="w-11 h-11 rounded-[12px] flex items-center justify-center"
                      style={{ backgroundColor: `${subject.color}20` }}
                    >
                      <BookOpen className="w-5 h-5" style={{ color: subject.color }} />
                    </div>
                    <span className="font-semibold text-white flex-1 text-left text-base">{subject.name}</span>
                    <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

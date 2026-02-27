"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  BookOpen, FileText, Crown, Clock, Users, GraduationCap,
  Plus, ChevronRight, Sparkles, Calendar, ArrowRight
} from "lucide-react";
import { MainLayout } from "@/components/layout";
import { AppLoader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { getFromLocalStorage } from "@/lib/utils/storage";
import { useAuthStore } from "@/stores/authStore";
import { usePaperStore } from "@/stores";
import { getUsageStats, checkPremiumStatus, getUserPremiumCode, generatePremiumCode } from "@/lib/premium";
import { PremiumModal } from "@/components/premium/PremiumModal";
import type { GeneratedPaper } from "@/types";

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
  const isPremium = checkPremiumStatus().isPremium;

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

  if (isLoading) return <AppLoader message="Loading..." />;

  const recentPaper = recentPapers[0] || null;
  const remainingPapers = usageStats.isPremium ? 'Unlimited' : Math.max(0, usageStats.limit - usageStats.used);

  return (
    <MainLayout showBottomNav headerTitle="PaperPress" className="bg-[#0A0A0A]">
      <div className="p-4 space-y-4">
        {/* Greeting Section */}
        <div className="bg-[#1A1A1A] rounded-[20px] p-5 shadow-[0px_8px_24px_rgba(0,0,0,0.4)] border border-[#2A2A2A]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#A0A0A0] mb-1">{getGreeting()}</p>
                <h1 className="text-2xl font-bold text-white leading-tight">
                  {userName}
                </h1>
                {instituteName && (
                  <p className="text-xs text-[#A0A0A0] mt-1">{instituteName}</p>
                )}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#2A2A2A] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#B9FF66]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{recentPapers.length}</p>
                  <p className="text-xs text-[#A0A0A0]">Papers Created</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${usageStats.isPremium ? 'bg-[#B9FF66]' : 'bg-[#2A2A2A]'}`}>
                  <Crown className={`w-4 h-4 ${usageStats.isPremium ? 'text-[#0A0A0A]' : 'text-[#B9FF66]'}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{remainingPapers}</p>
                  <p className="text-xs text-[#A0A0A0]">{usageStats.isPremium ? 'Premium' : 'Free Credits'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Banner - Only show for non-premium users with a code */}
          {!isPremium && userPremiumCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A1A1A] rounded-[20px] p-4 border border-[#2A2A2A] shadow-[0px_8px_24px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#B9FF66] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#0A0A0A]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">Your Personal Premium Code</p>
                    <p className="text-xs text-[#A0A0A0]">{userPremiumCode.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userPremiumCode);
                    const modal = document.getElementById('premium-modal-trigger');
                    modal?.click();
                  }}
                  className="px-4 py-2 bg-[#B9FF66] hover:brightness-110 rounded-[40px] text-xs font-semibold text-[#0A0A0A] transition-all"
                >
                  Activate
                </button>
              </div>
            </motion.div>
          )}

          {/* Premium Badge - Show for premium users */}
          {isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#B9FF66] to-[#22c55e] rounded-[20px] p-4 text-[#0A0A0A] shadow-[0px_8px_24px_rgba(185,255,102,0.3)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#0A0A0A]/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[#0A0A0A]" />
                </div>
                <div>
                  <p className="font-bold text-sm">Premium Active</p>
                  <p className="text-xs text-[#0A0A0A]/70">Unlimited papers and features</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Create Paper Button */}
          <Button
            onClick={() => router.push("/subjects")}
            className="w-full h-14 rounded-[40px] bg-[#B9FF66] text-[#0A0A0A] font-semibold text-base shadow-[0px_8px_24px_rgba(185,255,102,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Paper
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Classes Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white">Select Class</h2>
              <span className="text-xs text-[#A0A0A0]">Choose your class</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {CLASSES.map((cls, index) => (
                <motion.button
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSubject(cls.name.replace('Class ', '') as any);
                    router.push(`/subjects`);
                  }}
                  className="bg-[#1A1A1A] rounded-[20px] p-4 shadow-[0px_8px_24px_rgba(0,0,0,0.4)] border border-[#2A2A2A] text-left hover:shadow-[0px_12px_32px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <div className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${cls.color} flex items-center justify-center mb-3`}>
                    <cls.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-base text-white">{cls.name}</p>
                  <p className="text-xs text-[#A0A0A0]">Board Exam</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Last Paper Card */}
          {recentPaper && (
            <div className="bg-[#1A1A1A] rounded-[20px] p-4 shadow-[0px_8px_24px_rgba(0,0,0,0.4)] border border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base text-white">Recent Paper</h3>
                <span className="text-xs text-[#A0A0A0]">{new Date(recentPaper.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-white">{recentPaper.title}</p>
                  <p className="text-xs text-[#A0A0A0]">{recentPaper.subject} - {recentPaper.classId}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-[#B9FF66] font-medium">{recentPaper.totalMarks} Marks</span>
                    <span className="text-xs text-[#A0A0A0]">-</span>
                    <span className="text-xs text-[#A0A0A0]">{recentPaper.questionCount} Questions</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Footer */}
          <div className="bg-[#1A1A1A] rounded-[20px] p-4 border border-[#2A2A2A] shadow-[0px_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#B9FF66] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0A0A0A]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">AI-Powered Papers</p>
                <p className="text-xs text-[#A0A0A0]">Generate exam papers in seconds</p>
              </div>
            </div>
          </div>
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
    </MainLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HomeHeader, HeroSection, RecentPapers, ClassSection } from "@/components/home";
import { MainLayout, ScrollView } from "@/components/layout";
import { AppLoader } from "@/components/shared";
import { getFromLocalStorage } from "@/lib/utils/storage";
import { useAuthStore } from "@/stores/authStore";
import type { GeneratedPaper } from "@/types";

export default function HomePage() {
  const { isAuthenticated, user, profile } = useAuthStore();
  const [userName, setUserName] = useState("User");
  const [recentPapers, setRecentPapers] = useState<GeneratedPaper[]>([]);
  const [papersThisMonth, setPapersThisMonth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        let displayName = "User";

        if (isAuthenticated && profile) {
          displayName = profile.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
        } else {
          const storedName = localStorage.getItem("paperpress_user_name");
          if (storedName) displayName = storedName.split(" ")[0];
        }

        setUserName(displayName);

        const papers = getFromLocalStorage<GeneratedPaper[]>("paperpress_papers", []);
        setRecentPapers(papers);

        const now = new Date();
        const thisMonthPapers = papers.filter((paper: GeneratedPaper) => {
          const paperDate = new Date(paper.createdAt);
          return paperDate.getMonth() === now.getMonth() && paperDate.getFullYear() === now.getFullYear();
        });
        setPapersThisMonth(thisMonthPapers.length);
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user, profile]);

  if (isLoading) return <AppLoader message="Loading..." />;

  return (
    <MainLayout showBottomNav className="bg-gray-50">
      <HomeHeader />

      <ScrollView className="pt-[56px] flex-1">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <HeroSection userName={userName} totalPapers={recentPapers.length} papersThisMonth={papersThisMonth} />
        </motion.div>

        <div className="bg-gray-50 min-h-[500px] mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
            <RecentPapers papers={recentPapers} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
            <ClassSection />
          </motion.div>

          <div className="h-32" />
        </div>
      </ScrollView>
    </MainLayout>
  );
}

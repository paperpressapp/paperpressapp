"use client";

import { useEffect, useState } from "react";
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
        // Error loading data
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user, profile]);

  if (isLoading) return <AppLoader message="Loading..." />;

  return (
    <MainLayout showBottomNav className="bg-gray-50" topSafe={false}>
      <HomeHeader />

      <ScrollView className="flex-1">
          <div>
            <HeroSection userName={userName} totalPapers={recentPapers.length} papersThisMonth={papersThisMonth} />
          </div>

        <div className="bg-gray-50 mt-2">
          <div>
            <RecentPapers papers={recentPapers} />
          </div>

          <div>
            <ClassSection />
          </div>

          <div className="h-20" />
        </div>
      </ScrollView>
    </MainLayout>
  );
}

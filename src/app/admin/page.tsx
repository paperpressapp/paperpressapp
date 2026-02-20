"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, FileText, CreditCard, BarChart3, 
  PlusCircle, Settings, ArrowLeft, Crown,
  TrendingUp, Clock, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { AppLoader } from "@/components/shared";
import { supabase } from "@/lib/supabase/client";

interface AdminStats {
  total_users: number;
  premium_users: number;
  total_papers: number;
  papers_this_month: number;
  total_questions: number;
  active_codes: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, isAdmin, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/home");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;
      
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.rpc as any)('get_admin_stats');
        
        if (error) {
          console.error('Error fetching stats:', error);
          return;
        }
        
        setStats(data as AdminStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (authLoading || isLoading) {
    return <AppLoader message="Loading admin panel..." />;
  }

  if (!isAdmin) {
    return null;
  }

  const statCards = [
    { 
      label: "Total Users", 
      value: stats?.total_users || 0, 
      icon: Users, 
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      label: "Premium Users", 
      value: stats?.premium_users || 0, 
      icon: Crown, 
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
    { 
      label: "Total Papers", 
      value: stats?.total_papers || 0, 
      icon: FileText, 
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    { 
      label: "This Month", 
      value: stats?.papers_this_month || 0, 
      icon: TrendingUp, 
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    { 
      label: "Questions", 
      value: stats?.total_questions || 0, 
      icon: CheckCircle, 
      color: "bg-teal-500",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600"
    },
    { 
      label: "Active Codes", 
      value: stats?.active_codes || 0, 
      icon: CreditCard, 
      color: "bg-rose-500",
      bgColor: "bg-rose-50",
      textColor: "text-rose-600"
    },
  ];

  const menuItems = [
    { label: "Questions", icon: PlusCircle, href: "/admin/questions", description: "Add and manage questions" },
    { label: "Users", icon: Users, href: "/admin/users", description: "Manage user accounts" },
    { label: "Premium Codes", icon: CreditCard, href: "/admin/codes", description: "Generate premium codes" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics", description: "View detailed analytics" },
    { label: "Settings", icon: Settings, href: "/admin/settings", description: "App configuration" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => router.push("/home")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-white/70 text-sm">Welcome, {profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => router.push(item.href)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#1E88E5]/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1E88E5]/10 flex items-center justify-center group-hover:bg-[#1E88E5]/20 transition-colors">
                    <item.icon className="w-6 h-6 text-[#1E88E5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#1E88E5] transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-[#1E88E5]">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {[
              { action: "New user registered", time: "2 minutes ago", icon: Users },
              { action: "Paper generated by user@test.com", time: "15 minutes ago", icon: FileText },
              { action: "Premium code redeemed", time: "1 hour ago", icon: CreditCard },
              { action: "Question added to Physics", time: "3 hours ago", icon: PlusCircle },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <activity.icon className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

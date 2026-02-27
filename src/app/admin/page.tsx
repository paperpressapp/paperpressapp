"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, FileText, CreditCard, BarChart3, 
  PlusCircle, Settings, ArrowLeft, Crown,
  TrendingUp, Clock, CheckCircle, Shield,
  Lock, Mail, Eye, EyeOff, RefreshCw, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks";
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
      fetchStats();
      fetchRecentActivity();
      
      // Real-time subscription for stats
      const channel = supabase
        .channel('admin_stats_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          fetchStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'papers' }, () => {
          fetchStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'premium_codes' }, () => {
          fetchStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get premium users
      const { count: premiumUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'premium');

      // Get total papers
      const { count: totalPapers } = await supabase
        .from('papers')
        .select('*', { count: 'exact', head: true });

      // Get this month's papers
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: papersThisMonth } = await supabase
        .from('papers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Get active codes
      const { count: activeCodes } = await supabase
        .from('premium_codes')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .is('used_by', null);

      setStats({
        total_users: totalUsers || 0,
        premium_users: premiumUsers || 0,
        total_papers: totalPapers || 0,
        papers_this_month: papersThisMonth || 0,
        total_questions: 0, // Questions managed separately
        active_codes: activeCodes || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Get recent papers
      const { data: recentPapers } = await supabase
        .from('papers')
        .select('id, created_at, subject, class_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentPapers) {
        const activities = recentPapers.map(p => ({
          action: `Paper generated: ${p.subject}`,
          time: new Date(p.created_at).toLocaleString(),
          icon: FileText,
          type: 'paper'
        }));
        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
        toast.success("Welcome Admin!");
        fetchStats();
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    } catch {
      toast.error("Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    toast.success("Logged out successfully");
  };

  if (isAuthenticated === null) {
    return <AppLoader message="Loading..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#111827]">Admin Panel</h1>
            <p className="text-sm text-[#6B7280]">Enter your credentials to access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <Input
                  type="email"
                  placeholder="admin@paperpress.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-[#E5E7EB]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl border-[#E5E7EB]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0]">
              {isLoading ? "Verifying..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
            <p className="text-xs text-center text-[#9CA3AF]">
              PaperPress Admin System
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return <AppLoader message="Loading admin panel..." />;
  }

  const statCards = [
    { 
      label: "Total Users", 
      value: stats?.total_users || 0, 
      icon: Users, 
      color: "bg-[#1E88E5]",
      bgColor: "bg-blue-50",
      textColor: "text-[#1E88E5]"
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
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    { 
      label: "This Month", 
      value: stats?.papers_this_month || 0, 
      icon: TrendingUp, 
      color: "bg-violet-500",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600"
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
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] text-white">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10 rounded-xl"
                onClick={() => router.push("/home")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-white/70 text-sm flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Real-time sync active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-9 rounded-lg"
                onClick={fetchStats}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-9 rounded-lg"
                onClick={handleLogout}
              >
                Logout
              </Button>
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-[#E5E7EB]"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
              <p className="text-xs text-[#6B7280] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => router.push(item.href)}
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] text-left hover:shadow-md hover:border-[#1E88E5]/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-[#1E88E5]/10 transition-colors">
                    <item.icon className="w-6 h-6 text-[#1E88E5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#111827] group-hover:text-[#1E88E5] transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-sm text-[#6B7280] mt-1">{item.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111827]">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-[#1E88E5] h-8 rounded-lg">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 py-3 border-b border-[#E5E7EB] last:border-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <activity.icon className="w-5 h-5 text-[#1E88E5]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#111827]">{activity.action}</p>
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#9CA3AF]">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

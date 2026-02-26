"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, FileText, CreditCard, BarChart3, 
  PlusCircle, Settings, ArrowLeft, Crown,
  TrendingUp, Clock, CheckCircle, Shield,
  Lock, Mail, Eye, EyeOff
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

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
      fetchStats();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await (supabase.rpc as any)('get_admin_stats');
      if (error) {
        console.error('Error fetching stats:', error);
        setStats({
          total_users: 0,
          premium_users: 0,
          total_papers: 0,
          papers_this_month: 0,
          total_questions: 0,
          active_codes: 0
        });
        return;
      }
      setStats(data as AdminStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        total_users: 0,
        premium_users: 0,
        total_papers: 0,
        papers_this_month: 0,
        total_questions: 0,
        active_codes: 0
      });
    } finally {
      setStatsLoading(false);
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
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
            <p className="text-gray-500 text-sm">Enter your credentials to access</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="admin@paperpress.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-center text-gray-400">
                PaperPress Admin System
              </p>
            </div>
          </CardContent>
        </Card>
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
                <p className="text-white/70 text-sm">Welcome, Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, ArrowLeft, Crown, Trash2, Search,
  MoreVertical, Shield, Ban, CheckCircle, XCircle,
  Mail, Calendar, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks";
import { AppLoader } from "@/components/shared";
import { supabase } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  is_premium: boolean;
  premium_code: string | null;
  premium_activated_at: string | null;
  paper_count: number;
  is_restricted: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
      return;
    }
    fetchUsers();
  }, [router]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(u => 
          u.email?.toLowerCase().includes(query) || 
          u.full_name?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithStats = await Promise.all(
        (data || []).map(async (user) => {
          const { count: paperCount } = await supabase
            .from('papers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return {
            ...user,
            paper_count: paperCount || 0,
            is_restricted: user.is_restricted || false
          } as User;
        })
      );

      setUsers(usersWithStats);
      setFilteredUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      setUsers(users.filter(u => u.id !== userId));
      setFilteredUsers(filteredUsers.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
      toast.success("User deleted successfully");
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
    }
  };

  const handleTogglePremium = async (user: User) => {
    try {
      const newPremiumStatus = !user.is_premium;
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_premium: newPremiumStatus,
          premium_activated_at: newPremiumStatus ? new Date().toISOString() : null
        })
        .eq('id', user.id);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, is_premium: newPremiumStatus, premium_activated_at: newPremiumStatus ? new Date().toISOString() : null }
          : u
      ));
      toast.success(newPremiumStatus ? "Premium enabled" : "Premium disabled");
    } catch (error) {
      console.error('Error toggling premium:', error);
      toast.error("Failed to update premium status");
    }
  };

  const handleToggleRestriction = async (user: User) => {
    try {
      const newRestrictedStatus = !user.is_restricted;
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_restricted: newRestrictedStatus })
        .eq('id', user.id);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === user.id ? { ...u, is_restricted: newRestrictedStatus } : u
      ));
      toast.success(newRestrictedStatus ? "User restricted" : "User unrestricted");
    } catch (error) {
      console.error('Error toggling restriction:', error);
      toast.error("Failed to update restriction");
    }
  };

  if (isLoading) {
    return <AppLoader message="Loading users..." />;
  }

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
                onClick={() => router.push("/admin")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-white/70 text-sm">{users.length} total users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white font-bold">
                    {(user.full_name || user.email)?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {user.full_name || 'No name'}
                      </h3>
                      {user.is_premium && (
                        <Crown className="w-4 h-4 text-amber-500" />
                      )}
                      {user.is_restricted && (
                        <Ban className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {user.paper_count} papers
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {user.premium_code && (
                      <p className="text-xs text-amber-600 mt-1">
                        Code: {user.premium_code}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={user.is_premium ? "outline" : "default"}
                    size="sm"
                    className={user.is_premium ? "text-amber-600 border-amber-200" : ""}
                    onClick={() => handleTogglePremium(user)}
                  >
                    {user.is_premium ? "Remove Premium" : "Add Premium"}
                  </Button>
                  <Button
                    variant={user.is_restricted ? "outline" : "ghost"}
                    size="sm"
                    className={user.is_restricted ? "text-red-600 border-red-200" : ""}
                    onClick={() => handleToggleRestriction(user)}
                  >
                    {user.is_restricted ? "Unrestrict" : "Restrict"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => setShowDeleteConfirm(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {showDeleteConfirm === user.id && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-sm text-red-700 mb-3">
                    Are you sure you want to delete this user? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Yes, Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

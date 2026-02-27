"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, ArrowLeft, Crown, Trash2, Search,
  Shield, Ban, RefreshCw, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks";
import { AppLoader } from "@/components/shared";
import { supabase } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: string;
  paper_count: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [togglingUser, setTogglingUser] = useState<string | null>(null);

  // Real-time subscription
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
      return;
    }
    setIsAuthenticated(true);
    fetchUsers();

    const channel = supabase
      .channel('admin_users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const fetchUsers = useCallback(async () => {
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
          };
        })
      );

      setUsers(usersWithStats as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePremium = async (userId: string, currentRole: string) => {
    setTogglingUser(userId);
    try {
      const newRole = currentRole === 'premium' ? 'user' : 'premium';
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      toast.success(newRole === 'premium' ? 'User is now premium!' : 'Premium removed');
    } catch (error) {
      console.error('Error toggling premium:', error);
      toast.error('Failed to update user');
    } finally {
      setTogglingUser(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
      toast.success("User deleted");
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  if (isLoading || isAuthenticated === null) {
    return <AppLoader message="Loading users..." />;
  }

  if (!isAuthenticated) return null;

  const stats = {
    total: users.length,
    premium: users.filter(u => u.role === 'premium').length,
    free: users.filter(u => u.role !== 'premium').length,
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin")}
                className="h-10 w-10 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-[#111827]">Users</h1>
                <p className="text-xs text-[#6B7280] flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Real-time sync
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchUsers}
              className="h-10 w-10 rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1E88E5]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{stats.total}</p>
                <p className="text-xs text-[#6B7280]">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{stats.premium}</p>
                <p className="text-xs text-[#6B7280]">Premium</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{stats.free}</p>
                <p className="text-xs text-[#6B7280]">Free Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-[#E5E7EB]"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">Papers</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280]">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white font-bold">
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#111827]">{user.full_name || 'No name'}</p>
                          <p className="text-xs text-[#6B7280]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-[#111827]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-[#1E88E5] text-sm font-medium">
                        {user.paper_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.role === 'premium' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          Premium
                        </span>
                      ) : user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePremium(user.id, user.role)}
                          disabled={togglingUser === user.id || user.role === 'admin'}
                          className="h-8 w-8 rounded-lg"
                        >
                          {togglingUser === user.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : user.role === 'premium' ? (
                            <Crown className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Crown className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUser(user.id)}
                          disabled={user.role === 'admin'}
                          className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
              <p className="text-[#6B7280]">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

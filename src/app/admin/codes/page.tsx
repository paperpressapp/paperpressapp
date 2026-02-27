"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, Copy, Check, CreditCard, 
  Clock, Crown, Users, Trash2, X, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLoader } from "@/components/shared";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks";

interface PremiumCode {
  id: string;
  code: string;
  code_type: 'monthly' | 'yearly' | 'lifetime';
  duration_days: number;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  is_active: boolean;
  profiles?: { full_name: string | null; email: string | null } | null;
}

export default function AdminCodesPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [codes, setCodes] = useState<PremiumCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Real-time subscription
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
      return;
    }
    setIsAuthenticated(true);
    fetchCodes();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('premium_codes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'premium_codes' }, (payload) => {
        console.log('Real-time update:', payload);
        fetchCodes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const fetchCodes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('premium_codes')
        .select(`
          *,
          profiles:used_by (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching codes:', error);
        return;
      }

      setCodes((data as PremiumCode[]) || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PP';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createCodes = async (type: 'monthly' | 'yearly' | 'lifetime', count: number) => {
    setIsGenerating(true);
    const durationDays = type === 'monthly' ? 30 : type === 'yearly' ? 365 : 999999;
    const newCodes = [];

    for (let i = 0; i < count; i++) {
      newCodes.push({
        code: generateCode(),
        code_type: type,
        duration_days: durationDays,
        created_by: 'admin',
        is_active: true,
      });
    }

    try {
      const { error } = await supabase
        .from('premium_codes')
        .insert(newCodes);

      if (error) throw error;

      toast.success(`Created ${count} ${type} codes!`);
      fetchCodes();
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Error creating codes:', error);
      toast.error("Failed to create codes");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!confirm("Delete this code?")) return;

    try {
      const { error } = await supabase
        .from('premium_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      setCodes(codes.filter(c => c.id !== codeId));
      toast.success("Code deleted");
    } catch (error) {
      console.error('Error deleting code:', error);
      toast.error("Failed to delete code");
    }
  };

  if (isLoading || isAuthenticated === null) {
    return <AppLoader message="Loading codes..." />;
  }

  if (!isAuthenticated) return null;

  const stats = {
    total: codes.length,
    unused: codes.filter(c => !c.used_by).length,
    used: codes.filter(c => c.used_by).length,
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4">
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
                <h1 className="text-lg font-bold text-[#111827]">Premium Codes</h1>
                <p className="text-xs text-[#6B7280]">Real-time sync active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchCodes}
                className="h-10 w-10 rounded-xl"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowGenerateModal(true)}
                className="h-10 rounded-xl bg-gradient-to-r from-[#1E88E5] to-[#1565C0]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#1E88E5]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{stats.total}</p>
                <p className="text-xs text-[#6B7280]">Total Codes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Crown className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{stats.unused}</p>
                <p className="text-xs text-[#6B7280]">Available</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{stats.used}</p>
                <p className="text-xs text-[#6B7280]">Redeemed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Codes List */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="divide-y divide-gray-100">
            {codes.map((code, index) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`p-4 flex items-center justify-between ${code.used_by ? 'bg-gray-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    code.code_type === 'lifetime' ? 'bg-amber-100 text-amber-600' :
                    code.code_type === 'yearly' ? 'bg-blue-100 text-blue-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#111827]">{code.code}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        code.code_type === 'lifetime' ? 'bg-amber-100 text-amber-700' :
                        code.code_type === 'yearly' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {code.code_type}
                      </span>
                    </div>
                    {code.used_by ? (
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Used by {code.profiles?.full_name || code.profiles?.email || 'Unknown'}
                      </p>
                    ) : (
                      <p className="text-xs text-[#9CA3AF] mt-0.5">Not yet used</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!code.used_by && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyCode(code.code, code.id)}
                        className="h-8 w-8 rounded-lg"
                      >
                        {copiedId === code.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#6B7280]" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCode(code.id)}
                        className="h-8 w-8 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {code.used_at && (
                    <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                      <Clock className="w-3 h-3" />
                      {new Date(code.used_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {codes.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
              <p className="text-[#6B7280]">No codes yet</p>
              <Button
                onClick={() => setShowGenerateModal(true)}
                variant="outline"
                className="mt-4 rounded-xl"
              >
                Generate Your First Code
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isGenerating && setShowGenerateModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-md p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111827]">Generate Premium Codes</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={isGenerating}
                  className="h-8 w-8 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => !isGenerating && createCodes('monthly', 1)}
                  disabled={isGenerating}
                  className="w-full p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-[#1E88E5] hover:bg-blue-50/50 transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827]">Monthly Code</p>
                      <p className="text-sm text-[#6B7280]">30 days premium access</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => !isGenerating && createCodes('yearly', 1)}
                  disabled={isGenerating}
                  className="w-full p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-[#1E88E5] hover:bg-blue-50/50 transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827]">Yearly Code</p>
                      <p className="text-sm text-[#6B7280]">365 days premium access</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => !isGenerating && createCodes('lifetime', 1)}
                  disabled={isGenerating}
                  className="w-full p-4 rounded-xl border-2 border-[#E5E7EB] hover:border-[#1E88E5] hover:bg-blue-50/50 transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827]">Lifetime Code</p>
                      <p className="text-sm text-[#6B7280]">Unlimited premium access</p>
                    </div>
                  </div>
                </button>

                <div className="pt-4 border-t border-[#E5E7EB]">
                  <p className="text-sm text-[#6B7280] mb-3">Bulk generate:</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl h-10"
                      onClick={() => !isGenerating && createCodes('monthly', 10)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? '...' : '10 Monthly'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl h-10"
                      onClick={() => !isGenerating && createCodes('yearly', 5)}
                      disabled={isGenerating}
                    >
                      {isGenerating ? '...' : '5 Yearly'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

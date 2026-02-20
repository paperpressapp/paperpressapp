"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Plus, Copy, Check, CreditCard, 
  Clock, Crown, Users, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
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
  const { isAdmin, profile, isLoading: authLoading } = useAuthStore();
  const { toast } = useToast();
  
  const [codes, setCodes] = useState<PremiumCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/home");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchCodes();
    }
  }, [isAdmin]);

  const fetchCodes = async () => {
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
  };

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
    if (!profile?.id) return;

    const durationDays = type === 'monthly' ? 30 : type === 'yearly' ? 365 : 999999;
    const newCodes = [];

    for (let i = 0; i < count; i++) {
      newCodes.push({
        code: generateCode(),
        code_type: type,
        duration_days: durationDays,
        created_by: profile.id,
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

  if (authLoading || isLoading) {
    return <AppLoader message="Loading codes..." />;
  }

  if (!isAdmin) return null;

  const stats = {
    total: codes.length,
    unused: codes.filter(c => !c.used_by).length,
    used: codes.filter(c => c.used_by).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/admin")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Premium Codes</h1>
                <p className="text-sm text-gray-500">Generate and manage codes</p>
              </div>
            </div>
            <Button
              onClick={() => setShowGenerateModal(true)}
              className="bg-[#1E88E5] hover:bg-[#1565C0]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Codes
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Codes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Crown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.unused}</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.used}</p>
                <p className="text-xs text-gray-500">Redeemed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Codes List */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {codes.map((code, index) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`p-4 flex items-center justify-between ${code.used_by ? 'bg-gray-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    code.code_type === 'lifetime' ? 'bg-amber-100 text-amber-600' :
                    code.code_type === 'yearly' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">{code.code}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        code.code_type === 'lifetime' ? 'bg-amber-100 text-amber-700' :
                        code.code_type === 'yearly' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {code.code_type}
                      </span>
                    </div>
                    {code.used_by ? (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Used by {code.profiles?.full_name || code.profiles?.email || 'Unknown'}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Not yet used</p>
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
                        className="h-8 w-8"
                      >
                        {copiedId === code.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCode(code.id)}
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {code.used_at && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
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
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No codes yet</p>
              <Button
                onClick={() => setShowGenerateModal(true)}
                variant="outline"
                className="mt-4"
              >
                Generate Your First Code
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowGenerateModal(false)}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Generate Premium Codes</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => createCodes('monthly', 1)}
                className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Monthly Code</p>
                    <p className="text-sm text-gray-500">30 days premium access</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => createCodes('yearly', 1)}
                className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Yearly Code</p>
                    <p className="text-sm text-gray-500">365 days premium access</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => createCodes('lifetime', 1)}
                className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Lifetime Code</p>
                    <p className="text-sm text-gray-500">Unlimited premium access</p>
                  </div>
                </div>
              </button>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">Bulk generate:</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => createCodes('monthly', 10)}
                  >
                    10 Monthly
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => createCodes('yearly', 5)}
                  >
                    5 Yearly
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowGenerateModal(false)}
            >
              Cancel
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

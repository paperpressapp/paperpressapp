"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePaperStore } from "@/stores";

export default function CreatePaperPage() {
  const router = useRouter();
  const { setStep } = usePaperStore();

  useEffect(() => {
    // Redirect to templates page (Step 1)
    setStep('templates');
    router.replace('/create-paper/templates');
  }, [router, setStep]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#B9FF66]/30 border-t-[#B9FF66] rounded-full animate-spin" />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Layers, FileText, Check, Plus, Pencil, Sparkles } from "lucide-react";
import { ScrollView, MainLayout } from "@/components/layout";
import { Breadcrumb, AppLoader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { usePaperStore } from "@/stores";
import { CLASS_IDS } from "@/constants/classes";
import { SUBJECT_NAMES } from "@/constants/subjects";
import { TemplateSelector } from "@/components/paper/TemplateSelector";
import { TemplateBuilder } from "@/components/paper/TemplateBuilder";
import { getTemplateById } from "@/lib/template-store";
import { triggerHaptic } from "@/hooks";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const breadcrumbSteps = [
  { label: "Class", status: "completed" as const },
  { label: "Subject", status: "completed" as const },
  { label: "Template", status: "current" as const },
  { label: "Chapter", status: "pending" as const },
  { label: "Questions", status: "pending" as const },
];

export default function SelectTemplateClient() {
  const router = useRouter();
  const params = useParams();
  const {
    selectedClass,
    selectedSubject,
    selectedTemplateId,
    setClass,
    setSubject,
    applyTemplate,
  } = usePaperStore();

  const classId = params.classId as string;
  const subjectId = params.subjectId as string;
  const subjectName = capitalize(subjectId);

  const [isValidating, setIsValidating] = useState(true);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [localSelectedTemplate, setLocalSelectedTemplate] = useState<string | null>(selectedTemplateId);

  useEffect(() => {
    const validateAndLoad = async () => {
      if (!CLASS_IDS.includes(classId as any)) {
        router.replace("/home");
        return;
      }

      if (!SUBJECT_NAMES.includes(subjectName as any)) {
        router.replace("/home");
        return;
      }

      if (selectedClass !== classId) {
        setClass(classId as "9th" | "10th" | "11th" | "12th");
      }
      if (selectedSubject !== subjectName) {
        setSubject(subjectName as "Physics" | "Chemistry" | "Biology" | "Mathematics" | "Computer" | "English");
      }

      setLocalSelectedTemplate(selectedTemplateId);
      setIsValidating(false);
    };

    validateAndLoad();
  }, [classId, subjectName, selectedClass, selectedSubject, selectedTemplateId, router, setClass, setSubject]);

  const handleContinue = useCallback(() => {
    if (localSelectedTemplate) {
      const template = getTemplateById(localSelectedTemplate, classId, subjectName);
      if (template) {
        applyTemplate(template);
        triggerHaptic('medium');
        router.push(`/chapters/${classId}/${subjectId}`);
      }
    }
  }, [localSelectedTemplate, classId, subjectId, subjectName, router, applyTemplate]);

  const handleBack = useCallback(() => {
    router.push(`/subjects?class=${classId}`);
  }, [router, classId]);

  const handleSkip = useCallback(() => {
    triggerHaptic('light');
    router.push(`/chapters/${classId}/${subjectId}`);
  }, [classId, subjectId, router]);

  if (isValidating) return <AppLoader message="Loading..." />;

  return (
    <MainLayout showBottomNav={false}>
      <ScrollView className="flex-1 pb-28">
        <div className="mx-auto max-w-[428px]">
          {/* Header */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={handleBack}
                className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">Select Template</h1>
                <p className="text-xs text-[#9CA3AF]">{selectedClass} • {selectedSubject}</p>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs">
              {breadcrumbSteps.map((step, idx) => (
                <span key={idx} className="flex items-center">
                  <span className={step.status === "completed" ? "text-[#B9FF66]" : step.status === "current" ? "text-white" : "text-[#6B7280]"}>{step.label}</span>
                  {idx < breadcrumbSteps.length - 1 && <span className="text-[#6B7280] mx-1">/</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="px-4 py-2">
            <div className="bg-[#1A1A1A] rounded-[16px] border border-[#2A2A2A] p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#B9FF66]/10 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-5 h-5 text-[#B9FF66]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Choose a Template</h3>
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Templates define question structure and marks distribution. You can customize later.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="px-4 py-4">
            <TemplateSelector
              classId={selectedClass || classId}
              subject={selectedSubject || subjectName}
              selectedTemplateId={localSelectedTemplate}
              onSelectTemplate={(id) => {
                setLocalSelectedTemplate(id);
                triggerHaptic('light');
              }}
            />
          </div>

          {/* Create Custom Template */}
          <div className="px-4 py-2">
            <button
              onClick={() => setShowTemplateBuilder(true)}
              className="w-full bg-[#1A1A1A] rounded-[16px] border border-[#2A2A2A] p-4 flex items-center gap-3 hover:border-[#B9FF66]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#22c55e]/10 flex items-center justify-center">
                <Pencil className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-white text-sm">Create Custom Template</p>
                <p className="text-xs text-[#9CA3AF]">Build your own question pattern</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>

          {/* Skip Option */}
          <div className="px-4 py-4">
            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-[#6B7280] hover:text-white transition-colors"
            >
              Skip template selection
            </button>
          </div>
        </div>
      </ScrollView>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2A2A2A] p-4 pb-6 shadow-[0px_-8px_24px_rgba(0,0,0,0.4)]">
        <div className="mx-auto max-w-[428px]">
          <Button
            onClick={handleContinue}
            disabled={!localSelectedTemplate}
            className="w-full h-14 rounded-lg bg-gradient-to-r from-[#B9FF66] to-[#22c55e] text-[#0A0A0A] font-semibold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            Continue to Chapters
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Template Builder Modal */}
      {showTemplateBuilder && (
        <TemplateBuilder
          classId={classId}
          subject={subjectName}
          onSave={(template) => {
            setLocalSelectedTemplate(template.id);
            setShowTemplateBuilder(false);
          }}
          onCancel={() => setShowTemplateBuilder(false)}
        />
      )}
    </MainLayout>
  );
}

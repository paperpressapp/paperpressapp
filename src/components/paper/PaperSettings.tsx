"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, ChevronDown, ImagePlus, X, Building2, Crown, Lock, ClipboardList, MapPin, Mail, Phone, Globe, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TIME_OPTIONS } from "@/constants/paper";
import type { PaperSettings } from "@/types";
import { useToast } from "@/hooks";
import { checkPremiumStatus, PREMIUM_FEATURES } from "@/lib/premium";

interface PaperSettingsProps {
  settings: PaperSettings;
  onUpdate: (changes: Partial<PaperSettings>) => void;
  defaultInstituteName?: string;
  className?: string;
  onPremiumRequired?: (feature: string) => void;
}

export function PaperSettings({
  settings,
  onUpdate,
  defaultInstituteName = "",
  className = "",
  onPremiumRequired,
}: PaperSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const isPremium = checkPremiumStatus().isPremium;

  const handleLogoUpload = () => {
    if (!isPremium) {
      toast.error(`${PREMIUM_FEATURES.customLogo} is a premium feature`);
      onPremiumRequired?.(PREMIUM_FEATURES.customLogo);
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg,image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUpdate({ instituteLogo: dataUrl, showLogo: true });
        toast.success("Logo uploaded!");
      };
      reader.onerror = () => toast.error("Failed to read file");
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleRemoveLogo = () => {
    onUpdate({ instituteLogo: null, showLogo: false });
    toast.success("Logo removed");
  };

  const handleBubbleSheetToggle = () => {
    onUpdate({ includeAnswerSheet: !settings.includeAnswerSheet });
  };

  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E3F2FD] flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-[#1E88E5]" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 block">Paper Details</span>
              {!isExpanded && (
                <span className="text-xs text-gray-400 ml-auto pr-2">
                  Customize paper header
                </span>
              )}
            </div>
            {isExpanded && (
              <span className="text-xs text-gray-500">Title, date, institute & options</span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 font-medium text-sm">Paper Title</Label>
                <Input
                  id="title"
                  value={settings.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="e.g., Physics Monthly Test"
                  className="h-12 rounded-xl border-gray-200 focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-700 font-medium text-sm">Exam Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={settings.date}
                    onChange={(e) => onUpdate({ date: e.target.value })}
                    className="h-12 rounded-xl border-gray-200 focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeAllowed" className="text-gray-700 font-medium text-sm">Time Allowed</Label>
                  <Select
                    value={settings.timeAllowed}
                    onValueChange={(value) => onUpdate({ timeAllowed: value })}
                  >
                    <SelectTrigger id="timeAllowed" className="h-12 rounded-xl">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instituteName" className="text-gray-700 font-medium text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  Institute Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="instituteName"
                  value={settings.instituteName}
                  onChange={(e) => onUpdate({ instituteName: e.target.value })}
                  placeholder="Enter school/institute name"
                  className="h-12 rounded-xl border-gray-200 focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium text-sm flex items-center gap-2">
                  <ImagePlus className="w-4 h-4 text-gray-500" />
                  Institute Logo
                  {!isPremium && (
                    <span className="flex items-center gap-1 text-amber-600 text-xs">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-3">
                  {settings.instituteLogo ? (
                    <div className="relative">
                      <div className="w-16 h-16 rounded-xl border-2 border-gray-200 overflow-hidden bg-white">
                        <img 
                          src={settings.instituteLogo} 
                          alt="Logo" 
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleLogoUpload}
                      className={cn(
                        "w-16 h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors",
                        isPremium 
                          ? "border-gray-300 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5" 
                          : "border-gray-200 bg-gray-50 cursor-not-allowed"
                      )}
                    >
                      {isPremium ? (
                        <>
                          <ImagePlus className="w-5 h-5 text-gray-400" />
                          <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-[10px] text-gray-400 mt-1">Locked</span>
                        </>
                      )}
                    </button>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      {settings.instituteLogo 
                        ? "Logo will appear on paper header" 
                        : isPremium 
                          ? "Optional: Add your institute logo" 
                          : "Upgrade to Premium to upload logo"
                      }
                    </p>
                    {settings.instituteLogo && (
                      <button
                        onClick={() => onUpdate({ showLogo: !settings.showLogo })}
                        className="text-xs text-[#1E88E5] hover:underline mt-1"
                      >
                        {settings.showLogo ? "Hide from paper" : "Show on paper"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Paper Options</p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleBubbleSheetToggle}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                      settings.includeAnswerSheet
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        settings.includeAnswerSheet ? "bg-blue-100" : "bg-gray-200"
                      )}>
                        <ClipboardList className={cn(
                          "w-5 h-5",
                          settings.includeAnswerSheet ? "text-blue-600" : "text-gray-500"
                        )} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">Bubble Sheet (MCQ Answers)</p>
                        <p className="text-xs text-gray-500">Show answer circles for MCQs</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-11 h-6 rounded-full p-0.5 transition-colors",
                      settings.includeAnswerSheet ? "bg-blue-500" : "bg-gray-300"
                    )}>
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow"
                        animate={{
                          x: settings.includeAnswerSheet ? 20 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </button>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Custom Marks Per Question</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">MCQ</Label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={settings.customMarks?.mcq || 1}
                          onChange={(e) => onUpdate({
                            customMarks: { ...settings.customMarks, mcq: parseInt(e.target.value) || 1 }
                          })}
                          className="h-9 rounded-lg text-sm text-center"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Short</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={settings.customMarks?.short || 5}
                          onChange={(e) => onUpdate({
                            customMarks: { ...settings.customMarks, short: parseInt(e.target.value) || 5 }
                          })}
                          className="h-9 rounded-lg text-sm text-center"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Long</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={settings.customMarks?.long || 10}
                          onChange={(e) => onUpdate({
                            customMarks: { ...settings.customMarks, long: parseInt(e.target.value) || 10 }
                          })}
                          className="h-9 rounded-lg text-sm text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customHeader" className="text-gray-600 text-sm">Custom Header (Optional)</Label>
                    <Input
                      id="customHeader"
                      value={settings.customHeader || ''}
                      onChange={(e) => onUpdate({ customHeader: e.target.value })}
                      placeholder="e.g., Punjab Board Examination"
                      className="h-11 rounded-xl text-sm border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="syllabus" className="text-gray-600 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      Syllabus
                    </Label>
                    <Input
                      id="syllabus"
                      value={settings.syllabus || ''}
                      onChange={(e) => onUpdate({ syllabus: e.target.value })}
                      placeholder="e.g., Chapter 1-5"
                      className="h-11 rounded-xl text-sm border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Institute Contact (Optional)</p>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="instituteAddress" className="text-gray-600 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      Address
                    </Label>
                    <Input
                      id="instituteAddress"
                      value={settings.instituteAddress || ''}
                      onChange={(e) => onUpdate({ instituteAddress: e.target.value })}
                      placeholder="e.g., Main Campus, City"
                      className="h-11 rounded-xl text-sm border-gray-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="institutePhone" className="text-gray-600 text-sm flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-500" />
                        Phone
                      </Label>
                      <Input
                        id="institutePhone"
                        value={settings.institutePhone || ''}
                        onChange={(e) => onUpdate({ institutePhone: e.target.value })}
                        placeholder="e.g., 0300-1234567"
                        className="h-11 rounded-xl text-sm border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instituteEmail" className="text-gray-600 text-sm flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-500" />
                        Email
                      </Label>
                      <Input
                        id="instituteEmail"
                        type="email"
                        value={settings.instituteEmail || ''}
                        onChange={(e) => onUpdate({ instituteEmail: e.target.value })}
                        placeholder="e.g., info@school.edu"
                        className="h-11 rounded-xl text-sm border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instituteWebsite" className="text-gray-600 text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      Website
                    </Label>
                    <Input
                      id="instituteWebsite"
                      value={settings.instituteWebsite || ''}
                      onChange={(e) => onUpdate({ instituteWebsite: e.target.value })}
                      placeholder="e.g., www.school.edu"
                      className="h-11 rounded-xl text-sm border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

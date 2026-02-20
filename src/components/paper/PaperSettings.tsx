"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, ChevronDown, ImagePlus, X, Check, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXAM_TYPES, TIME_OPTIONS } from "@/constants/paper";
import type { PaperSettings } from "@/types";
import { useToast } from "@/hooks";

interface PaperSettingsProps {
  settings: PaperSettings;
  onUpdate: (changes: Partial<PaperSettings>) => void;
  defaultInstituteName?: string;
  className?: string;
}

export function PaperSettings({
  settings,
  onUpdate,
  defaultInstituteName = "",
  className = "",
}: PaperSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();

  const handleLogoUpload = () => {
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

  return (
    <motion.div
      className={cn("glass-panel rounded-2xl overflow-hidden", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-[#1E88E5]" />
          <span className="font-semibold text-gray-800">Paper Details</span>
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
                <Label htmlFor="title" className="text-gray-700 font-medium">Paper Title</Label>
                <Input
                  id="title"
                  value={settings.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder="e.g., Physics Monthly Test"
                  className="h-11 rounded-xl border-gray-200 focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="examType" className="text-gray-700 font-medium">Exam Type</Label>
                  <Select
                    value={settings.examType}
                    onValueChange={(value) => onUpdate({ examType: value })}
                  >
                    <SelectTrigger id="examType" className="h-11 rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeAllowed" className="text-gray-700 font-medium">Time Allowed</Label>
                  <Select
                    value={settings.timeAllowed}
                    onValueChange={(value) => onUpdate({ timeAllowed: value })}
                  >
                    <SelectTrigger id="timeAllowed" className="h-11 rounded-xl">
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
                <Label htmlFor="date" className="text-gray-700 font-medium">Exam Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={settings.date}
                  onChange={(e) => onUpdate({ date: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instituteName" className="text-gray-700 font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Institute Name
                </Label>
                <Input
                  id="instituteName"
                  value={settings.instituteName}
                  onChange={(e) => onUpdate({ instituteName: e.target.value })}
                  placeholder="Enter school/institute name"
                  className="h-11 rounded-xl border-gray-200 focus:border-[#1E88E5] focus:ring-[#1E88E5]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  Institute Logo
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
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 transition-colors"
                    >
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                    </button>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      {settings.instituteLogo ? "Logo will appear on paper header" : "Optional: Add your institute logo"}
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

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Advanced Options</p>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="customHeader" className="text-gray-600 text-sm">Custom Header (Optional)</Label>
                    <Input
                      id="customHeader"
                      value={settings.customHeader || ''}
                      onChange={(e) => onUpdate({ customHeader: e.target.value })}
                      placeholder="e.g., Punjab Board Examination"
                      className="h-10 rounded-xl text-sm border-gray-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customSubHeader" className="text-gray-600 text-sm">Custom Subheader (Optional)</Label>
                    <Input
                      id="customSubHeader"
                      value={settings.customSubHeader || ''}
                      onChange={(e) => onUpdate({ customSubHeader: e.target.value })}
                      placeholder="e.g., Annual Examination 2024"
                      className="h-10 rounded-xl text-sm border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                <Label htmlFor="includeInstructions" className="cursor-pointer text-sm text-gray-600">
                  Include instructions section
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdate({ includeInstructions: !settings.includeInstructions })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors p-0",
                    settings.includeInstructions ? "bg-[#1E88E5]" : "bg-gray-300"
                  )}
                >
                  <motion.div
                    className="absolute w-5 h-5 bg-white rounded-full shadow top-0.5"
                    animate={{
                      left: settings.includeInstructions ? "calc(100% - 21px)" : "2px",
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

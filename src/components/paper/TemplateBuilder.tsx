"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Save,
  X,
  ArrowDown,
  ArrowUp,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { 
  TemplateSection, 
  CombinedQuestionType,
  PaperTemplate 
} from "@/types/template";
import { generateSectionId } from "@/types/template";
import { createCustomTemplate } from "@/lib/template-store";

interface TemplateBuilderProps {
  classId: string;
  subject: string;
  initialTemplate?: PaperTemplate;
  onSave: (template: PaperTemplate) => void;
  onCancel: () => void;
}

const QUESTION_TYPES: { value: CombinedQuestionType; label: string }[] = [
  { value: 'mcq', label: 'MCQ (Multiple Choice)' },
  { value: 'short', label: 'Short Question' },
  { value: 'long', label: 'Long Question' },
  { value: 'essay', label: 'Essay' },
  { value: 'letter', label: 'Letter' },
  { value: 'story', label: 'Story' },
  { value: 'application', label: 'Application' },
  { value: 'translation', label: 'Translation' },
  { value: 'pair_of_words', label: 'Pair of Words' },
  { value: 'punctuation', label: 'Punctuation' },
  { value: 'fill_in_blanks', label: 'Fill in Blanks' },
  { value: 'user_defined', label: 'Custom Type' },
];

export function TemplateBuilder({
  classId,
  subject,
  initialTemplate,
  onSave,
  onCancel,
}: TemplateBuilderProps) {
  const [templateName, setTemplateName] = useState(initialTemplate?.name || "");
  const [description, setDescription] = useState(initialTemplate?.description || "");
  const [totalMarks, setTotalMarks] = useState(initialTemplate?.totalMarks || 75);
  const [timeAllowed, setTimeAllowed] = useState(initialTemplate?.timeAllowed || "2 Hours");
  const [sections, setSections] = useState<TemplateSection[]>(
    initialTemplate?.sections || [
      {
        id: generateSectionId(),
        type: 'mcq',
        title: 'Objective (MCQs)',
        instruction: 'Choose the correct answer',
        totalQuestions: 15,
        attemptCount: 15,
        marksPerQuestion: 1,
      }
    ]
  );

  // Add new section
  const addSection = () => {
    setSections([
      ...sections,
      {
        id: generateSectionId(),
        type: 'short',
        title: 'Short Questions',
        instruction: 'Attempt any 5 questions',
        totalQuestions: 8,
        attemptCount: 5,
        marksPerQuestion: 2,
      }
    ]);
  };

  // Remove section
  const removeSection = (id: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter(s => s.id !== id));
  };

  // Update section
  const updateSection = (id: string, updates: Partial<TemplateSection>) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  // Move section up/down
  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (index < 0) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSections(newSections);
  };

  // Calculate total marks from sections
  const calculatedMarks = sections.reduce(
    (sum, s) => sum + (s.attemptCount * s.marksPerQuestion), 
    0
  );

  // Handle save
  const handleSave = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    const template = createCustomTemplate(
      templateName,
      classId,
      subject,
      sections,
      totalMarks,
      timeAllowed,
      description
    );

    onSave(template);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., My Custom Test"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Total Marks</Label>
              <Input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(parseInt(e.target.value) || 0)}
                min={1}
                max={200}
              />
            </div>
            <div className="space-y-2">
              <Label>Time Allowed</Label>
              <Select value={timeAllowed} onValueChange={setTimeAllowed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 Minutes">30 Minutes</SelectItem>
                  <SelectItem value="45 Minutes">45 Minutes</SelectItem>
                  <SelectItem value="1 Hour">1 Hour</SelectItem>
                  <SelectItem value="1.5 Hours">1.5 Hours</SelectItem>
                  <SelectItem value="2 Hours">2 Hours</SelectItem>
                  <SelectItem value="2.5 Hours">2.5 Hours</SelectItem>
                  <SelectItem value="3 Hours">3 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Calculated Marks</Label>
              <div className={cn(
                "h-10 flex items-center px-3 rounded-md border",
                calculatedMarks === totalMarks 
                  ? "bg-green-50 border-green-200 text-green-700" 
                  : "bg-amber-50 border-amber-200 text-amber-700"
              )}>
                {calculatedMarks} {calculatedMarks !== totalMarks && `(target: ${totalMarks})`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Sections</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSection}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Section
          </Button>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 bg-gray-50/50"
            >
              <div className="flex items-start gap-3">
                {/* Order Controls */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(section.id, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Section Fields */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Question Type</Label>
                    <Select 
                      value={section.type} 
                      onValueChange={(value) => updateSection(section.id, { type: value as CombinedQuestionType })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Section Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="h-8"
                      placeholder="e.g., Short Questions"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Instruction</Label>
                    <Input
                      value={section.instruction}
                      onChange={(e) => updateSection(section.id, { instruction: e.target.value })}
                      className="h-8"
                      placeholder="e.g., Attempt any 5 questions"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Total Questions</Label>
                    <Input
                      type="number"
                      value={section.totalQuestions}
                      onChange={(e) => updateSection(section.id, { 
                        totalQuestions: parseInt(e.target.value) || 0 
                      })}
                      className="h-8"
                      min={1}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Attempt Count</Label>
                    <Input
                      type="number"
                      value={section.attemptCount}
                      onChange={(e) => updateSection(section.id, { 
                        attemptCount: parseInt(e.target.value) || 0 
                      })}
                      className="h-8"
                      min={1}
                      max={section.totalQuestions}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Marks per Question</Label>
                    <Input
                      type="number"
                      value={section.marksPerQuestion}
                      onChange={(e) => updateSection(section.id, { 
                        marksPerQuestion: parseInt(e.target.value) || 0 
                      })}
                      className="h-8"
                      min={1}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Section Marks</Label>
                    <div className="h-8 flex items-center px-3 text-sm text-gray-600 bg-gray-100 rounded">
                      {section.attemptCount * section.marksPerQuestion} marks
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="p-2 rounded hover:bg-red-100 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-[#1E88E5] hover:bg-[#1565C0]">
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>
    </div>
  );
}

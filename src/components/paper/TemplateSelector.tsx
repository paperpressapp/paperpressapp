"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Edit3,
  Trash2,
  Copy,
  Sparkles
} from "lucide-react";
import { TemplateCard } from "./TemplateCard";
import { TemplateBuilder } from "./TemplateBuilder";
import { getAllTemplates, getTemplateSummaries, deleteCustomTemplate } from "@/lib/template-store";
import type { TemplateSummary, PaperTemplate } from "@/types/template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  classId: string;
  subject: string;
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateSelector({
  classId,
  subject,
  selectedTemplateId,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PaperTemplate | null>(null);

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [classId, subject]);

  const loadTemplates = () => {
    setIsLoading(true);
    try {
      const summaries = getTemplateSummaries(classId, subject);
      setTemplates(summaries);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const query = searchQuery.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, TemplateSummary[]> = {
      full_book: [],
      half_book: [],
      chapter_wise: [],
      multi_chapter: [],
    };
    
    filteredTemplates.forEach(template => {
      if (groups[template.category]) {
        groups[template.category].push(template);
      }
    });
    
    return groups;
  }, [filteredTemplates]);

  const handleSelect = (templateId: string) => {
    onSelectTemplate(templateId);
  };

  const handleDelete = (templateId: string) => {
    deleteCustomTemplate(templateId);
    setShowDeleteConfirm(null);
    loadTemplates();
  };

  const handleTemplateCreated = () => {
    setShowBuilder(false);
    loadTemplates();
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'full_book': return 'Full Book Paper';
      case 'half_book': return 'Half Book Paper';
      case 'chapter_wise': return 'Chapter Wise Test';
      case 'multi_chapter': return 'Multi Chapters Test';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'full_book': return '📚';
      case 'half_book': return '📖';
      case 'chapter_wise': return '📝';
      case 'multi_chapter': return '📋';
      default: return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1E88E5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select Template</h2>
          <p className="text-sm text-gray-500">
            Choose a paper pattern for {subject} (Class {classId})
          </p>
        </div>
        
        <Button
          onClick={() => setShowBuilder(true)}
          className="bg-[#1E88E5] hover:bg-[#1565C0]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Custom
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid by Category */}
      <div className="space-y-8">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
          if (categoryTemplates.length === 0) return null;
          
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <h3 className="font-semibold text-gray-700">
                  {getCategoryTitle(category)}
                </h3>
                <span className="text-xs text-gray-400">
                  ({categoryTemplates.length})
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplateId === template.id}
                    onSelect={handleSelect}
                    onDelete={
                      template.type === 'custom' 
                        ? (id) => setShowDeleteConfirm(id)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900">No templates found</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or create a custom template
            </p>
          </div>
        )}
      </div>

      {/* Template Builder Sheet */}
      <Sheet open={showBuilder} onOpenChange={setShowBuilder}>
        <SheetContent side="right" className="w-full md:w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Custom Template</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <TemplateBuilder
              classId={classId}
              subject={subject}
              onSave={handleTemplateCreated}
              onCancel={() => setShowBuilder(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this custom template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

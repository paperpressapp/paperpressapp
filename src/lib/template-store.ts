/**
 * PaperPress — Template Store
 * 
 * Manages paper templates (predefined + custom)
 * Storage: Local only (localStorage)
 */

import type { 
  PaperTemplate, 
  TemplateSection, 
  TemplateCategory,
  TemplateSummary,
  generateTemplateId,
  generateSectionId
} from '@/types/template';
import type { ClassName, SubjectName } from '@/types/question';
import { getPattern, PAPER_PATTERNS, type PaperPattern } from '@/lib/pdf/patterns';

// Storage keys
const CUSTOM_TEMPLATES_KEY = 'paperpress_custom_templates';
const SELECTED_TEMPLATE_KEY = 'paperpress_selected_template';

// Get all predefined templates for a class/subject
export function getPredefinedTemplates(classId: string, subject: string): PaperTemplate[] {
  const templates: PaperTemplate[] = [];
  const patternKey = `${classId}_${subject.toLowerCase()}`;
  
  // Check if pattern exists
  if (PAPER_PATTERNS[patternKey]) {
    const pattern = PAPER_PATTERNS[patternKey];
    
    // Full Book Template
    templates.push({
      id: `${patternKey}_full_book`,
      name: 'Full Book Paper',
      description: 'Complete syllabus paper covering all chapters',
      category: 'full_book',
      type: 'predefined',
      classId,
      subject,
      totalMarks: pattern.totalMarks,
      timeAllowed: pattern.timeAllowed,
      sections: convertPatternSectionsToTemplateSections(pattern.sections),
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    // Half Book Template
    const halfMarks = Math.floor(pattern.totalMarks / 2);
    const halfSections = pattern.sections.map(section => ({
      ...section,
      totalQuestions: Math.ceil(section.totalQuestions / 2),
      attemptCount: Math.ceil(section.attemptCount / 2),
      totalMarks: Math.ceil(section.totalMarks / 2),
    }));
    
    templates.push({
      id: `${patternKey}_half_book`,
      name: 'Half Book Paper',
      description: 'Half syllabus paper - for half-yearly exams',
      category: 'half_book',
      type: 'predefined',
      classId,
      subject,
      totalMarks: halfMarks,
      timeAllowed: pattern.timeAllowed,
      sections: convertPatternSectionsToTemplateSections(halfSections),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    // Chapter Wise Test Template (template, actual chapters selected later)
    templates.push({
      id: `${patternKey}_chapter_wise`,
      name: 'Chapter Wise Test',
      description: 'Test from single chapter',
      category: 'chapter_wise',
      type: 'predefined',
      classId,
      subject,
      totalMarks: Math.floor(pattern.totalMarks / 4), // ~25% for single chapter
      timeAllowed: '30 Minutes',
      sections: convertPatternSectionsToTemplateSections(
        pattern.sections.map(s => ({
          ...s,
          totalQuestions: Math.ceil(s.totalQuestions / 4),
          attemptCount: Math.ceil(s.attemptCount / 4),
        }))
      ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    // Multi Chapters Test Template
    templates.push({
      id: `${patternKey}_multi_chapter`,
      name: 'Multi Chapters Test',
      description: 'Test from multiple selected chapters',
      category: 'multi_chapter',
      type: 'predefined',
      classId,
      subject,
      totalMarks: Math.floor(pattern.totalMarks / 2),
      timeAllowed: '1 Hour',
      sections: convertPatternSectionsToTemplateSections(pattern.sections),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  return templates;
}

// Convert pattern sections to template sections
function convertPatternSectionsToTemplateSections(sections: any[]): TemplateSection[] {
  return sections.map((section, index) => ({
    id: `section_${index}`,
    type: section.type,
    title: section.title,
    instruction: section.instruction,
    totalQuestions: section.totalQuestions,
    attemptCount: section.attemptCount,
    marksPerQuestion: section.marksPerQuestion,
    hasSubParts: section.hasSubParts,
    chapters: section.chapters,
    customPrompt: section.writingPrompt,
    answerLines: section.answerLines,
  }));
}

// Get all custom templates (user-created)
export function getCustomTemplates(): PaperTemplate[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading custom templates:', error);
    return [];
  }
}

// Save a custom template
export function saveCustomTemplate(template: PaperTemplate): PaperTemplate {
  const templates = getCustomTemplates();
  
  // Check if template with same ID exists
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    // Update existing
    templates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    // Add new
    template.id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    template.createdAt = new Date().toISOString();
    template.updatedAt = new Date().toISOString();
    templates.push(template);
  }
  
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
  return template;
}

// Delete a custom template
export function deleteCustomTemplate(templateId: string): boolean {
  const templates = getCustomTemplates();
  const filtered = templates.filter(t => t.id !== templateId);
  
  if (filtered.length === templates.length) return false;
  
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(filtered));
  return true;
}

// Get template by ID (checks both predefined and custom)
export function getTemplateById(templateId: string, classId: string, subject: string): PaperTemplate | null {
  // Check predefined first
  const predefined = getPredefinedTemplates(classId, subject);
  const found = predefined.find(t => t.id === templateId);
  if (found) return found;
  
  // Check custom
  const custom = getCustomTemplates();
  return custom.find(t => t.id === templateId) || null;
}

// Get all templates (predefined + custom) for a class/subject
export function getAllTemplates(classId: string, subject: string): PaperTemplate[] {
  const predefined = getPredefinedTemplates(classId, subject);
  const custom = getCustomTemplates().filter(
    t => t.classId === classId && t.subject === subject
  );
  
  return [...predefined, ...custom];
}

// Get template summaries for display
export function getTemplateSummaries(classId: string, subject: string): TemplateSummary[] {
  const templates = getAllTemplates(classId, subject);
  
  return templates.map(template => {
    const questionCount = template.sections.reduce(
      (sum, section) => sum + section.totalQuestions, 
      0
    );
    
    return {
      id: template.id,
      name: template.name,
      category: template.category,
      type: template.type,
      totalMarks: template.totalMarks,
      timeAllowed: template.timeAllowed,
      sectionCount: template.sections.length,
      questionCount,
    };
  });
}

// Save selected template (for persistence)
export function saveSelectedTemplate(templateId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELECTED_TEMPLATE_KEY, templateId);
}

// Get saved selected template
export function getSavedSelectedTemplate(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELECTED_TEMPLATE_KEY);
}

// Clear selected template
export function clearSelectedTemplate(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SELECTED_TEMPLATE_KEY);
}

// Create a new custom template
export function createCustomTemplate(
  name: string,
  classId: string,
  subject: string,
  sections: TemplateSection[],
  totalMarks: number,
  timeAllowed: string,
  description?: string
): PaperTemplate {
  const template: PaperTemplate = {
    id: `custom_${Date.now()}`,
    name,
    description,
    category: 'multi_chapter', // Default to multi_chapter for custom
    type: 'custom',
    classId,
    subject,
    totalMarks,
    timeAllowed,
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return saveCustomTemplate(template);
}

// Clone an existing template as starting point
export function cloneTemplate(
  sourceTemplateId: string,
  classId: string,
  subject: string,
  newName: string
): PaperTemplate | null {
  const source = getTemplateById(sourceTemplateId, classId, subject);
  if (!source) return null;
  
  const cloned: PaperTemplate = {
    ...source,
    id: `custom_${Date.now()}`,
    name: newName,
    type: 'custom',
    category: 'multi_chapter',
    description: `Cloned from ${source.name}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return saveCustomTemplate(cloned);
}

// Get category display name
export function getCategoryDisplayName(category: TemplateCategory): string {
  switch (category) {
    case 'full_book': return 'Full Book Paper';
    case 'half_book': return 'Half Book Paper';
    case 'chapter_wise': return 'Chapter Wise Test';
    case 'multi_chapter': return 'Multi Chapters Test';
    default: return category;
  }
}

// Get category icon
export function getCategoryIcon(category: TemplateCategory): string {
  switch (category) {
    case 'full_book': return '📚';
    case 'half_book': return '📖';
    case 'chapter_wise': return '📝';
    case 'multi_chapter': return '📋';
    default: return '📄';
  }
}

// Get chapter indices for half book
export function getChapterIndicesForHalf(totalChapters: number, half: 'first' | 'second'): number[] {
  const halfCount = Math.ceil(totalChapters / 2);
  if (half === 'first') {
    return Array.from({ length: halfCount }, (_, i) => i + 1);
  } else {
    return Array.from({ length: totalChapters - halfCount }, (_, i) => halfCount + i + 1);
  }
}

// AI Generation: Auto-select questions based on template and difficulty
export interface AIGenerationResult {
  mcqIds: string[];
  shortIds: string[];
  longIds: string[];
  chapterIds: string[];
  totalQuestions: number;
  totalMarks: number;
}

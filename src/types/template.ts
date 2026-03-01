/**
 * PaperPress — Template System Types
 * 
 * Types for the template-based paper creation system
 */

// Question Types
export type QuestionType = 'mcq' | 'short' | 'long';

// Custom Question Types (predefined + user-defined)
export type CustomQuestionType = 
  | 'essay' 
  | 'letter' 
  | 'story' 
  | 'application' 
  | 'translation'
  | 'pair_of_words' 
  | 'punctuation' 
  | 'fill_in_blanks'
  | 'user_defined';

// Combined question type
export type CombinedQuestionType = QuestionType | CustomQuestionType;

// Template Category
export type TemplateCategory = 'full_book' | 'half_book' | 'chapter_wise' | 'multi_chapter';

// Template Section
export interface TemplateSection {
  id: string;
  type: CombinedQuestionType;
  title: string;
  instruction: string;
  totalQuestions: number;
  attemptCount: number;
  marksPerQuestion: number;
  hasSubParts?: boolean;
  chapters?: number[];
  customPrompt?: string;
  answerLines?: number;
}

// Paper Template
export interface PaperTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  type: 'predefined' | 'custom';
  classId: string;
  subject: string;
  totalMarks: number;
  timeAllowed: string;
  sections: TemplateSection[];
  isDefault?: boolean;
  isActive?: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// Edited Question during paper creation
export interface EditedQuestion {
  originalId: string;
  newText: string;
  newOptions?: string[];
  newMarks?: number;
  newType?: CombinedQuestionType;
}

// Custom Question added by user
export interface CustomQuestion {
  id: string;
  type: CombinedQuestionType;
  questionText: string;
  options?: string[];
  correctOption?: number;
  marks: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  chapterId?: string;
  chapterNumber?: number;
  chapterName?: string;
  customTypeName?: string; // For user_defined type
}

// Template Selection State
export interface TemplateSelectionState {
  selectedTemplateId: string | null;
  customTemplate: PaperTemplate | null;
  isEditingTemplate: boolean;
}

// Predefined Custom Types Configuration
export interface CustomTypeConfig {
  id: CustomQuestionType;
  name: string;
  icon: string;
  defaultPrompt?: string;
  defaultLines?: number;
  defaultMarks: number;
  hasSubTypes?: boolean;
  subTypes?: string[];
}

// Template Summary (for display in cards)
export interface TemplateSummary {
  id: string;
  name: string;
  category: TemplateCategory;
  type: 'predefined' | 'custom';
  totalMarks: number;
  timeAllowed: string;
  sectionCount: number;
  questionCount: number;
}

// Generate unique ID
export function generateTemplateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSectionId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCustomQuestionId(): string {
  return `custom_q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

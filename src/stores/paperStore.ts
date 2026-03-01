/**
 * Paper Store
 * 
 * Zustand store for managing paper creation state.
 * Handles class/subject selection, chapter selection, question selection,
 * paper settings, and persists state to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import logger from '@/lib/utils/logger';
import type { ClassName, SubjectName, PaperSettings } from '@/types';
import type { PaperTemplate } from '@/types/template';
import type { LayoutSettings } from '@/types/layout';
import { DEFAULT_LAYOUT_SETTINGS } from '@/types/layout';
import { format } from 'date-fns';
import { DEFAULT_MARKS } from '@/constants/paper';

interface PaperState {
  // Selection State
  selectedClass: ClassName | null;
  selectedSubject: SubjectName | null;
  selectedChapters: string[];
  selectedMcqIds: string[];
  selectedShortIds: string[];
  selectedLongIds: string[];

  // Template State (NEW)
  selectedTemplateId: string | null;
  selectedTemplate: PaperTemplate | null;
  activeTemplateId: string | null;
  selectedDifficulty: 'easy' | 'medium' | 'hard' | 'mixed' | null;
  selectedHalf: 'first' | 'second' | null;
  layoutSettings: LayoutSettings;

  // Paper Settings
  paperSettings: PaperSettings;

  // Edited Questions (Customization)
  editedQuestions: Record<string, any>;
  questionOrder: { mcqs: string[]; shorts: string[]; longs: string[] };

  // Class and Subject Actions
  setClass: (classId: ClassName) => void;
  setSubject: (subject: SubjectName) => void;

  // Chapter Actions
  toggleChapter: (chapterId: string) => void;
  selectAllChapters: (chapterIds: string[]) => void;
  clearChapters: () => void;

  // MCQ Actions
  toggleMcq: (questionId: string) => void;
  setMcqs: (questionIds: string[]) => void;
  clearMcqs: () => void;

  // Short Question Actions
  toggleShort: (questionId: string) => void;
  setShorts: (questionIds: string[]) => void;
  clearShorts: () => void;

  // Template Actions (NEW)
  setSelectedTemplate: (templateId: string | null, template: PaperTemplate | null) => void;
  setActiveTemplate: (templateId: string | null) => void;
  applyTemplate: (template: PaperTemplate) => void;
  setSelectedDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'mixed' | null) => void;
  setSelectedHalf: (half: 'first' | 'second' | null) => void;
  clearActiveTemplate: () => void;
  updateLayoutSettings: (settings: Partial<LayoutSettings>) => void;

  // Long Question Actions
  toggleLong: (questionId: string) => void;
  setLongs: (questionIds: string[]) => void;
  clearLongs: () => void;

  // Settings Actions
  updateSettings: (settings: Partial<PaperSettings>) => void;

  // Editing Actions
  editQuestion: (questionId: string, updates: any) => void;
  setQuestionOrder: (type: 'mcq' | 'short' | 'long' | 'mcqs' | 'shorts' | 'longs', order: string[]) => void;
  clearEditedQuestions: () => void;

  // Reset Actions
  resetQuestions: () => void;
  resetAll: () => void;

  // Computed Values (as getters)
  getTotalQuestions: () => number;
  getTotalMarks: (mcqMarks?: number, shortMarks?: number, longMarks?: number) => number;

  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

// Default paper settings
const getDefaultSettings = (): PaperSettings => ({
  title: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  timeAllowed: '2 Hours',
  totalMarks: 0,
  includeInstructions: true,
  instituteName: '',
  instituteLogo: null,
  customHeader: '',
  customSubHeader: '',
  showLogo: true,
  logoSize: 60,
  customMarks: { ...DEFAULT_MARKS },
  includeAnswerSheet: false,
  includeMarkingScheme: false,
  syllabus: '',
  instituteAddress: '',
  instituteEmail: '',
  institutePhone: '',
  instituteWebsite: '',
});

// Initial state
const initialState = {
  selectedClass: null as ClassName | null,
  selectedSubject: null as SubjectName | null,
  selectedChapters: [] as string[],
  selectedMcqIds: [] as string[],
  selectedShortIds: [] as string[],
  selectedLongIds: [] as string[],
  selectedTemplateId: null as string | null,
  selectedTemplate: null as PaperTemplate | null,
  activeTemplateId: null as string | null,
  selectedDifficulty: null as 'easy' | 'medium' | 'hard' | 'mixed' | null,
  selectedHalf: null as 'first' | 'second' | null,
  layoutSettings: DEFAULT_LAYOUT_SETTINGS,
  paperSettings: getDefaultSettings(),
  editedQuestions: {} as Record<string, any>,
  questionOrder: { mcqs: [], shorts: [], longs: [] } as { mcqs: string[]; shorts: string[]; longs: string[] },
  _hasHydrated: false,
};

export const usePaperStore = create<PaperState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Class and Subject Actions
      setClass: (classId: ClassName) => {
        set({
          selectedClass: classId,
          selectedSubject: null,
          selectedChapters: [],
          selectedMcqIds: [],
          selectedShortIds: [],
          selectedLongIds: [],
          paperSettings: getDefaultSettings(),
        });
      },

      setSubject: (subject: SubjectName) => {
        const state = get();
        const classId = state.selectedClass;

        set({
          selectedSubject: subject,
          selectedChapters: [],
          selectedMcqIds: [],
          selectedShortIds: [],
          selectedLongIds: [],
          paperSettings: {
            ...state.paperSettings,
            title: classId ? `${classId} ${subject} Test Paper` : `${subject} Test Paper`,
          },
        });
      },

      // Chapter Actions
      toggleChapter: (chapterId: string) => {
        const state = get();
        const currentChapters = state.selectedChapters;

        let newChapters: string[];
        if (currentChapters.includes(chapterId)) {
          newChapters = currentChapters.filter((id) => id !== chapterId);
        } else {
          newChapters = [...currentChapters, chapterId];
        }

        set({
          selectedChapters: newChapters,
          // Removed aggressive clearing of selected IDs to allow adding chapters
          // without losing previous selections.
        });
      },

      selectAllChapters: (chapterIds: string[]) => {
        set({
          selectedChapters: chapterIds,
        });
      },

      clearChapters: () => {
        set({
          selectedChapters: [],
          selectedMcqIds: [],
          selectedShortIds: [],
          selectedLongIds: [],
        });
      },

      // MCQ Actions
      toggleMcq: (questionId: string) => {
        const state = get();
        const currentIds = state.selectedMcqIds;

        if (currentIds.includes(questionId)) {
          set({
            selectedMcqIds: currentIds.filter((id) => id !== questionId),
          });
        } else {
          set({
            selectedMcqIds: [...currentIds, questionId],
          });
        }
      },

      setMcqs: (questionIds: string[]) => {
        const state = get();
        const currentOrder = state.questionOrder.mcqs;
        // Keep only existing IDs that are still selected, then append new IDs
        const newOrder = [
          ...currentOrder.filter(id => questionIds.includes(id)),
          ...questionIds.filter(id => !currentOrder.includes(id))
        ];

        set({
          selectedMcqIds: questionIds,
          questionOrder: { ...state.questionOrder, mcqs: newOrder }
        });
      },

      clearMcqs: () => {
        set({ selectedMcqIds: [] });
      },

      // Short Question Actions
      toggleShort: (questionId: string) => {
        const state = get();
        const currentIds = state.selectedShortIds;

        if (currentIds.includes(questionId)) {
          set({
            selectedShortIds: currentIds.filter((id) => id !== questionId),
          });
        } else {
          set({
            selectedShortIds: [...currentIds, questionId],
          });
        }
      },

      setShorts: (questionIds: string[]) => {
        const state = get();
        const currentOrder = state.questionOrder.shorts;
        const newOrder = [
          ...currentOrder.filter(id => questionIds.includes(id)),
          ...questionIds.filter(id => !currentOrder.includes(id))
        ];

        set({
          selectedShortIds: questionIds,
          questionOrder: { ...state.questionOrder, shorts: newOrder }
        });
      },

      clearShorts: () => {
        set({ selectedShortIds: [] });
      },

      // Template Actions (NEW)
      setSelectedTemplate: (templateId: string | null, template: PaperTemplate | null) => {
        set({
          selectedTemplateId: templateId,
          selectedTemplate: template,
        });
      },

      setActiveTemplate: (templateId: string | null) => {
        set({ activeTemplateId: templateId });
      },

      applyTemplate: (template: PaperTemplate) => {
        // Extract marks from template sections
        const mcqSection = template.sections.find(s => s.type === 'mcq');
        const shortSection = template.sections.find(s => s.type === 'short');
        const longSection = template.sections.find(s => s.type === 'long');

        const mcqMarks = mcqSection?.marksPerQuestion || 1;
        const shortMarks = shortSection?.marksPerQuestion || 2;
        const longMarks = longSection?.marksPerQuestion || 5;

        set({
          selectedHalf: null,
          paperSettings: {
            ...get().paperSettings,
            title: template.name,
            timeAllowed: template.timeAllowed,
            totalMarks: template.totalMarks,
            customMarks: {
              mcq: mcqMarks,
              short: shortMarks,
              long: longMarks,
            },
          },
          // Clear previous selections
          selectedChapters: [],
          selectedMcqIds: [],
          selectedShortIds: [],
          selectedLongIds: [],
        });
      },

      clearActiveTemplate: () => {
        set({
          activeTemplateId: null,
          selectedTemplateId: null,
          selectedTemplate: null,
          selectedDifficulty: null,
          selectedHalf: null,
        });
      },

      setSelectedDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'mixed' | null) => {
        set({ selectedDifficulty: difficulty });
      },

      setSelectedHalf: (half: 'first' | 'second' | null) => {
        set({ selectedHalf: half });
      },

      updateLayoutSettings: (settings: Partial<LayoutSettings>) => {
        const current = get().layoutSettings;
        set({ layoutSettings: { ...current, ...settings } });
      },

      // Long Question Actions
      toggleLong: (questionId: string) => {
        const state = get();
        const currentIds = state.selectedLongIds;

        if (currentIds.includes(questionId)) {
          set({
            selectedLongIds: currentIds.filter((id) => id !== questionId),
          });
        } else {
          set({
            selectedLongIds: [...currentIds, questionId],
          });
        }
      },

      setLongs: (questionIds: string[]) => {
        const state = get();
        const currentOrder = state.questionOrder.longs;
        const newOrder = [
          ...currentOrder.filter(id => questionIds.includes(id)),
          ...questionIds.filter(id => !currentOrder.includes(id))
        ];

        set({
          selectedLongIds: questionIds,
          questionOrder: { ...state.questionOrder, longs: newOrder }
        });
      },

      clearLongs: () => {
        set({ selectedLongIds: [] });
      },

      // Settings Actions
      updateSettings: (settings: Partial<PaperSettings>) => {
        const state = get();
        set({
          paperSettings: {
            ...state.paperSettings,
            ...settings,
          },
        });
      },

      // Editing Actions
      editQuestion: (questionId: string, updates: any) => {
        const state = get();
        set({
          editedQuestions: {
            ...state.editedQuestions,
            [questionId]: {
              ...(state.editedQuestions[questionId] || {}),
              ...updates,
            }
          }
        });
      },

      setQuestionOrder: (type: 'mcq' | 'short' | 'long' | 'mcqs' | 'shorts' | 'longs', order: string[]) => {
        const state = get();
        const pluralType = type.endsWith('s') ? type : `${type}s` as 'mcqs' | 'shorts' | 'longs';
        set({
          questionOrder: {
            ...state.questionOrder,
            [pluralType]: order
          }
        });
      },

      clearEditedQuestions: () => {
        set({
          editedQuestions: {},
          questionOrder: { mcqs: [], shorts: [], longs: [] },
        });
      },

      // Reset Actions
      resetQuestions: () => {
        set({
          selectedMcqIds: [],
          selectedShortIds: [],
          selectedLongIds: [],
          editedQuestions: {},
          questionOrder: { mcqs: [], shorts: [], longs: [] },
        });
      },

      resetAll: () => {
        set({
          ...initialState,
          paperSettings: getDefaultSettings(),
        });
      },

      // Computed Values
      getTotalQuestions: () => {
        const state = get();
        return (
          state.selectedMcqIds.length +
          state.selectedShortIds.length +
          state.selectedLongIds.length
        );
      },

      getTotalMarks: (mcqMarks?: number, shortMarks?: number, longMarks?: number) => {
        const state = get();
        const mMarks = mcqMarks ?? state.paperSettings.customMarks.mcq ?? DEFAULT_MARKS.mcq;
        const sMarks = shortMarks ?? state.paperSettings.customMarks.short ?? DEFAULT_MARKS.short;
        const lMarks = longMarks ?? state.paperSettings.customMarks.long ?? DEFAULT_MARKS.long;
        return (
          state.selectedMcqIds.length * mMarks +
          state.selectedShortIds.length * sMarks +
          state.selectedLongIds.length * lMarks
        );
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'paperpress-paper-store',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') {
            return null;
          }
          try {
            const item = localStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(name, JSON.stringify(value));
            } catch (error) {
              logger.warn('Error saving to localStorage:', error);
            }
          }
        },
        removeItem: (name) => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(name);
          }
        },
      },
      partialize: (state) =>
      ({
        selectedClass: state.selectedClass,
        selectedSubject: state.selectedSubject,
        selectedChapters: state.selectedChapters,
        selectedMcqIds: state.selectedMcqIds,
        selectedShortIds: state.selectedShortIds,
        selectedLongIds: state.selectedLongIds,
        selectedTemplateId: state.selectedTemplateId,
        selectedTemplate: state.selectedTemplate,
        activeTemplateId: state.activeTemplateId,
        selectedDifficulty: state.selectedDifficulty,
        selectedHalf: state.selectedHalf,
        paperSettings: state.paperSettings,
        editedQuestions: state.editedQuestions,
        questionOrder: state.questionOrder,
      } as unknown as PaperState),
      onRehydrateStorage: (state) => {
        return () => {
          state.setHasHydrated(true);
        };
      },
    }
  )
);

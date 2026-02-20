/**
 * Paper Store
 * 
 * Zustand store for managing paper creation state.
 * Handles class/subject selection, chapter selection, question selection,
 * paper settings, and persists state to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClassName, SubjectName, PaperSettings } from '@/types';
import { format } from 'date-fns';

interface PaperState {
  // Selection State
  selectedClass: ClassName | null;
  selectedSubject: SubjectName | null;
  selectedChapters: string[];
  selectedMcqIds: string[];
  selectedShortIds: string[];
  selectedLongIds: string[];

  // Paper Settings
  paperSettings: PaperSettings;

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

  // Long Question Actions
  toggleLong: (questionId: string) => void;
  setLongs: (questionIds: string[]) => void;
  clearLongs: () => void;

  // Settings Actions
  updateSettings: (settings: Partial<PaperSettings>) => void;

  // Reset Actions
  resetQuestions: () => void;
  resetAll: () => void;

  // Computed Values (as getters)
  getTotalQuestions: () => number;
  getTotalMarks: (mcqMarks?: number, shortMarks?: number, longMarks?: number) => number;
}

// Default paper settings
const getDefaultSettings = (): PaperSettings => ({
  title: '',
  examType: 'Monthly Test',
  date: format(new Date(), 'yyyy-MM-dd'),
  timeAllowed: '2 Hours',
  totalMarks: 0,
  includeInstructions: true,
  instituteName: '',
  instituteLogo: null,
  customHeader: '',
  customSubHeader: '',
  showLogo: true,
});

// Initial state
const initialState = {
  selectedClass: null as ClassName | null,
  selectedSubject: null as SubjectName | null,
  selectedChapters: [] as string[],
  selectedMcqIds: [] as string[],
  selectedShortIds: [] as string[],
  selectedLongIds: [] as string[],
  paperSettings: getDefaultSettings(),
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
          selectedMcqIds: [],
          selectedShortIds: [],
          selectedLongIds: [],
        });
      },

      selectAllChapters: (chapterIds: string[]) => {
        set({
          selectedChapters: chapterIds,
          selectedMcqIds: [],
          selectedShortIds: [],
          selectedLongIds: [],
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
        set({ selectedMcqIds: questionIds });
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
        set({ selectedShortIds: questionIds });
      },

      clearShorts: () => {
        set({ selectedShortIds: [] });
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
        set({ selectedLongIds: questionIds });
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

      // Reset Actions
      resetQuestions: () => {
        set({
          selectedMcqIds: [],
          selectedShortIds: [],
          selectedLongIds: [],
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

      getTotalMarks: (mcqMarks = 1, shortMarks = 5, longMarks = 10) => {
        const state = get();
        return (
          state.selectedMcqIds.length * mcqMarks +
          state.selectedShortIds.length * shortMarks +
          state.selectedLongIds.length * longMarks
        );
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
              console.warn('Error saving to localStorage:', error);
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
          paperSettings: state.paperSettings,
        } as unknown as PaperState),
    }
  )
);

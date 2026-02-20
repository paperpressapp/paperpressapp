/**
 * Subjects Constants
 * 
 * All available subjects across all classes.
 */

import type { Subject } from '@/types';

/** Available subjects with their metadata */
export const SUBJECTS: Subject[] = [
  {
    id: 'physics',
    name: 'Physics',
    color: '#9C27B0',
    icon: 'atom',
    chapterCount: 10,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    color: '#FF9800',
    icon: 'flask',
    chapterCount: 10,
  },
  {
    id: 'biology',
    name: 'Biology',
    color: '#4CAF50',
    icon: 'leaf',
    chapterCount: 10,
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    color: '#2196F3',
    icon: 'calculator',
    chapterCount: 10,
  },
  {
    id: 'computer',
    name: 'Computer',
    color: '#607D8B',
    icon: 'laptop',
    chapterCount: 10,
  },
  {
    id: 'english',
    name: 'English',
    color: '#E91E63',
    icon: 'book',
    chapterCount: 10,
  },
] as const;

/** Subject IDs for type safety */
export const SUBJECT_IDS = ['physics', 'chemistry', 'biology', 'mathematics', 'computer', 'english'] as const;

/** Subject names for display */
export const SUBJECT_NAMES = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer', 'English'] as const;

/** Get subject by ID */
export function getSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((subj) => subj.id === id);
}

/** Get subject by name */
export function getSubjectByName(name: string): Subject | undefined {
  return SUBJECTS.find((subj) => subj.name.toLowerCase() === name.toLowerCase());
}

/** Check if a string is a valid subject ID */
export function isValidSubjectId(id: string): id is typeof SUBJECT_IDS[number] {
  return SUBJECT_IDS.includes(id as typeof SUBJECT_IDS[number]);
}

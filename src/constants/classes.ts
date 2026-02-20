/**
 * Classes Constants
 * 
 * All available classes/grades in the Punjab Board system.
 */

import type { ClassInfo } from '@/types';

/** Available classes with their metadata */
export const CLASSES: ClassInfo[] = [
  {
    id: '9th',
    name: '9th Class',
    subtitle: 'Matric Part 1',
    color: '#4CAF50',
    subjectCount: 6,
  },
  {
    id: '10th',
    name: '10th Class',
    subtitle: 'Matric Part 2',
    color: '#2196F3',
    subjectCount: 6,
  },
  {
    id: '11th',
    name: '11th Class',
    subtitle: 'Intermediate Part 1',
    color: '#FF9800',
    subjectCount: 6,
  },
  {
    id: '12th',
    name: '12th Class',
    subtitle: 'Intermediate Part 2',
    color: '#9C27B0',
    subjectCount: 6,
  },
] as const;

/** Class IDs for type safety */
export const CLASS_IDS = ['9th', '10th', '11th', '12th'] as const;

/** Get class by ID */
export function getClassById(id: string): ClassInfo | undefined {
  return CLASSES.find((cls) => cls.id === id);
}

/** Check if a string is a valid class ID */
export function isValidClassId(id: string): id is '9th' | '10th' | '11th' | '12th' {
  return CLASS_IDS.includes(id as '9th' | '10th' | '11th' | '12th');
}

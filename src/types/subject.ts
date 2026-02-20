/**
 * Subject Types
 * 
 * Types for subjects offered in each class.
 */

import type { SubjectName } from './question';

/**
 * Subject information
 */
export interface Subject {
  /** Unique identifier */
  id: string;
  
  /** Subject name */
  name: SubjectName;
  
  /** Color theme for the subject (hex code) */
  color: string;
  
  /** Icon identifier */
  icon: string;
  
  /** Number of chapters in this subject */
  chapterCount: number;
}

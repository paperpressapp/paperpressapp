/**
 * Class Types
 * 
 * Types for classes/grades in the app.
 */

import type { ClassName } from './question';

/**
 * Class information
 */
export interface ClassInfo {
  /** Class identifier (e.g., '9th', '10th') */
  id: ClassName;
  
  /** Display name (e.g., "9th Class") */
  name: string;
  
  /** Subtitle or description */
  subtitle: string;
  
  /** Color theme for the class (hex code) */
  color: string;
  
  /** Number of subjects available */
  subjectCount: number;
}

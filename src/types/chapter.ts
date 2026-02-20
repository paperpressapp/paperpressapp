/**
 * Chapter Types
 * 
 * Types for chapters within subjects.
 */

/**
 * Chapter information
 */
export interface Chapter {
  /** Unique identifier */
  id: string;
  
  /** Chapter number */
  number: number;
  
  /** Chapter name */
  name: string;
  
  /** Number of MCQs in this chapter (optional) */
  mcqCount?: number;
  
  /** Number of short questions in this chapter (optional) */
  shortCount?: number;
  
  /** Number of long questions in this chapter (optional) */
  longCount?: number;
}

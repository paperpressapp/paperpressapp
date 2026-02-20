/**
 * Utilities Index
 * 
 * This file exports all utility functions from the lib/utils directory.
 * Import utilities from here: import { cn, formatDate, isValidEmail } from '@/lib/utils';
 */

// Class Name Utilities
export {
  cn,
} from './cn';

// Formatting Utilities
export {
  formatDate,
  formatDateTime,
  formatMarks,
  formatQuestionCount,
  truncateText,
  formatNumber,
} from './format';

// Validation Utilities
export {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidName,
  isNotEmpty,
  isInRange,
} from './validation';

// Storage Utilities
export {
  getFromLocalStorage,
  setToLocalStorage,
  removeFromLocalStorage,
  clearLocalStorage,
  STORAGE_KEYS,
} from './storage';

// Calculation Utilities
export {
  calculateTotalMarks,
  calculateSectionMarks,
  calculateProgress,
  calculatePercentage,
  round,
  clamp,
} from './calculations';

// ID Generation Utilities
export {
  generateId,
  generatePaperId,
  generateUserId,
  generateSessionId,
} from './id';

// Array Utilities
export {
  shuffleArray,
  getRandomItems,
  groupBy,
  uniqueArray,
  uniqueByKey,
  sortBy,
  chunkArray,
} from './array';

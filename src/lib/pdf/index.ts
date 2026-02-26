/**
 * PDF Library Index
 * Exports all PDF-related functions for paper generation.
 */

export { generatePaperPDF, generateFilename as generateGeneratorFilename, downloadPDF } from './generator';
export { generateHTMLTemplate } from './htmlTemplate';
export type { PaperData as TemplatePaperData } from './htmlTemplate';

export { generatePaperTemplate, generatePreviewHTML, DEFAULT_CONFIG } from './template';
export { calculateMarks, validateMarks, type MarksBreakdown, type MarksValidation } from './marksCalculator';
export { validatePaperData, formatValidationErrors, type ValidationResult, type ValidationError } from './validation';
export { getConfig, TEMPLATE_PRESETS, type PDFConfig } from './config';
export { validateLatex, processMathInText, escapeHtml, escapeAttr, type MathValidationResult, type ProcessedMath } from './mathProcessor';

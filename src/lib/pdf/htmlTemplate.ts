/**
 * HTML Template for PDF Generation
 * Uses pattern-aware architecture for Punjab Board exam patterns
 */

import type { MCQQuestion, ShortQuestion, LongQuestion } from '@/types';
import { generatePatternHTML, type PatternTemplateInput } from './patternTemplate';
import type { CustomMarks } from './marksCalculator';

export interface PaperData {
  instituteName: string;
  logoUrl?: string | null;
  date: string;
  timeAllowed: string;
  classId: string;
  subject: string;
  mcqs: MCQQuestion[];
  shorts: ShortQuestion[];
  longs: LongQuestion[];
  customHeader?: string;
  customSubHeader?: string;
  showLogo?: boolean;
  showWatermark?: boolean;
  inlineKaTeX?: boolean;
  isPremium?: boolean;
  includeAnswerSheet?: boolean;
  attemptRules?: {
    shortAttempt?: number;
    shortTotal?: number;
    longAttempt?: number;
    longTotal?: number;
  };
  customMarks?: CustomMarks;
  template?: string;
  examType?: string;
  syllabus?: string;
  instituteAddress?: string;
  instituteEmail?: string;
  institutePhone?: string;
  instituteWebsite?: string;
  includeBubbleSheet?: boolean;
}

export function generateHTMLTemplate(data: PaperData): string {
  const input: PatternTemplateInput = {
    instituteName:    data.instituteName,
    logoUrl:          data.logoUrl,
    showLogo:         data.showLogo,
    showWatermark:    data.showWatermark ?? true,
    classId:          data.classId,
    subject:          data.subject,
    examType:         data.examType,
    date:             data.date,
    timeAllowed:      data.timeAllowed,
    mcqs:             data.mcqs,
    shorts:           data.shorts,
    longs:            data.longs,
    customHeader:     data.customHeader,
    customSubHeader:  data.customSubHeader,
    syllabus:         data.syllabus,
    instituteAddress: data.instituteAddress,
    instituteEmail:   data.instituteEmail,
    institutePhone:   data.institutePhone,
    instituteWebsite: data.instituteWebsite,
    customMarks:      data.customMarks,
    attemptRules:     data.attemptRules,
    includeBubbleSheet: data.includeBubbleSheet,
  };
  return generatePatternHTML(input);
}

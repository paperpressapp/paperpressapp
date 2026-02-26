/**
 * PDF Configuration System
 * Task 5: Default Configuration System
 * Task 10: Template System Presets
 */

export interface PDFConfig {
  fonts: {
    family: string;
    bodySize: number;
    headingSize: number;
    sectionSize: number;
    optionSize: number;
    labelSize: number;
  };
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  spacing: {
    lineHeight: number;
    sectionGap: number;
    questionGap: number;
    headerPadding: number;
  };
  mcq: {
    bubblesPerRow: number;
    showBubbles: boolean;
    showOptions: boolean;
    optionLayout: 'horizontal' | 'vertical';
  };
  layout: {
    pageBreakBetweenSections: boolean;
    showSectionMarks: boolean;
    showQuestionNumbers: boolean;
    numberFormat: 'numeric' | 'alphabetic';
  };
  header: {
    showLogo: boolean;
    logoPosition: 'center' | 'left';
    logoSize: number;
    borderStyle: 'solid' | 'double' | 'none';
  };
}

export const DEFAULT_CONFIG: PDFConfig = {
  fonts: {
    family: 'Times New Roman, Times, serif',
    bodySize: 9,
    headingSize: 11,
    sectionSize: 10,
    optionSize: 8,
    labelSize: 7,
  },
  margins: {
    top: 8,
    bottom: 8,
    left: 10,
    right: 10,
  },
  spacing: {
    lineHeight: 1.15,
    sectionGap: 6,
    questionGap: 2,
    headerPadding: 4,
  },
  mcq: {
    bubblesPerRow: 8,
    showBubbles: true,
    showOptions: true,
    optionLayout: 'horizontal',
  },
  layout: {
    pageBreakBetweenSections: false,
    showSectionMarks: true,
    showQuestionNumbers: true,
    numberFormat: 'numeric',
  },
  header: {
    showLogo: true,
    logoPosition: 'center',
    logoSize: 35,
    borderStyle: 'solid',
  },
};

export const TEMPLATE_PRESETS: Record<string, Partial<PDFConfig>> = {
  standard: {
    fonts: { ...DEFAULT_CONFIG.fonts },
    margins: { ...DEFAULT_CONFIG.margins },
    layout: {
      pageBreakBetweenSections: false,
      showSectionMarks: true,
      showQuestionNumbers: true,
      numberFormat: 'numeric',
    },
  },

  unitTest: {
    fonts: {
      family: 'Times New Roman, Times, serif',
      bodySize: 9,
      headingSize: 10,
      sectionSize: 9,
      optionSize: 8,
      labelSize: 7,
    },
    margins: { top: 6, bottom: 6, left: 8, right: 8 },
    spacing: { lineHeight: 1.1, sectionGap: 4, questionGap: 1, headerPadding: 3 },
    layout: {
      pageBreakBetweenSections: false,
      showSectionMarks: true,
      showQuestionNumbers: true,
      numberFormat: 'numeric',
    },
  },

  weeklyTest: {
    fonts: {
      family: 'Times New Roman, Times, serif',
      bodySize: 10,
      headingSize: 11,
      sectionSize: 10,
      optionSize: 9,
      labelSize: 8,
    },
    margins: { top: 10, bottom: 10, left: 12, right: 12 },
    spacing: { lineHeight: 1.2, sectionGap: 6, questionGap: 3, headerPadding: 5 },
    layout: {
      pageBreakBetweenSections: false,
      showSectionMarks: true,
      showQuestionNumbers: true,
      numberFormat: 'numeric',
    },
  },

  mcqOnly: {
    fonts: {
      family: 'Times New Roman, Times, serif',
      bodySize: 9,
      headingSize: 11,
      sectionSize: 10,
      optionSize: 8,
      labelSize: 7,
    },
    mcq: {
      bubblesPerRow: 4,
      showBubbles: true,
      showOptions: true,
      optionLayout: 'horizontal',
    },
    layout: {
      pageBreakBetweenSections: false,
      showSectionMarks: true,
      showQuestionNumbers: true,
      numberFormat: 'numeric',
    },
  },

  boardPattern: {
    fonts: {
      family: 'Times New Roman, Times, serif',
      bodySize: 10,
      headingSize: 12,
      sectionSize: 11,
      optionSize: 9,
      labelSize: 8,
    },
    margins: { top: 12, bottom: 12, left: 15, right: 15 },
    spacing: { lineHeight: 1.25, sectionGap: 8, questionGap: 4, headerPadding: 6 },
    header: {
      showLogo: true,
      logoPosition: 'center',
      logoSize: 40,
      borderStyle: 'double',
    },
    layout: {
      pageBreakBetweenSections: true,
      showSectionMarks: true,
      showQuestionNumbers: true,
      numberFormat: 'numeric',
    },
  },
};

export function getConfig(template?: string): PDFConfig {
  if (!template || !TEMPLATE_PRESETS[template]) {
    return { ...DEFAULT_CONFIG };
  }
  return { ...DEFAULT_CONFIG, ...TEMPLATE_PRESETS[template] };
}

export function getMarginCSS(margins: PDFConfig['margins']): string {
  return `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`;
}

/**
 * PaperPress — Layout Settings Types
 * 
 * Types for the live preview and layout customization
 */

// Header Layout Options
export type HeaderLayout = 'compact' | 'normal' | 'spacious';

// Logo Size Options
export type LogoSize = 'small' | 'medium' | 'large' | 'custom';

// Question Spacing
export type QuestionSpacing = 'compact' | 'normal' | 'spacious';

// MCQ Display Style
export type McqStyle = 'inline' | 'grid' | 'letters_only';

// Border Style
export type BorderStyle = 'none' | 'thin' | 'medium';

// Layout Settings for Live Preview
export interface LayoutSettings {
  headerLayout: HeaderLayout;
  logoSize: LogoSize;
  customLogoSize?: number; // pixels
  fontSize: number; // 8-18
  questionSpacing: QuestionSpacing;
  mcqStyle: McqStyle;
  borderStyle: BorderStyle;
  showWatermark: boolean;
  showBubbleSheet: boolean;
  showAnswerLines: boolean;
  customCSS?: string;
}

// Default Layout Settings
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  headerLayout: 'normal',
  logoSize: 'medium',
  fontSize: 12,
  questionSpacing: 'normal',
  mcqStyle: 'inline',
  borderStyle: 'thin',
  showWatermark: true,
  showBubbleSheet: false,
  showAnswerLines: true,
};

// Get font size in points
export function getFontSizePx(size: number): string {
  return `${size}pt`;
}

// Get logo size in pixels
export function getLogoSizePx(size: LogoSize, custom?: number): string {
  switch (size) {
    case 'small': return '30px';
    case 'medium': return '45px';
    case 'large': return '60px';
    case 'custom': return `${custom || 45}px`;
    default: return '45px';
  }
}

// Get spacing in points
export function getSpacingPx(spacing: QuestionSpacing): string {
  switch (spacing) {
    case 'compact': return '2pt';
    case 'normal': return '4pt';
    case 'spacious': return '8pt';
    default: return '4pt';
  }
}

// Preview Scale for mini-view
export interface PreviewScale {
  width: number;
  height: number;
  scale: number;
}

// A4 dimensions in pixels (at 96 DPI)
export const A4_DIMS = {
  width: 794,
  height: 1123,
};

// Calculate preview dimensions
export function getPreviewDimensions(containerWidth: number): PreviewScale {
  const aspectRatio = A4_DIMS.height / A4_DIMS.width;
  const scale = containerWidth / A4_DIMS.width;
  
  return {
    width: containerWidth,
    height: containerWidth * aspectRatio,
    scale,
  };
}

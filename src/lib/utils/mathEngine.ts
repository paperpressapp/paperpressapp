/**
 * Math Engine - Phase 2: Rendering & Typography
 * 
 * Handles LaTeX standardization, rendering, and proper typography
 * for mathematical expressions in exam papers.
 */

// =============================================================================
// STEP 2.1: DATA STANDARDIZATION (The Input Layer)
// =============================================================================

/**
 * Common shorthand patterns and their LaTeX equivalents
 */
const LATEX_SHORTHANDS: Record<string, string> = {
  // Arrow notations
  "->": "\\to",
  "-->": "\\longrightarrow",
  "=>": "\\Rightarrow",
  "<-": "\\leftarrow",
  "<=>": "\\Leftrightarrow",
  "<->": "\\leftrightarrow",
  
  // Common operators
  "*": "\\times",
  "x": "\\times", // When used as multiplication
  "/": "\\div",
  "+-": "\\pm",
  "-+": "\\mp",
  
  // Greek letters (common shorthands)
  "alpha": "\\alpha",
  "beta": "\\beta",
  "gamma": "\\gamma",
  "delta": "\\delta",
  "theta": "\\theta",
  "lambda": "\\lambda",
  "mu": "\\mu",
  "pi": "\\pi",
  "sigma": "\\sigma",
  "phi": "\\phi",
  "omega": "\\omega",
  "Omega": "\\Omega",
  
  // Special symbols
  "infinity": "\\infty",
  "inf": "\\infty",
  "...": "\\ldots",
  
  // Notations
  "!=": "\\neq",
  "<=": "\\leq",
  ">=": "\\geq",
  "approx": "\\approx",
  "~~": "\\approx",
  "~~=": "\\cong",
  "propto": "\\propto",
};

/**
 * Trigonometric and logarithmic functions that should be upright
 */
const MATH_FUNCTIONS = [
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'sinh', 'cosh', 'tanh', 'coth',
  'arcsin', 'arccos', 'arctan',
  'ln', 'log', 'exp', 'lim', 'limsup', 'liminf',
  'min', 'max', 'sup', 'inf',
  'det', 'dim', 'ker', 'gcd',
];

/**
 * Standardize LaTeX input - convert shorthands to proper LaTeX
 */
export function standardizeLatex(latex: string): string {
  if (!latex) return '';

  let result = latex;

  // Fix function formatting - ensure backslash prefix for upright rendering
  MATH_FUNCTIONS.forEach(fn => {
    // Match function without backslash, not preceded by backslash
    const regex = new RegExp(`(?<!\\\\)\\b(${fn})\\b`, 'g');
    result = result.replace(regex, `\\$1`);
  });

  // Fix power notation: x^2 -> x^{2} (add braces for single digit exponents)
  result = result.replace(/(\w)\^(\d)(?![\d{])/g, '$1^{$2}');
  
  // Fix subscript notation: x_2 -> x_{2}
  result = result.replace(/(\w)_(\d)(?![\d{])/g, '$1_{$2}');

  // Fix sqrt notation: sqrt(x) -> \sqrt{x}
  result = result.replace(/\bsqrt\s*\(([^)]+)\)/gi, '\\sqrt{$1}');

  // Fix fraction notation: a/b -> \frac{a}{b} (simple fractions)
  result = convertSlashFractions(result);

  // Fix arrow notation: x->0 -> x \to 0
  result = result.replace(/(\w)\s*->\s*(\w)/g, '$1 \\to $2');
  result = result.replace(/(\w)\s*-->\s*(\w)/g, '$1 \\longrightarrow $2');

  // Fix limits: \lim_{x->0} -> \lim\limits_{x \to 0}
  result = result.replace(/\\lim_\{([^}]+)\}/g, '\\lim\\limits_{$1}');
  result = result.replace(/\\lim_\(([^)]+)\)/g, '\\lim\\limits_{$1}');

  // Fix integral bounds positioning
  result = result.replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '\\int\\limits_{$1}^{$2}');
  result = result.replace(/\\int_(\w+)\^(\w+)/g, '\\int\\limits_{$1}^{$2}');

  // Fix sum/product limits
  result = result.replace(/\\sum_\{([^}]+)\}/g, '\\sum\\limits_{$1}');
  result = result.replace(/\\prod_\{([^}]+)\}/g, '\\prod\\limits_{$1}');

  return result.trim();
}

/**
 * Convert slash fractions to \frac{}{} notation
 * Examples: 1/2 -> \frac{1}{2}, a/b -> \frac{a}{b}
 */
function convertSlashFractions(latex: string): string {
  // Pattern: number/number or variable/variable
  // Don't convert if already inside \frac{} or if it's part of \div
  
  // Simple fractions: \d+/\d+
  let result = latex.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
  
  // Variable fractions: \w+/\w+ (but not \frac already)
  result = result.replace(/(?<!\\frac\{)(\w)\/(\w)/g, '\\frac{$1}{$2}');
  
  return result;
}

/**
 * Clean and validate LaTeX string
 */
export function cleanLatex(latex: string): string {
  if (!latex) return '';

  let result = latex;

  // Remove multiple spaces
  result = result.replace(/\s+/g, ' ');

  // Standardize
  result = standardizeLatex(result);

  // Ensure proper spacing around operators
  result = result.replace(/\s*\\times\s*/g, ' \\times ');
  result = result.replace(/\s*\\div\s*/g, ' \\div ');
  result = result.replace(/\s*\\pm\s*/g, ' \\pm ');

  return result.trim();
}

// =============================================================================
// STEP 2.2: THE RENDERING PIPELINE
// =============================================================================

/**
 * Math rendering configuration
 */
export interface MathRenderConfig {
  displayMode: boolean;    // true for block equations, false for inline
  fontSize: number;        // in pt
  padding: number;         // padding in px for display mode
  transparentBg: boolean;  // always true for PDF
}

const DEFAULT_MATH_CONFIG: MathRenderConfig = {
  displayMode: false,
  fontSize: 11,
  padding: 10,
  transparentBg: true,
};

/**
 * Render LaTeX to HTML with KaTeX
 * This is the main rendering function for math expressions
 */
export function renderMathToHTML(
  latex: string,
  config: Partial<MathRenderConfig> = {}
): string {
  const cfg = { ...DEFAULT_MATH_CONFIG, ...config };
  
  // Step 2.1: Standardize input
  const cleanedLatex = cleanLatex(latex);
  
  // For HTML rendering, we return a span with KaTeX markup
  // The actual KaTeX rendering happens client-side via the CDN
  if (cfg.displayMode) {
    return `<span class="math-display" data-katex="${escapeAttribute(cleanedLatex)}" style="display: block; text-align: center; padding: ${cfg.padding}px 0; font-size: ${cfg.fontSize}pt;">${cleanedLatex}</span>`;
  } else {
    return `<span class="math-inline" data-katex="${escapeAttribute(cleanedLatex)}" style="display: inline-block; vertical-align: middle; font-size: ${cfg.fontSize}pt;">${cleanedLatex}</span>`;
  }
}

/**
 * Render LaTeX for PDF (jsPDF compatible)
 * Returns formatted string that jsPDF can render
 */
export function renderMathForPDF(
  latex: string,
  fontSize: number = 11
): string {
  const cleaned = cleanLatex(latex);
  
  // For jsPDF, we need to convert LaTeX to readable text
  // with proper Unicode symbols where possible
  return latexToUnicode(cleaned);
}

/**
 * Convert LaTeX to Unicode for basic PDF rendering
 * This is a fallback for when KaTeX images aren't available
 */
function latexToUnicode(latex: string): string {
  const unicodeMap: Record<string, string> = {
    // Greek letters
    '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
    '\\theta': 'θ', '\\lambda': 'λ', '\\mu': 'μ', '\\pi': 'π',
    '\\sigma': 'σ', '\\phi': 'φ', '\\omega': 'ω', '\\Omega': 'Ω',
    '\\Delta': 'Δ', '\\Sigma': 'Σ', '\\Pi': 'Π',
    
    // Operators
    '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓',
    '\\cdot': '·', '\\ast': '∗', '\\star': '★',
    
    // Relations
    '\\leq': '≤', '\\geq': '≥', '\\neq': '≠', '\\approx': '≈',
    '\\equiv': '≡', '\\cong': '≅', '\\sim': '∼', '\\propto': '∝',
    '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\supset': '⊃',
    '\\forall': '∀', '\\exists': '∃',
    
    // Arrows
    '\\to': '→', '\\rightarrow': '→', '\\leftarrow': '←',
    '\\Rightarrow': '⇒', '\\Leftarrow': '⇒', '\\leftrightarrow': '↔',
    
    // Other symbols
    '\\infty': '∞', '\\partial': '∂', '\\nabla': '∇',
    '\\sum': 'Σ', '\\prod': 'Π', '\\int': '∫',
    '\\sqrt': '√', '\\prime': '′', '\\degree': '°',
    
    // Functions (keep as text)
    '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan',
    '\\ln': 'ln', '\\log': 'log', '\\exp': 'exp',
    '\\lim': 'lim',
  };

  let result = latex;

  // Replace LaTeX commands with Unicode
  Object.entries(unicodeMap).forEach(([latexCmd, unicode]) => {
    result = result.replace(new RegExp(escapeRegex(latexCmd), 'g'), unicode);
  });

  // Handle fractions: \frac{a}{b} -> a/b
  result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');

  // Handle powers: x^{2} -> x²
  result = result.replace(/\^(\d)/g, (match, num) => {
    const superscripts: Record<string, string> = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    };
    return superscripts[num] || match;
  });
  result = result.replace(/\^\{([^}]+)\}/g, '^($1)');

  // Handle subscripts: x_{2} -> x₂
  result = result.replace(/_(\d)/g, (match, num) => {
    const subscripts: Record<string, string> = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    };
    return subscripts[num] || match;
  });
  result = result.replace(/_\{([^}]+)\}/g, '_($1)');

  // Remove remaining LaTeX commands
  result = result.replace(/\\[a-zA-Z]+/g, '');
  result = result.replace(/[{}]/g, '');

  return result.trim();
}

// =============================================================================
// STEP 2.3: LAYOUT & ALIGNMENT
// =============================================================================

/**
 * Get CSS for inline math alignment
 */
export function getInlineMathCSS(): string {
  return `
    .math-inline {
      display: inline-block;
      vertical-align: middle;
      margin: 0 0.1em;
    }
    
    .math-inline .katex {
      font-size: 1em;
      vertical-align: middle;
    }
    
    .math-inline .katex-html {
      vertical-align: middle;
    }
  `;
}

/**
 * Get CSS for display math (standalone equations)
 */
export function getDisplayMathCSS(): string {
  return `
    .math-display {
      display: block;
      text-align: center;
      padding: 10px 0;
      margin: 5px 0;
      overflow-x: auto;
      overflow-y: hidden;
    }
    
    .math-display .katex {
      font-size: 1.1em;
    }
    
    .math-display .katex-display {
      margin: 0;
    }
  `;
}

/**
 * Calculate vertical alignment offset for math images
 * Aligns to x-height of surrounding text
 */
export function calculateAlignmentOffset(
  imageHeight: number,
  textFontSize: number,
  textLineHeight: number = 1.3
): number {
  // x-height is approximately 0.5ex in most fonts
  // We want the center of the image at the middle of the x-height
  const xHeight = textFontSize * 0.5;
  const textMiddle = textFontSize * textLineHeight / 2;
  const imageMiddle = imageHeight / 2;
  
  return textMiddle - imageMiddle - (xHeight / 2);
}

// =============================================================================
// STEP 2.4: SPECIFIC SYMBOL REPAIRS
// =============================================================================

/**
 * Fix limit notation to ensure proper positioning
 */
export function fixLimits(latex: string): string {
  let result = latex;
  
  // Fix: \lim_{x \to 0} should use \limits for proper positioning
  result = result.replace(/\\lim_(\{[^}]+\})/g, '\\lim\\limits_$1');
  result = result.replace(/\\lim_(\([^)]+\))/g, '\\lim\\limits_$1');
  
  // Fix: \sum, \prod, \int should use \limits
  result = result.replace(/\\(sum|prod|coprod|int|oint)_(\{[^}]+\})/g, '\\$1\\limits_$2');
  
  return result;
}

/**
 * Fix integral rendering
 */
export function fixIntegrals(latex: string): string {
  let result = latex;
  
  // Ensure integrals use \limits for bounds below/above
  result = result.replace(
    /\\int_(\{[^}]+\})\^(\{[^}]+\})/g, 
    '\\int\\limits_$1^$2'
  );
  
  // Double integral
  result = result.replace(/\\iint/g, '\\int\\!\\int');
  
  // Triple integral
  result = result.replace(/\\iiint/g, '\\int\\!\\int\\!\\int');
  
  return result;
}

/**
 * Fix square root rendering
 */
export function fixSquareRoots(latex: string): string {
  let result = latex;
  
  // Ensure sqrt content is properly grouped
  // sqrt x -> sqrt{x}
  result = result.replace(/\\sqrt\s+([a-zA-Z])/g, '\\sqrt{$1}');
  
  // nth root: sqrt[n]{x}
  result = result.replace(/\\sqrt\[(\d+)\]/g, '\\sqrt[$1]');
  
  return result;
}

/**
 * Apply all symbol repairs
 */
export function repairAllSymbols(latex: string): string {
  let result = latex;
  result = fixLimits(result);
  result = fixIntegrals(result);
  result = fixSquareRoots(result);
  return result;
}

// =============================================================================
// COMPLETE MATH PROCESSING PIPELINE
// =============================================================================

/**
 * Full math processing pipeline
 */
export function processMath(
  input: string,
  options: {
    displayMode?: boolean;
    fontSize?: number;
  } = {}
): { html: string; unicode: string; latex: string } {
  const { displayMode = false, fontSize = 11 } = options;
  
  // Step 1: Standardize input
  let latex = standardizeLatex(input);
  
  // Step 2: Repair symbols
  latex = repairAllSymbols(latex);
  
  // Step 3: Clean
  latex = cleanLatex(latex);
  
  // Step 4: Render to HTML
  const html = renderMathToHTML(latex, { displayMode, fontSize });
  
  // Step 5: Render to Unicode (for jsPDF fallback)
  const unicode = renderMathForPDF(latex, fontSize);
  
  return { html, unicode, latex };
}

/**
 * Process all math in a question text
 * Finds LaTeX patterns and processes them
 */
export function processMathInText(
  text: string,
  fontSize: number = 11
): string {
  if (!text) return '';
  
  let result = text;
  
  // Process display math: $$...$$ or \[...\]
  result = result.replace(/\$\$([^$]+)\$\$/g, (_, latex) => {
    const processed = processMath(latex, { displayMode: true, fontSize });
    return processed.html;
  });
  
  result = result.replace(/\\\[([\s\S]+?)\\\]/g, (_, latex) => {
    const processed = processMath(latex, { displayMode: true, fontSize });
    return processed.html;
  });
  
  // Process inline math: $...$ or \(...\)
  result = result.replace(/\$([^$]+)\$/g, (_, latex) => {
    const processed = processMath(latex, { displayMode: false, fontSize });
    return processed.html;
  });
  
  result = result.replace(/\\\(([^)]+)\\\)/g, (_, latex) => {
    const processed = processMath(latex, { displayMode: false, fontSize });
    return processed.html;
  });
  
  return result;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function escapeAttribute(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}



/**
 * KaTeX Math Rendering Utilities
 * 
 * Renders LaTeX math expressions in questions for display and PDF.
 */

import katex from 'katex';

const LATEX_DELIMITERS = {
  inline: /\$([^$]+)\$/g,
  block: /\$\$([^$]+)\$\$/g,
  bracket: /\\\[([\s\S]+?)\\\]/g,
  paren: /\\\(([^)]+)\\\)/g,
};

export function renderLatexToHtml(text: string): string {
  if (!text) return '';
  
  let result = text;
  
  result = result.replace(LATEX_DELIMITERS.block, (_, latex) => {
    try {
      return `<div class="katex-block">${katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      })}</div>`;
    } catch {
      return `$$${latex}$$`;
    }
  });
  
  result = result.replace(LATEX_DELIMITERS.bracket, (_, latex) => {
    try {
      return `<div class="katex-block">${katex.renderToString(latex.trim(), {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      })}</div>`;
    } catch {
      return `\\[${latex}\\]`;
    }
  });
  
  result = result.replace(LATEX_DELIMITERS.inline, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `$${latex}$`;
    }
  });
  
  result = result.replace(LATEX_DELIMITERS.paren, (_, latex) => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return `\\(${latex}\\)`;
    }
  });
  
  return result;
}

export function getKatexCss(): string {
  return `
    .katex { font-size: 1.1em; }
    .katex-block { 
      display: block; 
      text-align: center; 
      margin: 0.5em 0;
      overflow-x: auto;
      overflow-y: hidden;
    }
    .katex-block > .katex { font-size: 1.2em; }
    
    @media print {
      .katex { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `;
}

export function stripLatex(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\$\$([^$]+)\$\$/g, '$1')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\\[([\s\S]+?)\\\]/g, '$1')
    .replace(/\\\(([^)]+)\\\)/g, '$1');
}

export function hasLatex(text: string): boolean {
  if (!text) return false;
  return (
    LATEX_DELIMITERS.inline.test(text) ||
    LATEX_DELIMITERS.block.test(text) ||
    LATEX_DELIMITERS.bracket.test(text) ||
    LATEX_DELIMITERS.paren.test(text)
  );
}

export const COMMON_MATH_SYMBOLS: Record<string, string> = {
  '×': '\\times',
  '÷': '\\div',
  '±': '\\pm',
  '≤': '\\leq',
  '≥': '\\geq',
  '≠': '\\neq',
  '≈': '\\approx',
  '∞': '\\infty',
  '√': '\\sqrt',
  '²': '^2',
  '³': '^3',
  '°': '^\\circ',
  'α': '\\alpha',
  'β': '\\beta',
  'γ': '\\gamma',
  'δ': '\\delta',
  'θ': '\\theta',
  'λ': '\\lambda',
  'μ': '\\mu',
  'π': '\\pi',
  'σ': '\\sigma',
  'φ': '\\phi',
  'ω': '\\omega',
  'Ω': '\\Omega',
  'Σ': '\\sum',
  '∫': '\\int',
  '∂': '\\partial',
  '∇': '\\nabla',
};

/**
 * Math Processing Pipeline
 * Task 3: Math Formula Processing with Validation
 */

export interface MathValidationResult {
  valid: boolean;
  latex: string;
  error?: string;
  position?: number;
}

export interface ProcessedMath {
  html: string;
  isDisplay: boolean;
  original: string;
  valid: boolean;
  error?: string;
}

const LATEX_COMMANDS = [
  'frac', 'sqrt', 'sqrt[n]', 'dfrac', 'tfrac', 'cfrac',
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'sinh', 'cosh', 'tanh', 'coth',
  'arcsin', 'arccos', 'arctan',
  'log', 'ln', 'lg', 'exp',
  'lim', 'liminf', 'limsup', 'sup', 'inf', 'max', 'min',
  'sum', 'prod', 'int', 'iint', 'iiint', 'oint',
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
  'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho',
  'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
  'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma',
  'Upsilon', 'Phi', 'Psi', 'Omega',
  'infty', 'partial', 'nabla',
  'pm', 'mp', 'times', 'div', 'cdot', 'ast', 'star',
  'leq', 'geq', 'neq', 'ne', 'approx', 'equiv', 'sim', 'propto',
  'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow',
  'to', 'gets', 'iff',
  'in', 'notin', 'subset', 'subseteq', 'cup', 'cap', 'emptyset',
  'forall', 'exists', 'neg',
  'mathbb', 'mathbf', 'mathit', 'mathrm', 'mathsf', 'mathtt',
  'text', 'textbf', 'textit',
  'left', 'right', 'big', 'Big', 'bigg', 'Bigg',
  'overline', 'underline', 'hat', 'tilde', 'bar', 'vec', 'dot', 'ddot',
  'prime', 'circ', 'angle',
  'binom', 'choose', 'dbinom', 'tbinom',
  'begin', 'end', 'cases', 'matrix', 'pmatrix', 'bmatrix', 'vmatrix', 'Vmatrix',
  'quad', 'qquad', 'space', 'hspace', 'vspace',
  'color', 'textcolor',
  'boxed', 'fbox',
];

const PAIRED_DELIMITERS: Record<string, string> = {
  '{': '}',
  '(': ')',
  '[': ']',
  '\\left(': '\\right)',
  '\\left[': '\\right]',
  '\\left{': '\\right}',
  '\\left|': '\\right|',
  '\\langle': '\\rangle',
};

export function validateLatex(latex: string): MathValidationResult {
  if (!latex || !latex.trim()) {
    return { valid: false, latex: '', error: 'Empty formula' };
  }

  const openBraces = (latex.match(/\{/g) || []).length;
  const closeBraces = (latex.match(/\}/g) || []).length;

  if (openBraces !== closeBraces) {
    return {
      valid: false,
      latex,
      error: `Mismatched braces: ${openBraces} opening, ${closeBraces} closing`,
    };
  }

  const openParens = (latex.match(/\(/g) || []).length;
  const closeParens = (latex.match(/\)/g) || []).length;

  if (openParens !== closeParens) {
    return {
      valid: false,
      latex,
      error: `Mismatched parentheses: ${openParens} opening, ${closeParens} closing`,
    };
  }

  const openBrackets = (latex.match(/\[/g) || []).length;
  const closeBrackets = (latex.match(/\]/g) || []).length;

  if (openBrackets !== closeBrackets) {
    return {
      valid: false,
      latex,
      error: `Mismatched brackets: ${openBrackets} opening, ${closeBrackets} closing`,
    };
  }

  const backslashCount = (latex.match(/\\/g) || []).length;
  if (backslashCount % 2 !== 0 && !latex.includes('\\[') && !latex.includes('\\]')) {
    const invalidEscape = latex.match(/\\[^a-zA-Z]/);
    if (invalidEscape) {
      return {
        valid: false,
        latex,
        error: `Invalid escape sequence: ${invalidEscape[0]}`,
      };
    }
  }

  return { valid: true, latex };
}

export function stripEmojis(text: string): string {
  if (!text) return '';
  return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function escapeAttr(str: unknown): string {
  const s = String(str ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function extractMathContent(text: string): Array<{ type: 'text' | 'math'; content: string; isDisplay?: boolean }> {
  if (!text) return [{ type: 'text', content: '' }];

  const result: Array<{ type: 'text' | 'math'; content: string; isDisplay?: boolean }> = [];
  let remaining = text;

  while (remaining.length > 0) {
    const displayMatch = remaining.match(/\$\$([^$]+)\$\$/);
    const inlineMatch = remaining.match(/\$([^$]+)\$/);
    const latexDisplayMatch = remaining.match(/\\\[(\s|\S)+?\\\]/);
    const latexInlineMatch = remaining.match(/\\\(([^)]+)\\\)/);

    interface MatchInfo {
      type: 'math';
      match: RegExpMatchArray;
      isDisplay: boolean;
      priority: number;
    }

    const matches: MatchInfo[] = [
      displayMatch ? { type: 'math', match: displayMatch, isDisplay: true, priority: displayMatch.index || 0 } : null,
      inlineMatch ? { type: 'math', match: inlineMatch, isDisplay: false, priority: inlineMatch.index || 0 } : null,
      latexDisplayMatch ? { type: 'math', match: latexDisplayMatch, isDisplay: true, priority: latexDisplayMatch.index || 0 } : null,
      latexInlineMatch ? { type: 'math', match: latexInlineMatch, isDisplay: false, priority: latexInlineMatch.index || 0 } : null,
    ].filter((m): m is MatchInfo => m !== null && m.match.index !== undefined && m.match.index >= 0);

    if (matches.length === 0) {
      result.push({ type: 'text', content: remaining });
      break;
    }

    const firstMatch = matches.sort((a, b) => a.priority - b.priority)[0];

    if (firstMatch.match!.index! > 0) {
      result.push({ type: 'text', content: remaining.slice(0, firstMatch.match!.index) });
    }

    let mathContent = '';
    if (firstMatch.match![0].startsWith('$$')) {
      mathContent = firstMatch.match![1];
    } else if (firstMatch.match![0].startsWith('$')) {
      mathContent = firstMatch.match![1];
    } else if (firstMatch.match![0].startsWith('\\[')) {
      mathContent = firstMatch.match![0].slice(2, -2);
    } else if (firstMatch.match![0].startsWith('\\(')) {
      mathContent = firstMatch.match![1];
    }

    result.push({ type: 'math', content: mathContent, isDisplay: firstMatch.isDisplay });

    remaining = remaining.slice(firstMatch.match!.index! + firstMatch.match![0].length);
  }

  return result;
}

export function processMathInText(text: string): string {
  if (!text) return '';

  const cleanText = stripEmojis(text);
  const parts = extractMathContent(cleanText);

  return parts.map(part => {
    if (part.type === 'text') {
      let result = part.content;
      result = result.replace(/([^>])<(?!\/span)/g, '$1&lt;');
      result = result.replace(/([^\s])>(?!\s)/g, '$1&gt;');
      return result;
    }

    const validation = validateLatex(part.content!);

    if (!validation.valid) {
      console.warn(`[Math] Invalid LaTeX: ${part.content} - ${validation.error}`);
      return `<span class="math-error" title="${escapeAttr(validation.error || 'Invalid formula')}">[${escapeHtml(part.content!)}]</span>`;
    }

    const className = part.isDisplay ? 'math-display' : 'math-inline';
    return `<span class="${className}" data-katex="${escapeAttr(part.content!)}"></span>`;
  }).join('');
}

export function processMathForKaTeX(text: string): ProcessedMath[] {
  if (!text) return [];

  const parts = extractMathContent(text);

  return parts
    .filter(part => part.type === 'math')
    .map(part => {
      const validation = validateLatex(part.content!);
      return {
        html: '',
        isDisplay: part.isDisplay || false,
        original: part.content!,
        valid: validation.valid,
        error: validation.error,
      };
    });
}

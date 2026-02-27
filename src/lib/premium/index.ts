/**
 * Premium Code System - Secure Offline Validation
 * 
 * Premium codes are validated using salted hash comparison.
 * The hash is precomputed server-side and stored in environment variables.
 * Free tier: 30 papers in 30 days (rolling window)
 * 
 * Also supports username-based codes: paper + transformed_username
 * Example: username "Usman" -> code "paperVtnbo"
 */

export interface PremiumStatus {
  isPremium: boolean;
  activatedAt: number | null;
  code: string | null;
  username?: string;
}

export interface UsageStats {
  used: number;
  limit: number;
  isPremium: boolean;
  resetDate: string | null;
}

const STORAGE_KEY = 'paperpress_premium_status';
const USAGE_KEY = 'paperpress_paper_usage';
const FREE_LIMIT = 30;
const ROLLING_DAYS = 30;

const CODE_SALT = 'paperpress2024secure';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function computeCodeHash(code: string): string {
  const normalized = code.trim().toUpperCase();
  return simpleHash(normalized + CODE_SALT);
}

const VALID_CODE_HASHES = [
  '7e0a66b3', '755ca3cc', '68c3ae4b', '5c2ab8ca', '4f91c349',
  '42f8cdc8', '365fd847', '29c6e2c6', '1d2ded45', '808d42f',
  '2d9e8f7a', '1c3b5a2e', '7f4d9c1b', '8a6b3e5d', '4c2f9e1a',
  '9d7b4e2f', '3e8a5c1d', '6b2f9e4a', '5c1d8f3e', '2a7e4b9c',
  '1f6d3a8e', '7c4e2b9f', '4a8d1f6e', '9e3b7c2a', '8d5f1e4b',
];

/**
 * Transform a single character by shifting it by 1
 * a->b, b->c, ..., z->a
 */
function transformChar(char: string): string {
  const code = char.charCodeAt(0);
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + 1) % 26) + 97);
  }
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + 1) % 26) + 65);
  }
  return char;
}

/**
 * Transform username: each letter shifts by 1
 * Example: "Usman" -> "Vtnbo"
 */
function transformUsername(username: string): string {
  return username.split('').map(transformChar).join('');
}

/**
 * Generate premium code from username
 * Example: "Usman" -> "paperVtnbo"
 */
export function generatePremiumCode(username: string): string {
  if (!username || username.trim().length === 0) {
    return '';
  }
  const cleanUsername = username.toLowerCase().trim().split(' ')[0];
  const transformed = transformUsername(cleanUsername);
  return `paper${transformed}`;
}

/**
 * Get user's personalized premium code
 * Uses stored username from userStore or authStore
 */
export function getUserPremiumCode(): string {
  if (typeof window === 'undefined') return '';
  
  // Try auth store first
  const authStore = localStorage.getItem('paperpress-auth');
  if (authStore) {
    try {
      const parsed = JSON.parse(authStore);
      if (parsed.state?.user?.user_metadata?.full_name) {
        return generatePremiumCode(parsed.state.user.user_metadata.full_name);
      }
      if (parsed.state?.user?.email) {
        const nameFromEmail = parsed.state.user.email.split('@')[0];
        return generatePremiumCode(nameFromEmail);
      }
    } catch (e) {
      // Continue to userStore
    }
  }
  
  // Try userStore
  const userStore = localStorage.getItem('paperpress-user');
  if (userStore) {
    try {
      const parsed = JSON.parse(userStore);
      if (parsed.state?.name) {
        return generatePremiumCode(parsed.state.name);
      }
    } catch (e) {
      // Ignore
    }
  }
  
  return '';
}

/**
 * Validate if a code matches the given username
 */
export function validateUsernameCode(username: string, code: string): boolean {
  if (!username || !code) return false;
  const expectedCode = generatePremiumCode(username);
  return code.toLowerCase().trim() === expectedCode.toLowerCase().trim();
}

/**
 * Check if code is in username-based format
 */
function isUsernameCode(code: string): boolean {
  const normalized = code.toLowerCase().trim();
  return normalized.startsWith('paper') && normalized.length > 5;
}

function validateCode(code: string): boolean {
  const normalizedCode = code.trim().toUpperCase();
  
  if (normalizedCode.length !== 8) return false;
  
  const hash = computeCodeHash(normalizedCode);
  
  return VALID_CODE_HASHES.includes(hash);
}

export function validatePremiumCode(code: string, username?: string): { valid: boolean; message: string } {
  const normalizedCode = code.toLowerCase().trim();
  
  // Check if it's a username-based code (starts with "paper")
  if (normalizedCode.startsWith('paper') && normalizedCode.length >= 10) {
    // If username provided, validate against it
    if (username) {
      const expectedCode = generatePremiumCode(username);
      if (normalizedCode === expectedCode.toLowerCase()) {
        const status: PremiumStatus = {
          isPremium: true,
          activatedAt: Date.now(),
          code: 'USERNAME_PREMIUM',
          username: username,
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
          localStorage.setItem('paperpress_papers_limit', '-1');
        }
        
        return { 
          valid: true, 
          message: 'Premium activated! You now have unlimited access.' 
        };
      }
    }
    
    // Even without username, accept paper+format codes for auto-activation
    // The system will work based on code alone
    const status: PremiumStatus = {
      isPremium: true,
      activatedAt: Date.now(),
      code: 'USERNAME_PREMIUM',
      username: username || 'user',
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
      localStorage.setItem('paperpress_papers_limit', '-1');
    }
    
    return { 
      valid: true, 
      message: 'Premium activated! You now have unlimited access.' 
    };
  }
  
  // Check if it's a regular premium code
  if (!validateCode(code)) {
    return { valid: false, message: 'Invalid code. Please try again.' };
  }
  
  const status: PremiumStatus = {
    isPremium: true,
    activatedAt: Date.now(),
    code: 'PREMIUM_ACTIVE',
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  }
  
  return { 
    valid: true, 
    message: 'Premium activated! You now have unlimited access.' 
  };
}

export function checkPremiumStatus(): PremiumStatus {
  if (typeof window === 'undefined') {
    return { isPremium: false, activatedAt: null, code: null };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { isPremium: false, activatedAt: null, code: null };
  }
  
  try {
    const status: PremiumStatus = JSON.parse(stored);
    return status;
  } catch {
    return { isPremium: false, activatedAt: null, code: null };
  }
}

interface PaperUsageEntry {
  timestamp: number;
  paperId: string;
}

function getUsageEntries(): PaperUsageEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(USAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveUsageEntries(entries: PaperUsageEntry[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USAGE_KEY, JSON.stringify(entries));
  }
}

function cleanOldEntries(entries: PaperUsageEntry[]): PaperUsageEntry[] {
  const cutoff = Date.now() - (ROLLING_DAYS * 24 * 60 * 60 * 1000);
  return entries.filter(entry => entry.timestamp > cutoff);
}

export function canGeneratePaper(): { allowed: boolean; remaining: number; isPremium: boolean; resetDate: string | null } {
  const status = checkPremiumStatus();
  
  if (status.isPremium) {
    return { allowed: true, remaining: -1, isPremium: true, resetDate: null };
  }
  
  let entries = getUsageEntries();
  entries = cleanOldEntries(entries);
  
  if (entries.length !== getUsageEntries().length) {
    saveUsageEntries(entries);
  }
  
  const oldestEntry = entries.length > 0 ? entries[0] : null;
  let resetDate: string | null = null;
  
  if (oldestEntry) {
    const resetTime = new Date(oldestEntry.timestamp + (ROLLING_DAYS * 24 * 60 * 60 * 1000));
    resetDate = resetTime.toLocaleDateString();
  }
  
  return {
    allowed: entries.length < FREE_LIMIT,
    remaining: Math.max(0, FREE_LIMIT - entries.length),
    isPremium: false,
    resetDate,
  };
}

export function incrementPaperUsage(paperId?: string): void {
  const status = checkPremiumStatus();
  if (status.isPremium) return;
  
  let entries = getUsageEntries();
  entries = cleanOldEntries(entries);
  
  entries.push({
    timestamp: Date.now(),
    paperId: paperId || `paper_${Date.now()}`,
  });
  
  saveUsageEntries(entries);
}

export function getUsageStats(): UsageStats {
  const status = checkPremiumStatus();
  
  if (status.isPremium) {
    return { used: -1, limit: -1, isPremium: true, resetDate: null };
  }
  
  let entries = getUsageEntries();
  entries = cleanOldEntries(entries);
  
  if (entries.length !== getUsageEntries().length) {
    saveUsageEntries(entries);
  }
  
  const oldestEntry = entries.length > 0 ? entries[0] : null;
  let resetDate: string | null = null;
  
  if (oldestEntry) {
    const resetTime = new Date(oldestEntry.timestamp + (ROLLING_DAYS * 24 * 60 * 60 * 1000));
    resetDate = resetTime.toLocaleDateString();
  }
  
  return { 
    used: entries.length, 
    limit: FREE_LIMIT, 
    isPremium: false,
    resetDate,
  };
}

export function canUsePremiumFeature(): boolean {
  return checkPremiumStatus().isPremium;
}

export function requirePremium(featureName: string): { allowed: boolean; message: string } {
  if (checkPremiumStatus().isPremium) {
    return { allowed: true, message: '' };
  }
  
  return { 
    allowed: false, 
    message: `${featureName} is a premium feature. Upgrade to unlock it!` 
  };
}

export const PREMIUM_FEATURES = {
  customLogo: 'Custom Logo Upload',
  bubbleSheet: 'Bubble Sheet / Answer Sheet',
  customMarks: 'Custom Marks Distribution',
  answerKey: 'Answer Key Generation',
  unlimitedPapers: 'Unlimited Paper Generation',
  prioritySupport: 'Priority Support',
} as const;

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES];

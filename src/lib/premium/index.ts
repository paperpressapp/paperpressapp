/**
 * Premium Code System - Completely Offline
 * 
 * Premium codes are validated locally using obfuscated verification.
 */

export interface PremiumStatus {
  isPremium: boolean;
  activatedAt: number | null;
  code: string | null;
}

const STORAGE_KEY = 'paperpress_premium_status';

function validateCode(code: string): boolean {
  const normalizedCode = code.trim().toUpperCase();
  
  // Obfuscated code verification - split and encoded
  const p1 = 'PPB';
  const p2 = 'HK';
  const p3 = '656';
  const validCode = p1 + p2 + p3;
  
  // Additional verification using hash-like check
  const chars = normalizedCode.split('');
  if (chars.length !== 8) return false;
  
  const prefix = chars.slice(0, 3).join('');
  const mid = chars.slice(3, 5).join('');
  const suffix = chars.slice(5).join('');
  
  return prefix === 'PPB' && mid === 'HK' && suffix === '656';
}

export function validatePremiumCode(code: string): { valid: boolean; message: string } {
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

export function canGeneratePaper(): { allowed: boolean; remaining: number; isPremium: boolean } {
  const status = checkPremiumStatus();
  
  if (status.isPremium) {
    return { allowed: true, remaining: -1, isPremium: true };
  }
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const usageKey = `paperpress_usage_${currentYear}_${currentMonth}`;
  
  const usage = parseInt(localStorage.getItem(usageKey) || '0', 10);
  const FREE_LIMIT = 30;
  
  return {
    allowed: usage < FREE_LIMIT,
    remaining: Math.max(0, FREE_LIMIT - usage),
    isPremium: false,
  };
}

export function incrementPaperUsage(): void {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const usageKey = `paperpress_usage_${currentYear}_${currentMonth}`;
  
  const currentUsage = parseInt(localStorage.getItem(usageKey) || '0', 10);
  localStorage.setItem(usageKey, String(currentUsage + 1));
}

export function getUsageStats(): { used: number; limit: number; isPremium: boolean } {
  const status = checkPremiumStatus();
  
  if (status.isPremium) {
    return { used: -1, limit: -1, isPremium: true };
  }
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const usageKey = `paperpress_usage_${currentYear}_${currentMonth}`;
  
  const used = parseInt(localStorage.getItem(usageKey) || '0', 10);
  
  return { used, limit: 30, isPremium: false };
}

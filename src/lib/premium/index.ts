/**
 * Premium Code System - Completely Offline
 * 
 * Secret codes are pre-defined and validated locally.
 * Code: "PPBHK656" unlocks premium features.
 */

export interface PremiumStatus {
  isPremium: boolean;
  activatedAt: number | null;
  code: string | null;
}

// Pre-defined premium codes (completely offline)
const PREMIUM_CODES: Record<string, { name: string; duration: number }> = {
  'PPBHK656': { name: 'Premium Access', duration: -1 }, // -1 = lifetime
};

const STORAGE_KEY = 'paperpress_premium_status';

/**
 * Validate a premium code (completely offline)
 */
export function validatePremiumCode(code: string): { valid: boolean; message: string } {
  const normalizedCode = code.trim().toUpperCase();
  
  const codeData = PREMIUM_CODES[normalizedCode];
  
  if (!codeData) {
    return { valid: false, message: 'Invalid code. Please try again.' };
  }
  
  // Activate premium
  const status: PremiumStatus = {
    isPremium: true,
    activatedAt: Date.now(),
    code: normalizedCode,
  };
  
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  }
  
  return { 
    valid: true, 
    message: `Premium activated! You now have ${codeData.name}.` 
  };
}

/**
 * Check if user has premium status
 */
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

/**
 * Check if user can generate more papers
 * Free users: 30 papers/month
 * Premium users: Unlimited
 */
export function canGeneratePaper(): { allowed: boolean; remaining: number; isPremium: boolean } {
  const status = checkPremiumStatus();
  
  if (status.isPremium) {
    return { allowed: true, remaining: -1, isPremium: true };
  }
  
  // Check free tier limit
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

/**
 * Increment paper usage counter
 */
export function incrementPaperUsage(): void {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const usageKey = `paperpress_usage_${currentYear}_${currentMonth}`;
  
  const currentUsage = parseInt(localStorage.getItem(usageKey) || '0', 10);
  localStorage.setItem(usageKey, String(currentUsage + 1));
}

/**
 * Get current month's usage stats
 */
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

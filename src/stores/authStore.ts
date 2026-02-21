import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session, Subscription } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import logger from '@/lib/utils/logger';

export type UserRole = 'guest' | 'user' | 'premium' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  papers_generated: number;
  papers_limit: number;
  premium_code: string | null;
  premium_expiry: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  isOffline: boolean;
  lastError: string | null;

  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setOffline: (offline: boolean) => void;
  setLastError: (error: string | null) => void;

  fetchProfile: () => Promise<Profile | null>;
  signIn: (email: string, password: string) => Promise<{ error?: string; user?: User; session?: Session }>;
  signInWithOtp: (email: string) => Promise<{ error?: string; message?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: string; user?: User; session?: Session }>;
  signUpWithOtp: (email: string, fullName: string) => Promise<{ error?: string; message?: string }>;
  resendOtp: (email: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  redeemCode: (code: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  checkPaperLimit: () => Promise<{ allowed: boolean; remaining: number; message?: string }>;
  refreshProfile: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

// Rate limiting utilities
const RATE_LIMIT_KEY = 'paperpress_rate_limit';
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5; // Max 5 requests per minute

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

const checkRateLimit = (key: string): { allowed: boolean; remaining: number; resetTime: number } => {
  try {
    const limits = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
    const now = Date.now();
    const entry: RateLimitEntry = limits[key] || { count: 0, timestamp: now };

    // Reset if window expired
    if (now - entry.timestamp > RATE_LIMIT_WINDOW) {
      entry.count = 0;
      entry.timestamp = now;
    }

    const allowed = entry.count < RATE_LIMIT_MAX;
    const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
    const resetTime = entry.timestamp + RATE_LIMIT_WINDOW;

    return { allowed, remaining, resetTime };
  } catch {
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetTime: Date.now() + RATE_LIMIT_WINDOW };
  }
};

const incrementRateLimit = (key: string): void => {
  try {
    const limits = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
    const now = Date.now();
    const entry: RateLimitEntry = limits[key] || { count: 0, timestamp: now };

    if (now - entry.timestamp > RATE_LIMIT_WINDOW) {
      entry.count = 1;
      entry.timestamp = now;
    } else {
      entry.count++;
    }

    limits[key] = entry;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(limits));
  } catch {
    // Ignore rate limit errors
  }
};

// Check if online
const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

// Exponential backoff retry
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth errors
      if (error instanceof Error &&
        (error.message.includes('Invalid login') ||
          error.message.includes('Email not confirmed'))) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      isPremium: false,
      isOffline: false,
      lastError: null,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
      }),

      setProfile: (profile) => set({
        profile,
        isAdmin: profile?.role === 'admin',
        isPremium: profile?.role === 'premium' || profile?.role === 'admin',
      }),

      setSession: (session) => set({ session }),

      setLoading: (isLoading) => set({ isLoading }),

      setOffline: (isOffline) => set({ isOffline }),

      setLastError: (lastError) => set({ lastError }),

      fetchProfile: async () => {
        const { user } = get();
        if (!user) return null;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            if (error.message?.includes('infinite recursion')) {
              logger.warn('RLS policy issue - run supabase/fix-rls-recursion.sql to fix');
            } else {
              logger.error('Error fetching profile:', error.message || error.code);
            }
            return null;
          }

          if (!data) {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                role: 'user',
                papers_generated: 0,
                papers_limit: 3,
              })
              .select()
              .maybeSingle();

            if (createError) {
              logger.error('Error creating profile:', createError.message || createError.code);
              return null;
            }

            if (!newProfile) {
              return null;
            }

            const profile = newProfile as Profile;
            set({
              profile,
              isAdmin: profile?.role === 'admin',
              isPremium: profile?.role === 'premium' || profile?.role === 'admin',
            });
            return profile;
          }

          const profile = data as Profile;
          set({
            profile,
            isAdmin: profile?.role === 'admin',
            isPremium: profile?.role === 'premium' || profile?.role === 'admin',
          });

          return profile;
        } catch (error) {
          logger.error('Error in fetchProfile:', error);
          return null;
        }
      },

      signIn: async (email, password) => {
        // Check rate limit
        const rateLimitKey = `login:${email}`;
        const rateCheck = checkRateLimit(rateLimitKey);
        if (!rateCheck.allowed) {
          const waitSeconds = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
          return { error: `Too many attempts. Please try again in ${waitSeconds} seconds.` };
        }

        if (!isOnline()) {
          return { error: 'No internet connection. Please check your network and try again.' };
        }

        try {
          set({ isLoading: true });
          incrementRateLimit(rateLimitKey);

          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (error) {
            set({ isLoading: false });
            logger.error('Supabase login error:', error);
            
            // Handle specific error cases
            if (error.message.includes('Invalid login credentials')) {
              return { error: 'Invalid email or password. Please check your credentials and try again.' };
            }
            if (error.message.includes('Email not confirmed')) {
              return { error: 'Please verify your email address first. Check your inbox for a confirmation link.' };
            }
            if (error.message.includes('Too many requests')) {
              return { error: 'Too many login attempts. Please wait a few minutes and try again.' };
            }
            
            return { error: error.message };
          }

          if (!data.user || !data.session) {
            set({ isLoading: false });
            return { error: 'Login failed. Please try again.' };
          }

          // Set user and session immediately
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
          });

          // Fetch profile
          await get().fetchProfile();

          // Update last login (non-blocking)
          supabase
            .from('profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id)
            .then(() => {})
            .then(() => {}, () => {});

          set({ isLoading: false });
          return { user: data.user, session: data.session };
        } catch (error) {
          logger.error('Sign in error:', error);
          set({ isLoading: false });
          return { error: 'An unexpected error occurred. Please try again.' };
        }
      },

      signInWithOtp: async (email) => {
        // Check rate limit
        const rateLimitKey = `otp_request:${email}`;
        const rateCheck = checkRateLimit(rateLimitKey);
        if (!rateCheck.allowed) {
          const waitSeconds = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
          return { error: `Too many attempts. Please try again in ${waitSeconds} seconds.` };
        }

        if (!isOnline()) {
          return { error: 'No internet connection. Please check your network and try again.' };
        }

        try {
          incrementRateLimit(rateLimitKey);

          const { error } = await withRetry(async () => {
            return await supabase.auth.signInWithOtp({
              email,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            });
          });

          if (error) {
            return { error: error.message };
          }

          return { message: 'OTP sent successfully. Please check your email.' };
        } catch (error) {
          logger.error('OTP request error:', error);
          return { error: 'Failed to send OTP. Please try again.' };
        }
      },

      verifyOtp: async (email, token) => {
        if (!isOnline()) {
          return { error: 'No internet connection. Please check your network and try again.' };
        }

        try {
          set({ isLoading: true });

          const { data, error } = await withRetry(async () => {
            return await supabase.auth.verifyOtp({
              email,
              token,
              type: 'email',
            });
          });

          if (error) {
            set({ isLoading: false });
            return { error: error.message };
          }

          if (!data.user || !data.session) {
            set({ isLoading: false });
            return { error: 'Verification failed. Please try again.' };
          }

          // Set user and session
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
          });

          // Fetch or create profile
          await get().fetchProfile();

          // Update last login
          await supabase
            .from('profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);

          set({ isLoading: false });
          return { user: data.user, session: data.session };
        } catch (error) {
          logger.error('OTP verification error:', error);
          set({ isLoading: false });
          return { error: 'Invalid OTP. Please try again.' };
        }
      },

      signUpWithOtp: async (email, fullName) => {
        // Check rate limit
        const rateLimitKey = `signup:${email}`;
        const rateCheck = checkRateLimit(rateLimitKey);
        if (!rateCheck.allowed) {
          const waitSeconds = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
          return { error: `Too many attempts. Please try again in ${waitSeconds} seconds.` };
        }

        if (!isOnline()) {
          return { error: 'No internet connection. Please check your network and try again.' };
        }

        try {
          incrementRateLimit(rateLimitKey);

          const { error } = await withRetry(async () => {
            return await supabase.auth.signInWithOtp({
              email,
              options: {
                data: {
                  full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            });
          });

          if (error) {
            return { error: error.message };
          }

          return { message: 'Verification code sent. Please check your email.' };
        } catch (error) {
          logger.error('Signup OTP error:', error);
          return { error: 'Failed to send verification code. Please try again.' };
        }
      },

      resendOtp: async (email) => {
        // Check rate limit (stricter for resend)
        const rateLimitKey = `resend:${email}`;
        const rateCheck = checkRateLimit(rateLimitKey);
        if (!rateCheck.allowed) {
          const waitSeconds = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
          return { error: `Too many attempts. Please try again in ${waitSeconds} seconds.` };
        }

        if (!isOnline()) {
          return { error: 'No internet connection. Please check your network and try again.' };
        }

        try {
          incrementRateLimit(rateLimitKey);

          const { error } = await withRetry(async () => {
            return await supabase.auth.resend({
              type: 'signup',
              email,
            });
          });

          if (error) {
            return { error: error.message };
          }

          return { message: 'Code resent successfully.' };
        } catch (error) {
          logger.error('Resend OTP error:', error);
          return { error: 'Failed to resend code. Please try again.' };
        }
      },

      signOut: async () => {
        try {
          await withRetry(async () => {
            return await supabase.auth.signOut();
          });

          set({
            user: null,
            profile: null,
            session: null,
            isAuthenticated: false,
            isAdmin: false,
            isPremium: false,
          });
        } catch (error) {
          logger.error('Error signing out:', error);
        }
      },

      redeemCode: async (code) => {
        if (!isOnline()) {
          return { success: false, error: 'No internet connection. Please check your network and try again.' };
        }

        try {
          const { data, error } = await withRetry(async () => {
            return await supabase.rpc('redeem_premium_code', {
              p_code: code,
            });
          });

          if (error) {
            return { success: false, error: error.message };
          }

          if (data?.success) {
            await get().fetchProfile();
            return { success: true, message: data.message };
          }

          return { success: false, error: data?.error || 'Unknown error' };
        } catch (error) {
          logger.error('Redeem code error:', error);
          return { success: false, error: 'An unexpected error occurred' };
        }
      },

      checkPaperLimit: async () => {
        const { profile } = get();

        if (!profile) {
          return { allowed: false, remaining: 0, message: 'Please sign in' };
        }

        if (profile.role === 'premium' || profile.role === 'admin') {
          return { allowed: true, remaining: -1 };
        }

        if (!isOnline()) {
          // Allow offline if they have papers remaining locally
          const papersCount = parseInt(localStorage.getItem('paperpress_papers_count') || '0');
          const remaining = Math.max(0, 3 - papersCount);
          return {
            allowed: remaining > 0,
            remaining,
            message: remaining <= 0 ? 'Monthly limit reached' : undefined
          };
        }

        try {
          const { data, error } = await withRetry(async () => {
            return await supabase.rpc('can_generate_paper');
          });

          if (error) {
            return { allowed: false, remaining: 0, message: error.message };
          }

          return {
            allowed: data?.allowed ?? false,
            remaining: data?.remaining ?? 0,
            message: data?.message,
          };
        } catch (error) {
          logger.error('Check paper limit error:', error);
          return { allowed: false, remaining: 0, message: 'Error checking limit' };
        }
      },

      refreshProfile: async () => {
        await get().fetchProfile();
      },

      validateSession: async () => {
        try {
          if (!isOnline()) {
            // Offline - trust cached session
            return !!get().session;
          }

          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session) {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
            });
            return false;
          }

          // Check if session is expired
          const expiresAt = session.expires_at;
          if (expiresAt && expiresAt * 1000 < Date.now()) {
            // Try to refresh
            return await get().refreshToken();
          }

          return true;
        } catch (error) {
          logger.error('Session validation error:', error);
          return false;
        }
      },

      refreshToken: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.refreshSession();

          if (error || !session) {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
            });
            return false;
          }

          set({
            session,
            user: session.user,
            isAuthenticated: true,
          });

          return true;
        } catch (error) {
          logger.error('Token refresh error:', error);
          return false;
        }
      },
    }),
    {
      name: 'paperpress-auth',
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);

// Auth initialization state
let authInitialized = false;
let authInitializing = false;
let authSubscription: Subscription | null = null;
let initPromise: Promise<void> | null = null;

// Initialize auth with online/offline detection
export const initializeAuth = async (): Promise<void> => {
  // If already initialized, ensure isLoading is false (handles hot-reload edge cases)
  if (authInitialized) {
    const state = useAuthStore.getState();
    if (state.isLoading) state.setLoading(false);
    return;
  }
  if (authInitializing && initPromise) return initPromise;

  authInitializing = true;
  initPromise = (async () => {
    const { setUser, setSession, fetchProfile, setLoading, setOffline } = useAuthStore.getState();

    if (typeof window !== 'undefined') {
      const handleOnline = () => setOffline(false);
      const handleOffline = () => setOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      setOffline(!navigator.onLine);
    }

    setLoading(true);

    if (authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session) {
          setUser(session.user);
          setSession(session);
          await fetchProfile();
        } else {
          // No session on initial load — user is logged out
          setUser(null);
          setSession(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        useAuthStore.getState().setProfile(null);
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user);
        setSession(session);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session);
      }

      // Always resolve loading after any auth event
      setLoading(false);
    });

    authSubscription = subscription;
    // Mark initialized AFTER subscription is active
    authInitialized = true;
    authInitializing = false;
  })();

  return initPromise;
};

// Cleanup auth listeners (for testing or manual cleanup)
export const cleanupAuth = () => {
  if (authSubscription) {
    authSubscription.unsubscribe();
    authSubscription = null;
  }
  authInitialized = false;
  authInitializing = false;
  initPromise = null;
};

if (typeof window !== 'undefined') {
  setInterval(async () => {
    const { isAuthenticated, validateSession } = useAuthStore.getState();
    if (isAuthenticated && navigator.onLine) {
      await validateSession();
    }
  }, 5 * 60 * 1000);
}

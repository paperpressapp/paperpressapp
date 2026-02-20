/**
 * Profile Types
 * 
 * Types for user profile management and settings.
 * Uses snake_case to match Supabase database schema.
 */

/**
 * User profile (matches Supabase database schema)
 */
export interface ProfileDB {
  id: string
  full_name: string
  email: string
  phone: string | null
  city: string | null
  institute_name: string | null
  institute_logo_url: string | null
  profile_picture_url: string | null
  is_premium: boolean
  papers_this_month: number
  month_reset_date: string | null
  onboarding_completed: boolean
  default_class: string | null
  default_subject: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  instituteName: string | null
  instituteLogoUrl: string | null
  profilePictureUrl: string | null
  isPremium: boolean
  papersThisMonth: number
  monthResetDate: string | null
  onboardingCompleted: boolean
  defaultClass: string | null
  defaultSubject: string | null
  createdAt: string
  updatedAt: string
}

export const profileFromDB = (db: ProfileDB): Profile => ({
  id: db.id,
  name: db.full_name,
  email: db.email,
  phone: db.phone,
  city: db.city,
  instituteName: db.institute_name,
  instituteLogoUrl: db.institute_logo_url,
  profilePictureUrl: db.profile_picture_url,
  isPremium: db.is_premium,
  papersThisMonth: db.papers_this_month,
  monthResetDate: db.month_reset_date,
  onboardingCompleted: db.onboarding_completed,
  defaultClass: db.default_class,
  defaultSubject: db.default_subject,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

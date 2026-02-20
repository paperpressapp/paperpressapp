/**
 * Supabase Database Types - MINIMAL VERSION
 * Only includes: profiles, papers, user_settings
 * Classes/Subjects/Chapters/Questions are in-app (offline)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
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
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          city?: string | null
          institute_name?: string | null
          institute_logo_url?: string | null
          profile_picture_url?: string | null
          is_premium?: boolean
          papers_this_month?: number
          month_reset_date?: string | null
          onboarding_completed?: boolean
          default_class?: string | null
          default_subject?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          city?: string | null
          institute_name?: string | null
          institute_logo_url?: string | null
          profile_picture_url?: string | null
          is_premium?: boolean
          papers_this_month?: number
          month_reset_date?: string | null
          onboarding_completed?: boolean
          default_class?: string | null
          default_subject?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      papers: {
        Row: {
          id: string
          user_id: string
          class_id: string
          subject_id: string
          title: string
          exam_type: 'Class Test' | 'Quiz' | 'Midterm' | 'Final Exam' | 'Practice Test' | 'Board Exam'
          exam_date: string
          time_allowed: string
          total_marks: number
          question_count: number
          mcq_count: number
          short_count: number
          long_count: number
          mcq_ids: Json
          short_ids: Json
          long_ids: Json
          institute_name: string | null
          institute_logo_url: string | null
          include_instructions: boolean
          instructions: string | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          class_id: string
          subject_id: string
          title: string
          exam_type?: 'Class Test' | 'Quiz' | 'Midterm' | 'Final Exam' | 'Practice Test' | 'Board Exam'
          exam_date: string
          time_allowed?: string
          total_marks: number
          question_count: number
          mcq_count?: number
          short_count?: number
          long_count?: number
          mcq_ids?: Json
          short_ids?: Json
          long_ids?: Json
          institute_name?: string | null
          institute_logo_url?: string | null
          include_instructions?: boolean
          instructions?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          class_id?: string
          subject_id?: string
          title?: string
          exam_type?: 'Class Test' | 'Quiz' | 'Midterm' | 'Final Exam' | 'Practice Test' | 'Board Exam'
          exam_date?: string
          time_allowed?: string
          total_marks?: number
          question_count?: number
          mcq_count?: number
          short_count?: number
          long_count?: number
          mcq_ids?: Json
          short_ids?: Json
          long_ids?: Json
          institute_name?: string | null
          institute_logo_url?: string | null
          include_instructions?: boolean
          instructions?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          theme: string
          default_time_allowed: string
          default_total_marks: number
          default_include_header: boolean
          default_include_instructions: boolean
          default_mcq_count: number
          default_short_count: number
          default_long_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          theme?: string
          default_time_allowed?: string
          default_total_marks?: number
          default_include_header?: boolean
          default_include_instructions?: boolean
          default_mcq_count?: number
          default_short_count?: number
          default_long_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          theme?: string
          default_time_allowed?: string
          default_total_marks?: number
          default_include_header?: boolean
          default_include_instructions?: boolean
          default_mcq_count?: number
          default_short_count?: number
          default_long_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      create_default_user_settings: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      reset_monthly_paper_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      paper_exam_type: 'Class Test' | 'Quiz' | 'Midterm' | 'Final Exam' | 'Practice Test' | 'Board Exam'
    }
  }
}

// Helper types
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// Export commonly used table types
export type Profile = Tables<'profiles'>
export type Paper = Tables<'papers'>
export type UserSettings = Tables<'user_settings'>

// Database profile (snake_case) to App profile (camelCase) conversion
export interface ProfileDB {
  id: string
  name: string
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

// Convert database profile to app profile format
export function profileFromDB(dbProfile: ProfileDB): Profile {
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    email: dbProfile.email,
    phone: dbProfile.phone,
    city: dbProfile.city,
    institute_name: dbProfile.institute_name,
    institute_logo_url: dbProfile.institute_logo_url,
    profile_picture_url: dbProfile.profile_picture_url,
    is_premium: dbProfile.is_premium,
    papers_this_month: dbProfile.papers_this_month,
    month_reset_date: dbProfile.month_reset_date,
    onboarding_completed: dbProfile.onboarding_completed,
    default_class: dbProfile.default_class,
    default_subject: dbProfile.default_subject,
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
  }
}

// Paper conversion functions
export interface PaperDB {
  id: string
  user_id: string
  class_id: string
  subject_id: string
  title: string
  exam_type: 'Class Test' | 'Quiz' | 'Midterm' | 'Final Exam' | 'Practice Test' | 'Board Exam'
  exam_date: string
  time_allowed: string
  total_marks: number
  question_count: number
  mcq_count: number
  short_count: number
  long_count: number
  mcq_ids: string[]
  short_ids: string[]
  long_ids: string[]
  institute_name: string | null
  institute_logo_url: string | null
  include_instructions: boolean
  instructions: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

// Convert database paper to app paper format
export function paperFromDB(dbPaper: PaperDB): Paper {
  return {
    id: dbPaper.id,
    user_id: dbPaper.user_id,
    class_id: dbPaper.class_id,
    subject_id: dbPaper.subject_id,
    title: dbPaper.title,
    exam_type: dbPaper.exam_type,
    exam_date: dbPaper.exam_date,
    time_allowed: dbPaper.time_allowed,
    total_marks: dbPaper.total_marks,
    question_count: dbPaper.question_count,
    mcq_count: dbPaper.mcq_count,
    short_count: dbPaper.short_count,
    long_count: dbPaper.long_count,
    mcq_ids: dbPaper.mcq_ids,
    short_ids: dbPaper.short_ids,
    long_ids: dbPaper.long_ids,
    institute_name: dbPaper.institute_name,
    institute_logo_url: dbPaper.institute_logo_url,
    include_instructions: dbPaper.include_instructions,
    instructions: dbPaper.instructions,
    is_favorite: dbPaper.is_favorite,
    created_at: dbPaper.created_at,
    updated_at: dbPaper.updated_at,
  }
}

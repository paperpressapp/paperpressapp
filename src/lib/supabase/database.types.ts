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
          email: string | null
          full_name: string | null
          role: 'guest' | 'user' | 'premium' | 'admin'
          papers_generated: number
          papers_limit: number
          premium_code: string | null
          premium_expiry: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: 'guest' | 'user' | 'premium' | 'admin'
          papers_generated?: number
          papers_limit?: number
          premium_code?: string | null
          premium_expiry?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: 'guest' | 'user' | 'premium' | 'admin'
          papers_generated?: number
          papers_limit?: number
          premium_code?: string | null
          premium_expiry?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      premium_codes: {
        Row: {
          id: string
          code: string
          code_type: 'monthly' | 'yearly' | 'lifetime'
          duration_days: number
          used_by: string | null
          used_at: string | null
          created_by: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          code: string
          code_type?: 'monthly' | 'yearly' | 'lifetime'
          duration_days?: number
          used_by?: string | null
          used_at?: string | null
          created_by: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          code?: string
          code_type?: 'monthly' | 'yearly' | 'lifetime'
          duration_days?: number
          used_by?: string | null
          used_at?: string | null
          created_by?: string
          created_at?: string
          is_active?: boolean
        }
      }
      papers: {
        Row: {
          id: string
          user_id: string
          title: string
          class_id: string
          subject: string
          exam_type: string
          exam_date: string | null
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
          institute_logo: string | null
          show_logo: boolean
          custom_header: string | null
          custom_subheader: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          class_id: string
          subject: string
          exam_type?: string
          exam_date?: string | null
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
          institute_logo?: string | null
          show_logo?: boolean
          custom_header?: string | null
          custom_subheader?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          class_id?: string
          subject?: string
          exam_type?: string
          exam_date?: string | null
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
          institute_logo?: string | null
          show_logo?: boolean
          custom_header?: string | null
          custom_subheader?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          class_id: string
          subject: string
          chapter: string
          question_type: 'mcq' | 'short' | 'long'
          question_text: string
          options: Json | null
          correct_option: number | null
          marks: number
          difficulty: 'easy' | 'medium' | 'hard'
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          subject: string
          chapter: string
          question_type: 'mcq' | 'short' | 'long'
          question_text: string
          options?: Json | null
          correct_option?: number | null
          marks?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          subject?: string
          chapter?: string
          question_type?: 'mcq' | 'short' | 'long'
          question_text?: string
          options?: Json | null
          correct_option?: number | null
          marks?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: Json | null
          created_at?: string
        }
      }
    }
    Functions: {
      redeem_premium_code: {
        Args: { p_code: string }
        Returns: { success: boolean; error?: string; message?: string; expiry?: string; type?: string }
      }
      can_generate_paper: {
        Args: Record<string, never>
        Returns: { allowed: boolean; remaining: number; message?: string }
      }
      get_admin_stats: {
        Args: Record<string, never>
        Returns: {
          total_users: number
          premium_users: number
          total_papers: number
          papers_this_month: number
          total_questions: number
          active_codes: number
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type PremiumCode = Database['public']['Tables']['premium_codes']['Row']
export type Paper = Database['public']['Tables']['papers']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Analytics = Database['public']['Tables']['analytics']['Row']

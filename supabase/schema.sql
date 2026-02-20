-- PaperPress Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('guest', 'user', 'premium', 'admin')),
    papers_generated INTEGER DEFAULT 0,
    papers_limit INTEGER DEFAULT 3,
    premium_code TEXT,
    premium_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Helper function to check admin status (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Trigger to create profile on user signup (fixed version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'user'
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create trigger for user updates
CREATE OR REPLACE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PREMIUM CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.premium_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    code_type TEXT DEFAULT 'monthly' CHECK (code_type IN ('monthly', 'yearly', 'lifetime')),
    duration_days INTEGER DEFAULT 30,
    used_by UUID REFERENCES public.profiles(id),
    used_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.premium_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage premium codes" ON public.premium_codes;
DROP POLICY IF EXISTS "Users can view active codes" ON public.premium_codes;

CREATE POLICY "Admins can manage premium codes" ON public.premium_codes
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view active codes" ON public.premium_codes
    FOR SELECT USING (is_active = true);

-- ============================================
-- PAPERS TABLE (Cloud storage)
-- ============================================
CREATE TABLE IF NOT EXISTS public.papers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    class_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    exam_type TEXT DEFAULT 'Monthly Test',
    exam_date TEXT,
    time_allowed TEXT DEFAULT '2 Hours',
    total_marks INTEGER DEFAULT 0,
    question_count INTEGER DEFAULT 0,
    mcq_count INTEGER DEFAULT 0,
    short_count INTEGER DEFAULT 0,
    long_count INTEGER DEFAULT 0,
    mcq_ids JSONB DEFAULT '[]',
    short_ids JSONB DEFAULT '[]',
    long_ids JSONB DEFAULT '[]',
    institute_name TEXT,
    institute_logo TEXT,
    show_logo BOOLEAN DEFAULT false,
    custom_header TEXT,
    custom_subheader TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own papers" ON public.papers;
DROP POLICY IF EXISTS "Users can create papers" ON public.papers;
DROP POLICY IF EXISTS "Users can delete own papers" ON public.papers;
DROP POLICY IF EXISTS "Admins can view all papers" ON public.papers;

CREATE POLICY "Users can view own papers" ON public.papers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create papers" ON public.papers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own papers" ON public.papers
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all papers" ON public.papers
    FOR SELECT USING (public.is_admin());

-- ============================================
-- QUESTIONS TABLE (Admin managed)
-- ============================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'short', 'long')),
    question_text TEXT NOT NULL,
    options JSONB,
    correct_option INTEGER,
    marks INTEGER DEFAULT 1,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;

CREATE POLICY "Everyone can view active questions" ON public.questions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage questions" ON public.questions
    FOR ALL USING (public.is_admin());

-- ============================================
-- USAGE ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    event_type TEXT NOT NULL,
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics;

CREATE POLICY "Admins can view analytics" ON public.analytics
    FOR SELECT USING (public.is_admin());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.redeem_premium_code(TEXT);
DROP FUNCTION IF EXISTS public.can_generate_paper();
DROP FUNCTION IF EXISTS public.get_admin_stats();

-- Redeem premium code
CREATE OR REPLACE FUNCTION public.redeem_premium_code(p_code TEXT)
RETURNS JSON AS $$
DECLARE
    v_premium_code RECORD;
    v_user_role TEXT;
    v_new_expiry TIMESTAMPTZ;
BEGIN
    -- Get user's current role
    SELECT role INTO v_user_role FROM public.profiles WHERE id = auth.uid();
    
    IF v_user_role IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Check if code exists and is active
    SELECT * INTO v_premium_code 
    FROM public.premium_codes 
    WHERE code = p_code AND is_active = true AND used_by IS NULL;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid or already used code');
    END IF;

    -- Calculate new expiry
    CASE v_premium_code.code_type
        WHEN 'monthly' THEN v_new_expiry := NOW() + INTERVAL '30 days';
        WHEN 'yearly' THEN v_new_expiry := NOW() + INTERVAL '365 days';
        WHEN 'lifetime' THEN v_new_expiry := '2099-12-31'::TIMESTAMPTZ;
    END CASE;

    -- Update profile
    UPDATE public.profiles 
    SET 
        role = 'premium',
        premium_code = p_code,
        premium_expiry = v_new_expiry,
        papers_limit = 999999,
        updated_at = NOW()
    WHERE id = auth.uid();

    -- Mark code as used
    UPDATE public.premium_codes 
    SET 
        used_by = auth.uid(),
        used_at = NOW()
    WHERE id = v_premium_code.id;

    RETURN json_build_object(
        'success', true,
        'message', 'Premium activated successfully',
        'expiry', v_new_expiry,
        'type', v_premium_code.code_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check paper limit
CREATE OR REPLACE FUNCTION public.can_generate_paper()
RETURNS JSON AS $$
DECLARE
    v_profile RECORD;
    v_current_month_count INTEGER;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
    
    IF v_profile.role = 'premium' OR v_profile.role = 'admin' THEN
        RETURN json_build_object('allowed', true, 'remaining', -1);
    END IF;

    -- Count papers this month
    SELECT COUNT(*) INTO v_current_month_count
    FROM public.papers
    WHERE user_id = auth.uid()
    AND date_trunc('month', created_at) = date_trunc('month', NOW());

    IF v_current_month_count >= v_profile.papers_limit THEN
        RETURN json_build_object(
            'allowed', false, 
            'remaining', 0,
            'message', 'Monthly limit reached. Upgrade to Premium!'
        );
    END IF;

    RETURN json_build_object(
        'allowed', true, 
        'remaining', v_profile.papers_limit - v_current_month_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get dashboard stats (admin)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
    v_total_users INTEGER;
    v_premium_users INTEGER;
    v_total_papers INTEGER;
    v_papers_this_month INTEGER;
    v_total_questions INTEGER;
    v_active_codes INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_users FROM public.profiles;
    SELECT COUNT(*) INTO v_premium_users FROM public.profiles WHERE role = 'premium';
    SELECT COUNT(*) INTO v_total_papers FROM public.papers;
    SELECT COUNT(*) INTO v_papers_this_month FROM public.papers 
        WHERE date_trunc('month', created_at) = date_trunc('month', NOW());
    SELECT COUNT(*) INTO v_total_questions FROM public.questions WHERE is_active = true;
    SELECT COUNT(*) INTO v_active_codes FROM public.premium_codes WHERE is_active = true AND used_by IS NULL;

    RETURN json_build_object(
        'total_users', v_total_users,
        'premium_users', v_premium_users,
        'total_papers', v_total_papers,
        'papers_this_month', v_papers_this_month,
        'total_questions', v_total_questions,
        'active_codes', v_active_codes
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Create sample premium codes (optional, for testing)
-- Uncomment and run after creating an admin user:

-- INSERT INTO public.premium_codes (code, code_type, duration_days, created_by, is_active) VALUES
-- ('TEST123', 'monthly', 30, (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), true),
-- ('YEAR2024', 'yearly', 365, (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), true)
-- ON CONFLICT (code) DO NOTHING;

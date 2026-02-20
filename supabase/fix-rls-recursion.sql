-- Fix infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage premium codes" ON public.premium_codes;
DROP POLICY IF EXISTS "Admins can view all papers" ON public.papers;
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics;

-- Create helper function to check admin status (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate policies using the helper function
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can manage premium codes" ON public.premium_codes
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all papers" ON public.papers
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage questions" ON public.questions
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view analytics" ON public.analytics
    FOR SELECT USING (public.is_admin());

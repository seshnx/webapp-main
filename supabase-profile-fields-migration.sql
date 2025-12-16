-- Migration: Add missing profile fields to profiles table
-- Run this in Supabase SQL Editor to add all required fields

-- Add missing fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS hourly_rate numeric,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS use_legal_name_only boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS use_user_name_only boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS effective_display_name text,
ADD COLUMN IF NOT EXISTS search_terms text[] DEFAULT '{}'::text[];

-- Create index on search_terms for better performance
CREATE INDEX IF NOT EXISTS profiles_search_terms_gin ON public.profiles USING gin (search_terms);

-- Update existing profiles to have effective_display_name if missing
UPDATE public.profiles
SET effective_display_name = CASE
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
    WHEN first_name IS NOT NULL THEN first_name
    WHEN last_name IS NOT NULL THEN last_name
    WHEN email IS NOT NULL THEN split_part(email, '@', 1)
    ELSE 'User'
END
WHERE effective_display_name IS NULL OR effective_display_name = '';

-- Update search_terms for existing profiles
UPDATE public.profiles
SET search_terms = array_remove(array[
    lower(coalesce(first_name, '')),
    lower(coalesce(last_name, '')),
    lower(coalesce(display_name, '')),
    lower(coalesce(effective_display_name, ''))
], '')
WHERE search_terms IS NULL OR array_length(search_terms, 1) IS NULL;

-- Update the sync function to include new fields
CREATE OR REPLACE FUNCTION public.sync_public_profile()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.public_profiles (
    id,
    display_name,
    first_name,
    last_name,
    avatar_url,
    banner_url,
    zip_code,
    active_role,
    talent_sub_role,
    search_terms,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.display_name, nullif(trim(coalesce(new.first_name,'') || ' ' || coalesce(new.last_name,'')), '')),
    new.first_name,
    new.last_name,
    new.avatar_url,
    new.banner_url,
    new.zip_code,
    new.active_role,
    new.talent_sub_role,
    COALESCE(new.search_terms, array_remove(array[
      lower(coalesce(new.first_name,'')),
      lower(coalesce(new.last_name,'')),
      lower(coalesce(new.display_name,'')),
      lower(coalesce(new.active_role,'')),
      lower(coalesce(new.talent_sub_role,''))
    ], '')),
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET display_name   = excluded.display_name,
        first_name     = excluded.first_name,
        last_name      = excluded.last_name,
        avatar_url     = excluded.avatar_url,
        banner_url     = excluded.banner_url,
        zip_code       = excluded.zip_code,
        active_role    = excluded.active_role,
        talent_sub_role= excluded.talent_sub_role,
        search_terms   = excluded.search_terms,
        updated_at     = now();

  RETURN new;
END;
$$;


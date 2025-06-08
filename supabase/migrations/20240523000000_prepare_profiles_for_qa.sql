-- Ensure 'handle' column exists for profiles, used by Q&A features
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;

-- Ensure 'reputation' column exists for profiles, used by Q&A features
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;

-- Attempt to backfill 'handle' from 'username' if 'username' exists and 'handle' is null
DO $$
BEGIN
  -- Check if both handle and username columns exist before attempting to backfill
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'handle'
  ) THEN
    -- Backfill handle from username only where handle is currently null and username is not null
    UPDATE public.profiles
       SET handle = username
     WHERE profiles.handle IS NULL AND profiles.username IS NOT NULL;
    RAISE NOTICE 'Attempted to backfill profiles.handle from profiles.username.';
  ELSE
    RAISE NOTICE 'Skipped backfill of profiles.handle from profiles.username as one or both columns (or username data) might not be available.';
  END IF;
END $$; 
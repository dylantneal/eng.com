-- Minimal Fix - Only add what's absolutely needed
-- Run this ONLY after running the diagnostic scripts

-- Fix 1: Add display_name to communities table if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communities' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE communities ADD COLUMN display_name text;
        RAISE NOTICE 'Added display_name column to communities table';
    ELSE
        RAISE NOTICE 'display_name column already exists in communities table';
    END IF;
END $$;

-- Fix 2: Add color to communities table if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communities' AND column_name = 'color'
    ) THEN
        ALTER TABLE communities ADD COLUMN color text DEFAULT '#3B82F6';
        RAISE NOTICE 'Added color column to communities table';
    ELSE
        RAISE NOTICE 'color column already exists in communities table';
    END IF;
END $$;

-- Fix 3: Update display_name values if they're null
UPDATE communities 
SET display_name = CASE 
    WHEN name = 'robotics' THEN 'Robotics & Automation'
    WHEN name = 'electronics' THEN 'Electronics & PCB Design'
    WHEN name = 'simulation' THEN 'Simulation & Analysis'
    ELSE initcap(replace(name, '-', ' '))
END
WHERE display_name IS NULL OR display_name = '';

-- Fix 4: Update color values if they're null
UPDATE communities 
SET color = CASE 
    WHEN name = 'robotics' THEN '#059669'
    WHEN name = 'electronics' THEN '#7C3AED'
    WHEN name = 'simulation' THEN '#7C3AED'
    ELSE '#3B82F6'
END
WHERE color IS NULL OR color = '';

-- Verify the fix
SELECT 'Verification:' as status;
SELECT name, display_name, color FROM communities LIMIT 10; 
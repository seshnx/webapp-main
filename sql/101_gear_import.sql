-- =====================================================
-- GEAR DATABASE IMPORT - SQL Script
-- =====================================================
-- This script ensures the equipment_database table is properly
-- set up for importing gear data from JSON files
-- =====================================================

-- Drop old constraint if it exists (migration-safe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'equipment_database_brand_model_key'
               AND table_name = 'equipment_database') THEN
        ALTER TABLE equipment_database DROP CONSTRAINT equipment_database_brand_model_key;
    END IF;
END $$;

-- Ensure equipment_database table exists with proper structure
CREATE TABLE IF NOT EXISTS equipment_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    name TEXT NOT NULL, -- Full name (e.g., "SM57", "U87", "HS8")
    category TEXT NOT NULL, -- Main category (e.g., "Microphones", "Software", "Audio Interfaces")
    subcategory TEXT, -- Subcategory (e.g., "Dynamic Microphones", "DAWs", "USB Audio Interfaces")
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb, -- Technical specifications
    images JSONB DEFAULT '[]'::jsonb,
    manual_url TEXT,
    support_url TEXT,
    search_tokens TEXT[] DEFAULT '{}'::text[], -- For full-text search
    verified BOOLEAN DEFAULT true, -- Pre-imported data is verified
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT equipment_database_brand_model_category_key UNIQUE(brand, model, category) -- Prevent duplicates within same category
);

-- Add name column if it doesn't exist (migration-safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'equipment_database' AND column_name = 'name') THEN
        ALTER TABLE equipment_database ADD COLUMN name TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'equipment_database' AND column_name = 'search_tokens') THEN
        ALTER TABLE equipment_database ADD COLUMN search_tokens TEXT[] DEFAULT '{}'::text[];
    END IF;
END $$;

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_equipment_database_brand ON equipment_database(brand);
CREATE INDEX IF NOT EXISTS idx_equipment_database_model ON equipment_database(model);
CREATE INDEX IF NOT EXISTS idx_equipment_database_name ON equipment_database(name);
CREATE INDEX IF NOT EXISTS idx_equipment_database_category ON equipment_database(category);
CREATE INDEX IF NOT EXISTS idx_equipment_database_subcategory ON equipment_database(subcategory);
CREATE INDEX IF NOT EXISTS idx_equipment_database_verified ON equipment_database(verified);

-- Full-text search index on search_tokens
CREATE INDEX IF NOT EXISTS idx_equipment_database_search_tokens ON equipment_database USING GIN(search_tokens);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_equipment_database_brand_model ON equipment_database(brand, model);
CREATE INDEX IF NOT EXISTS idx_equipment_database_category_subcategory ON equipment_database(category, subcategory);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_equipment_database_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_equipment_database_updated_at ON equipment_database;
CREATE TRIGGER trigger_equipment_database_updated_at
    BEFORE UPDATE ON equipment_database
    FOR EACH ROW EXECUTE FUNCTION update_equipment_database_updated_at();

-- Enable RLS
ALTER TABLE equipment_database ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Everyone can read verified equipment
DROP POLICY IF EXISTS "Equipment database is viewable by everyone" ON equipment_database;
CREATE POLICY "Equipment database is viewable by everyone" ON equipment_database
    FOR SELECT USING (verified = true OR created_by = auth.uid());

-- Allow authenticated users to insert (for submissions)
DROP POLICY IF EXISTS "Users can insert equipment" ON equipment_database;
CREATE POLICY "Users can insert equipment" ON equipment_database
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own submissions
DROP POLICY IF EXISTS "Users can update their own equipment" ON equipment_database;
CREATE POLICY "Users can update their own equipment" ON equipment_database
    FOR UPDATE USING (created_by = auth.uid() OR verified = true);

-- Comments
COMMENT ON TABLE equipment_database IS 'Community gear database with verified equipment information';
COMMENT ON COLUMN equipment_database.search_tokens IS 'Array of searchable terms for full-text search';
COMMENT ON COLUMN equipment_database.name IS 'Short name/model identifier (e.g., "SM57", "U87")';


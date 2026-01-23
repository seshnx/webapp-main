-- =====================================================
-- SOFTWARE DATABASE IMPORT - SQL Script
-- =====================================================
-- This script ensures the software_database table is properly
-- set up for importing software data from JSON files
-- =====================================================

-- Drop old constraint if it exists (migration-safe)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'software_database_brand_model_key'
               AND table_name = 'software_database') THEN
        ALTER TABLE software_database DROP CONSTRAINT software_database_brand_model_key;
    END IF;
END $$;

-- Ensure software_database table exists with proper structure
CREATE TABLE IF NOT EXISTS software_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL, -- Developer/Publisher (e.g., "Avid", "Apple", "Native Instruments")
    model TEXT NOT NULL, -- Software name/version (e.g., "Pro Tools", "Logic Pro", "Kontakt")
    name TEXT NOT NULL, -- Short name (e.g., "Pro Tools", "Logic", "Kontakt")
    category TEXT NOT NULL, -- Main category (e.g., "DAWs", "Plugins", "Virtual Instruments")
    subcategory TEXT, -- Subcategory (e.g., "Desktop DAWs", "EQ Plugins", "Synths")
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb, -- Technical specifications
    images JSONB DEFAULT '[]'::jsonb,
    manual_url TEXT,
    support_url TEXT,
    website_url TEXT,
    search_tokens TEXT[] DEFAULT '{}'::text[], -- For full-text search
    verified BOOLEAN DEFAULT true, -- Pre-imported data is verified
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT software_database_brand_model_category_key UNIQUE(brand, model, category) -- Prevent duplicates within same category
);

-- Add name column if it doesn't exist (migration-safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'software_database' AND column_name = 'name') THEN
        ALTER TABLE software_database ADD COLUMN name TEXT NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'software_database' AND column_name = 'search_tokens') THEN
        ALTER TABLE software_database ADD COLUMN search_tokens TEXT[] DEFAULT '{}'::text[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'software_database' AND column_name = 'website_url') THEN
        ALTER TABLE software_database ADD COLUMN website_url TEXT;
    END IF;
END $$;

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_software_database_brand ON software_database(brand);
CREATE INDEX IF NOT EXISTS idx_software_database_model ON software_database(model);
CREATE INDEX IF NOT EXISTS idx_software_database_name ON software_database(name);
CREATE INDEX IF NOT EXISTS idx_software_database_category ON software_database(category);
CREATE INDEX IF NOT EXISTS idx_software_database_subcategory ON software_database(subcategory);
CREATE INDEX IF NOT EXISTS idx_software_database_verified ON software_database(verified);

-- Full-text search index on search_tokens
CREATE INDEX IF NOT EXISTS idx_software_database_search_tokens ON software_database USING GIN(search_tokens);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_software_database_brand_model ON software_database(brand, model);
CREATE INDEX IF NOT EXISTS idx_software_database_category_subcategory ON software_database(category, subcategory);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_software_database_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_software_database_updated_at ON software_database;
CREATE TRIGGER trigger_software_database_updated_at
    BEFORE UPDATE ON software_database
    FOR EACH ROW EXECUTE FUNCTION update_software_database_updated_at();

-- Enable RLS
ALTER TABLE software_database ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Everyone can read verified software
DROP POLICY IF EXISTS "Software database is viewable by everyone" ON software_database;
CREATE POLICY "Software database is viewable by everyone" ON software_database
    FOR SELECT USING (verified = true OR created_by = auth.uid());

-- Allow authenticated users to insert (for submissions)
DROP POLICY IF EXISTS "Users can insert software" ON software_database;
CREATE POLICY "Users can insert software" ON software_database
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own submissions
DROP POLICY IF EXISTS "Users can update their own software" ON software_database;
CREATE POLICY "Users can update their own software" ON software_database
    FOR UPDATE USING (created_by = auth.uid() OR verified = true);

-- Comments
COMMENT ON TABLE software_database IS 'Software database with verified audio software information';
COMMENT ON COLUMN software_database.search_tokens IS 'Array of searchable terms for full-text search';
COMMENT ON COLUMN software_database.name IS 'Short name/identifier (e.g., "Pro Tools", "Logic", "Kontakt")';
COMMENT ON COLUMN software_database.brand IS 'Developer/Publisher name (e.g., "Avid", "Apple", "Native Instruments")';


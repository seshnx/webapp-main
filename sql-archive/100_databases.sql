-- ============================================================================
-- UNIFIED DATABASES SCHEMA
-- Equipment & Instrument Databases
-- ============================================================================
-- Version: 1.0
-- Last Updated: 2025-01-19
-- ============================================================================

-- ============================================================================
-- EQUIPMENT DATABASE
-- ============================================================================

-- Drop existing
DROP TABLE IF EXISTS equipment_submissions CASCADE;
DROP TABLE IF EXISTS equipment_database CASCADE;

-- Main table
CREATE TABLE equipment_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    brand VARCHAR(255),
    model VARCHAR(500),
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255) NOT NULL,
    description TEXT,
    specifications JSONB,
    search_tokens TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT true,
    verified_by UUID[] DEFAULT '{}',
    added_by UUID,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE equipment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(500) NOT NULL,
    category VARCHAR(255) NOT NULL,
    sub_category VARCHAR(255),
    specs TEXT NOT NULL,
    submitted_by UUID NOT NULL,
    submitter_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    votes JSONB DEFAULT '{"yes": [], "fake": [], "duplicate": []}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_equipment_category ON equipment_database(category);
CREATE INDEX idx_equipment_subcategory ON equipment_database(subcategory);
CREATE INDEX idx_equipment_verified ON equipment_database(verified);
CREATE INDEX idx_equipment_brand ON equipment_database(brand);
CREATE INDEX idx_equipment_name_fts ON equipment_database USING GIN(to_tsvector('english', name));
CREATE INDEX idx_equipment_search_fts ON equipment_database USING GIN(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(model, '')));
CREATE INDEX idx_equipment_tokens ON equipment_database USING GIN(search_tokens);
CREATE INDEX idx_equipment_submissions_status ON equipment_submissions(status);
CREATE INDEX idx_equipment_submissions_by ON equipment_submissions(submitted_by);

-- Functions
CREATE OR REPLACE FUNCTION generate_equipment_tokens()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_tokens := ARRAY[
        LOWER(NEW.name),
        LOWER(NEW.brand),
        LOWER(NEW.model),
        LOWER(NEW.category),
        LOWER(NEW.subcategory)
    ];
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_equipment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER equipment_tokens_trigger
    BEFORE INSERT OR UPDATE ON equipment_database
    FOR EACH ROW EXECUTE FUNCTION generate_equipment_tokens();

CREATE TRIGGER equipment_timestamp_trigger
    BEFORE UPDATE ON equipment_database
    FOR EACH ROW EXECUTE FUNCTION update_equipment_timestamp();

-- Comments
COMMENT ON TABLE equipment_database IS 'Verified equipment/gear database';
COMMENT ON TABLE equipment_submissions IS 'Community equipment submissions';
COMMENT ON COLUMN equipment_database.search_tokens IS 'Search terms for autocomplete';
COMMENT ON COLUMN equipment_database.specifications IS 'Flexible spec data (JSONB)';
COMMENT ON COLUMN equipment_submissions.votes IS 'Vote tracking: {yes: [], fake: [], duplicate: []}';

-- ============================================================================
-- INSTRUMENT DATABASE
-- ============================================================================

-- Drop existing
DROP TABLE IF EXISTS instrument_submissions CASCADE;
DROP TABLE IF EXISTS instrument_database CASCADE;

-- Main table
CREATE TABLE instrument_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    brand VARCHAR(255),
    model VARCHAR(500),
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    series VARCHAR(255),
    size VARCHAR(100),
    description TEXT,
    specifications JSONB,
    search_tokens TEXT[] DEFAULT '{}',
    verified BOOLEAN DEFAULT true,
    verified_by UUID[] DEFAULT '{}',
    added_by UUID,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE instrument_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(500) NOT NULL,
    category VARCHAR(255) NOT NULL,
    sub_category VARCHAR(255),
    type VARCHAR(255),
    series VARCHAR(255),
    size VARCHAR(100),
    specs TEXT NOT NULL,
    submitted_by UUID NOT NULL,
    submitter_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    votes JSONB DEFAULT '{"yes": [], "fake": [], "duplicate": []}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_instrument_category ON instrument_database(category);
CREATE INDEX idx_instrument_subcategory ON instrument_database(subcategory);
CREATE INDEX idx_instrument_type ON instrument_database(type);
CREATE INDEX idx_instrument_series ON instrument_database(series);
CREATE INDEX idx_instrument_brand ON instrument_database(brand);
CREATE INDEX idx_instrument_verified ON instrument_database(verified);
CREATE INDEX idx_instrument_name_fts ON instrument_database USING GIN(to_tsvector('english', name));
CREATE INDEX idx_instrument_search_fts ON instrument_database USING GIN(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(model, '')));
CREATE INDEX idx_instrument_tokens ON instrument_database USING GIN(search_tokens);
CREATE INDEX idx_instrument_submissions_status ON instrument_submissions(status);
CREATE INDEX idx_instrument_submissions_by ON instrument_submissions(submitted_by);

-- Functions
CREATE OR REPLACE FUNCTION generate_instrument_tokens()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_tokens := ARRAY[
        LOWER(NEW.name),
        LOWER(NEW.brand),
        LOWER(NEW.model),
        LOWER(NEW.category),
        LOWER(NEW.subcategory),
        LOWER(COALESCE(NEW.type, '')),
        LOWER(COALESCE(NEW.series, '')),
        LOWER(COALESCE(NEW.size, ''))
    ];
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_instrument_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER instrument_tokens_trigger
    BEFORE INSERT OR UPDATE ON instrument_database
    FOR EACH ROW EXECUTE FUNCTION generate_instrument_tokens();

CREATE TRIGGER instrument_timestamp_trigger
    BEFORE UPDATE ON instrument_database
    FOR EACH ROW EXECUTE FUNCTION update_instrument_timestamp();

-- Comments
COMMENT ON TABLE instrument_database IS 'Verified musical instruments database';
COMMENT ON TABLE instrument_submissions IS 'Community instrument submissions';
COMMENT ON COLUMN instrument_database.search_tokens IS 'Search terms for autocomplete';
COMMENT ON COLUMN instrument_database.specifications IS 'Flexible spec data (year, country, features)';
COMMENT ON COLUMN instrument_database.type IS 'Instrument type (e.g., Crash, Ride for cymbals)';
COMMENT ON COLUMN instrument_database.series IS 'Product series (e.g., K Custom, A Custom)';
COMMENT ON COLUMN instrument_database.size IS 'Size (e.g., 22\", 14\")';
COMMENT ON COLUMN instrument_submissions.votes IS 'Vote tracking: {yes: [], fake: [], duplicate: []}';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify installation
SELECT
    'equipment_database' as table_name,
    COUNT(*) as row_count
FROM equipment_database
UNION ALL
SELECT
    'instrument_database' as table_name,
    COUNT(*) as row_count
FROM instrument_database;

-- Check indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('equipment_database', 'instrument_database', 'equipment_submissions', 'instrument_submissions')
ORDER BY tablename, indexname;

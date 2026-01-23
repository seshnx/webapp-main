-- =====================================================
-- CONTRACTS MODULE - SQL Editor Script
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Contract Management system
-- =====================================================

-- =====================================================
-- CONTRACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES clerk_users(id) ON DELETE SET NULL,

    -- Contract type and template
    contract_type TEXT NOT NULL CHECK (contract_type IN (
        'recording_360',
        'recording_traditional',
        'distribution',
        'publishing',
        'licensing',
        'management',
        'other'
    )),
    template_id TEXT,

    -- Contract data
    contract_data JSONB NOT NULL, -- Filled variables {label_name, artist_name, royalty_rate, etc.}
    contract_text TEXT NOT NULL, -- Generated full document text

    -- Status tracking
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft',
        'review',
        'sent',
        'signed',
        'amended',
        'expired',
        'terminated'
    )),

    -- Signature tracking (e-signature integration placeholder)
    label_signed BOOLEAN DEFAULT false,
    label_signed_at TIMESTAMPTZ,
    artist_signed BOOLEAN DEFAULT false,
    artist_signed_at TIMESTAMPTZ,

    -- Document storage
    pdf_url TEXT, -- Vercel Blob URL for generated PDF

    -- Contract dates
    effective_date DATE,
    expiration_date DATE,
    term_years INTEGER,

    -- Financial terms (for quick queries without parsing JSONB)
    advance_amount NUMERIC(10, 2),
    royalty_rate NUMERIC(5, 2), -- Percentage

    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one active contract per label-artist pair
    UNIQUE(label_id, artist_id, status) WHERE (status = 'signed' OR status = 'active')
);

-- Add missing columns if table exists (migration-safe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'contracts'
    ) THEN
        -- Add columns that might be missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'template_id') THEN
            ALTER TABLE contracts ADD COLUMN template_id TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'label_signed') THEN
            ALTER TABLE contracts ADD COLUMN label_signed BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'label_signed_at') THEN
            ALTER TABLE contracts ADD COLUMN label_signed_at TIMESTAMPTZ;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'artist_signed') THEN
            ALTER TABLE contracts ADD COLUMN artist_signed BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'artist_signed_at') THEN
            ALTER TABLE contracts ADD COLUMN artist_signed_at TIMESTAMPTZ;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'pdf_url') THEN
            ALTER TABLE contracts ADD COLUMN pdf_url TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'advance_amount') THEN
            ALTER TABLE contracts ADD COLUMN advance_amount NUMERIC(10, 2);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'royalty_rate') THEN
            ALTER TABLE contracts ADD COLUMN royalty_rate NUMERIC(5, 2);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'term_years') THEN
            ALTER TABLE contracts ADD COLUMN term_years INTEGER;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'notes') THEN
            ALTER TABLE contracts ADD COLUMN notes TEXT;
        END IF;
    END IF;
END $$;

-- Indexes for contracts
CREATE INDEX IF NOT EXISTS idx_contracts_label_id ON contracts(label_id);
CREATE INDEX IF NOT EXISTS idx_contracts_artist_id ON contracts(artist_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contracts_effective_date ON contracts(effective_date);
CREATE INDEX IF NOT EXISTS idx_contracts_label_status ON contracts(label_id, status);

-- =====================================================
-- CONTRACT AMENDMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contract_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,

    amendment_number INTEGER NOT NULL,
    amendment_text TEXT NOT NULL,
    amendment_data JSONB DEFAULT '{}',

    -- Signature tracking
    label_signed BOOLEAN DEFAULT false,
    label_signed_at TIMESTAMPTZ,
    artist_signed BOOLEAN DEFAULT false,
    artist_signed_at TIMESTAMPTZ,

    pdf_url TEXT,

    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'rejected')),

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contract_amendments_contract_id ON contract_amendments(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_amendments_status ON contract_amendments(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to contracts tables
DROP TRIGGER IF EXISTS trigger_contracts_updated_at ON contracts;
CREATE TRIGGER trigger_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_contract_amendments_updated_at ON contract_amendments;
CREATE TRIGGER trigger_contract_amendments_updated_at
    BEFORE UPDATE ON contract_amendments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on contracts tables
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_amendments ENABLE ROW LEVEL SECURITY;

-- Contracts: Labels can see their own contracts
DROP POLICY IF EXISTS "Labels can view their contracts" ON contracts;
CREATE POLICY "Labels can view their contracts" ON contracts
    FOR SELECT USING (auth.uid() = label_id);

DROP POLICY IF EXISTS "Artists can view their contracts" ON contracts;
CREATE POLICY "Artists can view their contracts" ON contracts
    FOR SELECT USING (auth.uid() = artist_id);

DROP POLICY IF EXISTS "Labels can insert their contracts" ON contracts;
CREATE POLICY "Labels can insert their contracts" ON contracts
    FOR INSERT WITH CHECK (auth.uid() = label_id);

DROP POLICY IF EXISTS "Labels can update their contracts" ON contracts;
CREATE POLICY "Labels can update their contracts" ON contracts
    FOR UPDATE USING (auth.uid() = label_id);

-- Contract Amendments: Labels can see amendments to their contracts
DROP POLICY IF EXISTS "Labels can view their contract amendments" ON contract_amendments;
CREATE POLICY "Labels can view their contract amendments" ON contract_amendments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contracts
            WHERE contracts.id = contract_amendments.contract_id
            AND contracts.label_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Labels can insert their contract amendments" ON contract_amendments;
CREATE POLICY "Labels can insert their contract amendments" ON contract_amendments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM contracts
            WHERE contracts.id = contract_amendments.contract_id
            AND contracts.label_id = auth.uid()
        )
    );

-- =====================================================
-- VIEWS
-- =====================================================

-- View for contracts with label and artist info
CREATE OR REPLACE VIEW contracts_with_details AS
SELECT
    c.*,
    label.email AS label_email,
    label.username AS label_username,
    sp_label.display_name AS label_display_name,
    artist.email AS artist_email,
    artist.username AS artist_username,
    sp_artist.display_name AS artist_display_name
FROM contracts c
JOIN clerk_users label ON c.label_id = label.id
LEFT JOIN profiles sp_label ON sp_label.user_id = label.id
LEFT JOIN clerk_users artist ON c.artist_id = artist.id
LEFT JOIN profiles sp_artist ON sp_artist.user_id = artist.id;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE contracts IS 'Legal contracts between labels and artists';
COMMENT ON TABLE contract_amendments IS 'Amendments and modifications to existing contracts';
COMMENT ON COLUMN contracts.contract_data IS 'JSON object containing filled contract template variables';
COMMENT ON COLUMN contracts.contract_text IS 'Full generated contract document text';
COMMENT ON COLUMN contracts.status IS 'Contract status: draft, review, sent, signed, amended, expired, terminated';

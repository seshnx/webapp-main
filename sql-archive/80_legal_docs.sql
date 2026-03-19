-- =====================================================
-- LEGAL DOCS MODULE - SQL Editor Script (Fixed)
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Legal Docs module
-- =====================================================

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('Contract', 'Agreement', 'License', 'NDA', 'Release', 'Other')),
    category TEXT, -- 'Booking', 'Collaboration', 'Distribution', etc.
    content TEXT, -- Document content/text
    file_url TEXT, -- Uploaded document file URL
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'expired', 'cancelled')),
    parties JSONB DEFAULT '[]'::jsonb, -- Array of {user_id, name, role, signed_at}
    effective_date DATE,
    expiration_date DATE,
    template_id UUID, -- Reference to document templates
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    signed_at TIMESTAMPTZ
);

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'documents'
    ) THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'user_id') THEN
            ALTER TABLE documents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'title') THEN
            ALTER TABLE documents ADD COLUMN title TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'type') THEN
            ALTER TABLE documents ADD COLUMN type TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'category') THEN
            ALTER TABLE documents ADD COLUMN category TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'content') THEN
            ALTER TABLE documents ADD COLUMN content TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'file_url') THEN
            ALTER TABLE documents ADD COLUMN file_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'status') THEN
            ALTER TABLE documents ADD COLUMN status TEXT DEFAULT 'draft';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'parties') THEN
            ALTER TABLE documents ADD COLUMN parties JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'effective_date') THEN
            ALTER TABLE documents ADD COLUMN effective_date DATE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'expiration_date') THEN
            ALTER TABLE documents ADD COLUMN expiration_date DATE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'template_id') THEN
            ALTER TABLE documents ADD COLUMN template_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'metadata') THEN
            ALTER TABLE documents ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'created_at') THEN
            ALTER TABLE documents ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'updated_at') THEN
            ALTER TABLE documents ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'signed_at') THEN
            ALTER TABLE documents ADD COLUMN signed_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- Indexes for documents (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'expiration_date') THEN
        CREATE INDEX IF NOT EXISTS idx_documents_expiration_date ON documents(expiration_date);
    END IF;
END $$;

-- =====================================================
-- DOCUMENT TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT,
    content TEXT NOT NULL, -- Template content with placeholders
    variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names used in template
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for document_templates (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_templates' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_templates' AND column_name = 'is_public') THEN
        CREATE INDEX IF NOT EXISTS idx_document_templates_is_public ON document_templates(is_public);
    END IF;
END $$;

-- =====================================================
-- MODERATION REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user', 'profile', 'document', 'other')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for moderation_reports (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_reports' AND column_name = 'reporter_id') THEN
        CREATE INDEX IF NOT EXISTS idx_moderation_reports_reporter_id ON moderation_reports(reporter_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_reports' AND column_name = 'target_type') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_reports' AND column_name = 'target_id') THEN
        CREATE INDEX IF NOT EXISTS idx_moderation_reports_target ON moderation_reports(target_type, target_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_reports' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_reports' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_moderation_reports_created_at ON moderation_reports(created_at DESC);
    END IF;
END $$;

-- =====================================================
-- SAFE ZONES TABLE (For safe exchange locations)
-- =====================================================
CREATE TABLE IF NOT EXISTS safe_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address JSONB NOT NULL, -- {street, city, state, zip, lat, lng}
    type TEXT CHECK (type IN ('Police Station', 'Public Building', 'Designated Exchange Point', 'Other')),
    hours JSONB DEFAULT '{}'::jsonb, -- Operating hours
    is_verified BOOLEAN DEFAULT false,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Handle existing table with different column names
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'safe_zones'
    ) THEN
        -- If table has 'verified' column but not 'is_verified', rename it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'safe_zones' AND column_name = 'verified'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'safe_zones' AND column_name = 'is_verified'
        ) THEN
            ALTER TABLE safe_zones RENAME COLUMN verified TO is_verified;
        END IF;
        
        -- Add is_verified if neither exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'safe_zones' AND column_name = 'is_verified'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'safe_zones' AND column_name = 'verified'
        ) THEN
            ALTER TABLE safe_zones ADD COLUMN is_verified BOOLEAN DEFAULT false;
        END IF;
        
        -- Add other missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'name') THEN
            ALTER TABLE safe_zones ADD COLUMN name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'address') THEN
            ALTER TABLE safe_zones ADD COLUMN address JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'type') THEN
            ALTER TABLE safe_zones ADD COLUMN type TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'hours') THEN
            ALTER TABLE safe_zones ADD COLUMN hours JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'verification_notes') THEN
            ALTER TABLE safe_zones ADD COLUMN verification_notes TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'created_at') THEN
            ALTER TABLE safe_zones ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'updated_at') THEN
            ALTER TABLE safe_zones ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Indexes for safe_zones (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_safe_zones_type ON safe_zones(type);
    END IF;
    
    -- Check for either is_verified or verified column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'is_verified') THEN
        CREATE INDEX IF NOT EXISTS idx_safe_zones_is_verified ON safe_zones(is_verified);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'verified') THEN
        CREATE INDEX IF NOT EXISTS idx_safe_zones_verified ON safe_zones(verified);
    END IF;
END $$;

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

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS trigger_document_templates_updated_at ON document_templates;
DROP TRIGGER IF EXISTS trigger_moderation_reports_updated_at ON moderation_reports;
DROP TRIGGER IF EXISTS trigger_safe_zones_updated_at ON safe_zones;

-- Create triggers
CREATE TRIGGER trigger_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_moderation_reports_updated_at
    BEFORE UPDATE ON moderation_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_safe_zones_updated_at
    BEFORE UPDATE ON safe_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON document_templates;
DROP POLICY IF EXISTS "Users can view their own reports" ON moderation_reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON moderation_reports;
DROP POLICY IF EXISTS "Safe zones are viewable by everyone" ON safe_zones;

-- Documents: Users can see documents they're involved in
-- Note: Only create policies if user_id column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'user_id'
    ) THEN
        -- Users can see documents they're involved in
        CREATE POLICY "Users can view their documents" ON documents
            FOR SELECT USING (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM jsonb_array_elements(parties) AS party
                    WHERE (party->>'user_id')::uuid = auth.uid()
                )
            );

        -- Users can insert their own documents
        CREATE POLICY "Users can insert their own documents" ON documents
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Users can update their own documents
        CREATE POLICY "Users can update their own documents" ON documents
            FOR UPDATE USING (auth.uid() = user_id);

        -- Users can delete their own documents
        CREATE POLICY "Users can delete their own documents" ON documents
            FOR DELETE USING (auth.uid() = user_id);
    ELSE
        -- Fallback: Allow all if user_id doesn't exist (should be fixed)
        CREATE POLICY "Users can view their documents" ON documents
            FOR SELECT USING (true);
        
        CREATE POLICY "Users can insert their own documents" ON documents
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Document Templates: Everyone can view public templates or their own
CREATE POLICY "Public templates are viewable by everyone" ON document_templates
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- Document Templates: Users can insert their own templates
CREATE POLICY "Users can insert their own templates" ON document_templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Document Templates: Users can update their own templates
CREATE POLICY "Users can update their own templates" ON document_templates
    FOR UPDATE USING (auth.uid() = created_by);

-- Moderation Reports: Users can see their own reports or reports they reviewed
CREATE POLICY "Users can view their own reports" ON moderation_reports
    FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reviewed_by);

-- Moderation Reports: Users can insert their own reports
CREATE POLICY "Users can insert their own reports" ON moderation_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Safe Zones: Everyone can view verified safe zones
-- Handle both is_verified and verified column names
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'is_verified') THEN
        CREATE POLICY "Safe zones are viewable by everyone" ON safe_zones
            FOR SELECT USING (is_verified = true);
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'safe_zones' AND column_name = 'verified') THEN
        CREATE POLICY "Safe zones are viewable by everyone" ON safe_zones
            FOR SELECT USING (verified = true);
    ELSE
        -- Fallback: allow all if neither column exists
        CREATE POLICY "Safe zones are viewable by everyone" ON safe_zones
            FOR SELECT USING (true);
    END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE documents IS 'Legal documents and contracts';
COMMENT ON TABLE document_templates IS 'Reusable document templates';
COMMENT ON TABLE moderation_reports IS 'Content moderation reports';
COMMENT ON TABLE safe_zones IS 'Verified safe exchange locations for marketplace transactions';


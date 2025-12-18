-- =====================================================
-- LEGAL DOCS MODULE - SQL Editor Script
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

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_expiration_date ON documents(expiration_date);

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

-- Indexes for document_templates
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);
CREATE INDEX IF NOT EXISTS idx_document_templates_is_public ON document_templates(is_public);

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

-- Indexes for moderation_reports
CREATE INDEX IF NOT EXISTS idx_moderation_reports_reporter_id ON moderation_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_target ON moderation_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_created_at ON moderation_reports(created_at DESC);

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

-- Indexes for safe_zones
CREATE INDEX IF NOT EXISTS idx_safe_zones_type ON safe_zones(type);
CREATE INDEX IF NOT EXISTS idx_safe_zones_is_verified ON safe_zones(is_verified);

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

-- Documents: Users can see documents they're involved in
CREATE POLICY "Users can view their documents" ON documents
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() = ANY(SELECT jsonb_array_elements_text(parties->'user_id'))
    );

-- Documents: Users can insert their own documents
CREATE POLICY "Users can insert their own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Document Templates: Everyone can view public templates
CREATE POLICY "Public templates are viewable by everyone" ON document_templates
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- Moderation Reports: Users can see their own reports
CREATE POLICY "Users can view their own reports" ON moderation_reports
    FOR SELECT USING (auth.uid() = reporter_id OR reviewed_by = auth.uid());

-- Moderation Reports: Users can insert their own reports
CREATE POLICY "Users can insert their own reports" ON moderation_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Safe Zones: Everyone can view verified safe zones
CREATE POLICY "Safe zones are viewable by everyone" ON safe_zones
    FOR SELECT USING (is_verified = true);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE documents IS 'Legal documents and contracts';
COMMENT ON TABLE document_templates IS 'Reusable document templates';
COMMENT ON TABLE moderation_reports IS 'Content moderation reports';
COMMENT ON TABLE safe_zones IS 'Verified safe exchange locations for marketplace transactions';


-- =====================================================
-- TECH SERVICES MODULE - SQL Editor Script
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Tech Services module (Repairs, Service Requests, Gear Database)
-- =====================================================

-- =====================================================
-- SERVICE REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tech_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Assigned tech
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    service_category TEXT NOT NULL CHECK (service_category IN ('Repair', 'Maintenance', 'Installation', 'Calibration', 'Inspection', 'Consultation', 'Other')),
    equipment_name TEXT NOT NULL,
    equipment_brand TEXT,
    equipment_model TEXT,
    issue_description TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of photo/document URLs
    logistics TEXT DEFAULT 'Drop-off' CHECK (logistics IN ('Drop-off', 'Pickup', 'Remote', 'On-site')),
    preferred_date TIMESTAMPTZ,
    budget_cap NUMERIC(10, 2),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Disputed')),
    priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    estimated_cost NUMERIC(10, 2),
    actual_cost NUMERIC(10, 2),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for service_requests
CREATE INDEX IF NOT EXISTS idx_service_requests_requester_id ON service_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_tech_id ON service_requests(tech_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(service_category);
CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON service_requests(priority);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);

-- =====================================================
-- EQUIPMENT ITEMS TABLE (User's equipment inventory)
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    category TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_price NUMERIC(10, 2),
    condition TEXT CHECK (condition IN ('New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair')),
    location TEXT, -- Physical location
    notes TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    service_history JSONB DEFAULT '[]'::jsonb, -- Array of service records
    warranty_expires DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for equipment_items
CREATE INDEX IF NOT EXISTS idx_equipment_items_user_id ON equipment_items(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_items_category ON equipment_items(category);
CREATE INDEX IF NOT EXISTS idx_equipment_items_condition ON equipment_items(condition);

-- =====================================================
-- EQUIPMENT DATABASE TABLE (Community gear database)
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb, -- Technical specifications
    images JSONB DEFAULT '[]'::jsonb,
    manual_url TEXT,
    support_url TEXT,
    verified BOOLEAN DEFAULT false, -- Verified by community/techs
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand, model) -- Prevent duplicates
);

-- Indexes for equipment_database
CREATE INDEX IF NOT EXISTS idx_equipment_database_brand ON equipment_database(brand);
CREATE INDEX IF NOT EXISTS idx_equipment_database_category ON equipment_database(category);
CREATE INDEX IF NOT EXISTS idx_equipment_database_verified ON equipment_database(verified);

-- =====================================================
-- EQUIPMENT SUBMISSIONS TABLE (User submissions to database)
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    manual_url TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Merged')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    reward_paid BOOLEAN DEFAULT false, -- Reward for contributing to database
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for equipment_submissions
CREATE INDEX IF NOT EXISTS idx_equipment_submissions_submitter_id ON equipment_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_equipment_submissions_status ON equipment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_equipment_submissions_created_at ON equipment_submissions(created_at DESC);

-- =====================================================
-- PUBLIC PROFILES TABLE (Tech directory profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    bio TEXT,
    specialties TEXT[] DEFAULT '{}', -- ['Audio Repair', 'Calibration', etc.]
    certifications TEXT[] DEFAULT '{}',
    years_experience INTEGER,
    hourly_rate NUMERIC(10, 2),
    location JSONB, -- {city, state, zip, lat, lng}
    service_radius INTEGER, -- Miles
    availability_status TEXT DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Busy', 'Unavailable')),
    rating_average NUMERIC(3, 2),
    review_count INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    profile_photo TEXT,
    cover_photo TEXT,
    portfolio_images JSONB DEFAULT '[]'::jsonb,
    is_verified_tech BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for public_profiles
CREATE INDEX IF NOT EXISTS idx_public_profiles_user_id ON public_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_public_profiles_specialties ON public_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_public_profiles_availability_status ON public_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_public_profiles_rating ON public_profiles(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_public_profiles_is_verified_tech ON public_profiles(is_verified_tech);

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

CREATE TRIGGER trigger_service_requests_updated_at
    BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_equipment_items_updated_at
    BEFORE UPDATE ON equipment_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_equipment_database_updated_at
    BEFORE UPDATE ON equipment_database
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_equipment_submissions_updated_at
    BEFORE UPDATE ON equipment_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_public_profiles_updated_at
    BEFORE UPDATE ON public_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Service Requests: Users can see requests they created or are assigned to
CREATE POLICY "Users can view their service requests" ON service_requests
    FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = tech_id);

-- Service Requests: Users can insert their own requests
CREATE POLICY "Users can insert their service requests" ON service_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Equipment Items: Users can only see their own equipment
CREATE POLICY "Users can view their own equipment" ON equipment_items
    FOR SELECT USING (auth.uid() = user_id);

-- Equipment Items: Users can insert their own equipment
CREATE POLICY "Users can insert their own equipment" ON equipment_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Equipment Database: Everyone can view verified equipment
CREATE POLICY "Equipment database is viewable by everyone" ON equipment_database
    FOR SELECT USING (true);

-- Equipment Submissions: Users can see their own submissions
CREATE POLICY "Users can view their own submissions" ON equipment_submissions
    FOR SELECT USING (auth.uid() = submitter_id OR reviewed_by = auth.uid());

-- Equipment Submissions: Users can insert their own submissions
CREATE POLICY "Users can insert their own submissions" ON equipment_submissions
    FOR INSERT WITH CHECK (auth.uid() = submitter_id);

-- Public Profiles: Everyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public_profiles
    FOR SELECT USING (true);

-- Public Profiles: Users can update their own profile
CREATE POLICY "Users can update their own public profile" ON public_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE service_requests IS 'Service requests for equipment repair and maintenance';
COMMENT ON TABLE equipment_items IS 'User equipment inventory';
COMMENT ON TABLE equipment_database IS 'Community gear database with verified equipment information';
COMMENT ON TABLE equipment_submissions IS 'User submissions to the equipment database';
COMMENT ON TABLE public_profiles IS 'Public tech service provider profiles';


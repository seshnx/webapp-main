-- =====================================================
-- TECH SERVICES MODULE - SQL Editor Script (Fixed)
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

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'service_requests'
    ) THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'requester_id') THEN
            ALTER TABLE service_requests ADD COLUMN requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'tech_id') THEN
            ALTER TABLE service_requests ADD COLUMN tech_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'title') THEN
            ALTER TABLE service_requests ADD COLUMN title TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'description') THEN
            ALTER TABLE service_requests ADD COLUMN description TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'service_category') THEN
            ALTER TABLE service_requests ADD COLUMN service_category TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'equipment_name') THEN
            ALTER TABLE service_requests ADD COLUMN equipment_name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'equipment_brand') THEN
            ALTER TABLE service_requests ADD COLUMN equipment_brand TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'equipment_model') THEN
            ALTER TABLE service_requests ADD COLUMN equipment_model TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'issue_description') THEN
            ALTER TABLE service_requests ADD COLUMN issue_description TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'attachments') THEN
            ALTER TABLE service_requests ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'logistics') THEN
            ALTER TABLE service_requests ADD COLUMN logistics TEXT DEFAULT 'Drop-off';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'preferred_date') THEN
            ALTER TABLE service_requests ADD COLUMN preferred_date TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'budget_cap') THEN
            ALTER TABLE service_requests ADD COLUMN budget_cap NUMERIC(10, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'status') THEN
            ALTER TABLE service_requests ADD COLUMN status TEXT DEFAULT 'Open';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'priority') THEN
            ALTER TABLE service_requests ADD COLUMN priority TEXT DEFAULT 'Normal';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'estimated_cost') THEN
            ALTER TABLE service_requests ADD COLUMN estimated_cost NUMERIC(10, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'actual_cost') THEN
            ALTER TABLE service_requests ADD COLUMN actual_cost NUMERIC(10, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'completed_at') THEN
            ALTER TABLE service_requests ADD COLUMN completed_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'created_at') THEN
            ALTER TABLE service_requests ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'updated_at') THEN
            ALTER TABLE service_requests ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Indexes for service_requests (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'requester_id') THEN
        CREATE INDEX IF NOT EXISTS idx_service_requests_requester_id ON service_requests(requester_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'tech_id') THEN
        CREATE INDEX IF NOT EXISTS idx_service_requests_tech_id ON service_requests(tech_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'service_category') THEN
        CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(service_category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'priority') THEN
        CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON service_requests(priority);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);
    END IF;
END $$;

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

-- Indexes for equipment_items (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_items' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_items_user_id ON equipment_items(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_items' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_items_category ON equipment_items(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_items' AND column_name = 'condition') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_items_condition ON equipment_items(condition);
    END IF;
END $$;

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

-- Indexes for equipment_database (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_database' AND column_name = 'brand') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_database_brand ON equipment_database(brand);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_database' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_database_category ON equipment_database(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_database' AND column_name = 'verified') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_database_verified ON equipment_database(verified);
    END IF;
END $$;

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

-- Indexes for equipment_submissions (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_submissions' AND column_name = 'submitter_id') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_submissions_submitter_id ON equipment_submissions(submitter_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_submissions' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_submissions_status ON equipment_submissions(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_submissions' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_equipment_submissions_created_at ON equipment_submissions(created_at DESC);
    END IF;
END $$;

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

-- Indexes for public_profiles (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_profiles' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_public_profiles_user_id ON public_profiles(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_profiles' AND column_name = 'specialties') THEN
        CREATE INDEX IF NOT EXISTS idx_public_profiles_specialties ON public_profiles USING GIN(specialties);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_profiles' AND column_name = 'availability_status') THEN
        CREATE INDEX IF NOT EXISTS idx_public_profiles_availability_status ON public_profiles(availability_status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_profiles' AND column_name = 'rating_average') THEN
        CREATE INDEX IF NOT EXISTS idx_public_profiles_rating ON public_profiles(rating_average DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_profiles' AND column_name = 'is_verified_tech') THEN
        CREATE INDEX IF NOT EXISTS idx_public_profiles_is_verified_tech ON public_profiles(is_verified_tech);
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
DROP TRIGGER IF EXISTS trigger_service_requests_updated_at ON service_requests;
DROP TRIGGER IF EXISTS trigger_equipment_items_updated_at ON equipment_items;
DROP TRIGGER IF EXISTS trigger_equipment_database_updated_at ON equipment_database;
DROP TRIGGER IF EXISTS trigger_equipment_submissions_updated_at ON equipment_submissions;
DROP TRIGGER IF EXISTS trigger_public_profiles_updated_at ON public_profiles;

-- Create triggers
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

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their service requests" ON service_requests;
DROP POLICY IF EXISTS "Users can insert their service requests" ON service_requests;
DROP POLICY IF EXISTS "Users can view their own equipment" ON equipment_items;
DROP POLICY IF EXISTS "Users can insert their own equipment" ON equipment_items;
DROP POLICY IF EXISTS "Equipment database is viewable by everyone" ON equipment_database;
DROP POLICY IF EXISTS "Users can view their own submissions" ON equipment_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON equipment_submissions;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public_profiles;
DROP POLICY IF EXISTS "Users can update their own public profile" ON public_profiles;

-- Service Requests: Users can see requests they created or are assigned to
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'requester_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'tech_id') THEN
        CREATE POLICY "Users can view their service requests" ON service_requests
            FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = tech_id);
        
        CREATE POLICY "Users can insert their service requests" ON service_requests
            FOR INSERT WITH CHECK (auth.uid() = requester_id);
    END IF;
END $$;

-- Equipment Items: Users can only see their own equipment
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_items' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can view their own equipment" ON equipment_items
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own equipment" ON equipment_items
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Equipment Database: Everyone can view verified equipment
CREATE POLICY "Equipment database is viewable by everyone" ON equipment_database
    FOR SELECT USING (true);

-- Equipment Submissions: Users can see their own submissions
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_submissions' AND column_name = 'submitter_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment_submissions' AND column_name = 'reviewed_by') THEN
        CREATE POLICY "Users can view their own submissions" ON equipment_submissions
            FOR SELECT USING (auth.uid() = submitter_id OR reviewed_by = auth.uid());
        
        CREATE POLICY "Users can insert their own submissions" ON equipment_submissions
            FOR INSERT WITH CHECK (auth.uid() = submitter_id);
    END IF;
END $$;

-- Public Profiles: Everyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public_profiles
    FOR SELECT USING (true);

-- Public Profiles: Users can update their own profile
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'public_profiles' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can update their own public profile" ON public_profiles
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE service_requests IS 'Service requests for equipment repair and maintenance';
COMMENT ON TABLE equipment_items IS 'User equipment inventory';
COMMENT ON TABLE equipment_database IS 'Community gear database with verified equipment information';
COMMENT ON TABLE equipment_submissions IS 'User submissions to the equipment database';
COMMENT ON TABLE public_profiles IS 'Public tech service provider profiles';


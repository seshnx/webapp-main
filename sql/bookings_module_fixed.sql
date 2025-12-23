-- =====================================================
-- BOOKINGS MODULE - SQL Editor Script (Fixed)
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Bookings module (Sessions, Studio Rentals, Talent Booking)
-- =====================================================

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_name TEXT,
    target_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_name TEXT,
    type TEXT NOT NULL CHECK (type IN (
        'Session', 'Lesson', 'Consultation', 'Rehearsal', 'Collaboration',
        'Vocal Recording', 'Feature Verse', 'Background Vocals', 'Vocal Topline',
        'Live Performance', 'Session Work', 'Demo Recording',
        'Session Recording', 'Live Gig', 'Tour Support', 'Recording Session', 'Overdubs', 'Arrangement',
        'Club Set', 'Private Event', 'Festival Set', 'Radio Mix', 'Corporate Event', 'Wedding',
        'Beat Production', 'Full Production', 'Co-Production', 'Remix', 'Arrangement', 'Sound Design', 'Composition',
        'Mixing', 'Mastering', 'Tracking', 'Editing', 'Tuning/Comping', 'Stem Mixing', 'Atmos Mix',
        'Studio Rental', 'Equipment Rental', 'Recording Session', 'Mixing Session', 'Rehearsal Space',
        'Original Score', 'Arrangement', 'Orchestration', 'Library Music', 'Jingle/Commercial', 'Songwriting',
        'TechRequest', 'Broadcast', 'SessionBuilder'
    )),
    service_type TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Declined', 'Cancelled', 'Completed', 'In Progress')),
    date TEXT, -- Flexible date format (ISO string or "Flexible")
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_hours NUMERIC(4, 2),
    location JSONB, -- {name, address, lat, lng, venue_id}
    venue_id UUID, -- Reference to studios table
    equipment TEXT[] DEFAULT '{}',
    description TEXT,
    message TEXT,
    budget_cap NUMERIC(10, 2),
    agreed_price NUMERIC(10, 2),
    logistics TEXT, -- 'Drop-off', 'Pickup', 'Remote', 'On-site'
    attachments JSONB DEFAULT '[]'::jsonb, -- Array of media/file attachments
    responded_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'bookings'
    ) THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'start_time') THEN
            ALTER TABLE bookings ADD COLUMN start_time TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'end_time') THEN
            ALTER TABLE bookings ADD COLUMN end_time TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'duration_hours') THEN
            ALTER TABLE bookings ADD COLUMN duration_hours NUMERIC(4, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'sender_id') THEN
            ALTER TABLE bookings ADD COLUMN sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'sender_name') THEN
            ALTER TABLE bookings ADD COLUMN sender_name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'target_id') THEN
            ALTER TABLE bookings ADD COLUMN target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'target_name') THEN
            ALTER TABLE bookings ADD COLUMN target_name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'type') THEN
            ALTER TABLE bookings ADD COLUMN type TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service_type') THEN
            ALTER TABLE bookings ADD COLUMN service_type TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status') THEN
            ALTER TABLE bookings ADD COLUMN status TEXT DEFAULT 'Pending';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'date') THEN
            ALTER TABLE bookings ADD COLUMN date TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'location') THEN
            ALTER TABLE bookings ADD COLUMN location JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'venue_id') THEN
            ALTER TABLE bookings ADD COLUMN venue_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'equipment') THEN
            ALTER TABLE bookings ADD COLUMN equipment TEXT[] DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'description') THEN
            ALTER TABLE bookings ADD COLUMN description TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'message') THEN
            ALTER TABLE bookings ADD COLUMN message TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'budget_cap') THEN
            ALTER TABLE bookings ADD COLUMN budget_cap NUMERIC(10, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'agreed_price') THEN
            ALTER TABLE bookings ADD COLUMN agreed_price NUMERIC(10, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'logistics') THEN
            ALTER TABLE bookings ADD COLUMN logistics TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'attachments') THEN
            ALTER TABLE bookings ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'responded_at') THEN
            ALTER TABLE bookings ADD COLUMN responded_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'confirmed_at') THEN
            ALTER TABLE bookings ADD COLUMN confirmed_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'completed_at') THEN
            ALTER TABLE bookings ADD COLUMN completed_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cancelled_at') THEN
            ALTER TABLE bookings ADD COLUMN cancelled_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'cancellation_reason') THEN
            ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'rating') THEN
            ALTER TABLE bookings ADD COLUMN rating INTEGER;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'review') THEN
            ALTER TABLE bookings ADD COLUMN review TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'created_at') THEN
            ALTER TABLE bookings ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'updated_at') THEN
            ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Indexes for bookings (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'sender_id') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_sender_id ON bookings(sender_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'target_id') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_target_id ON bookings(target_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'start_time') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'sender_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_sender_status ON bookings(sender_id, status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'target_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_target_status ON bookings(target_id, status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'venue_id') THEN
        CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
    END IF;
END $$;

-- =====================================================
-- SESSIONS TABLE (Extended booking information)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    duration_hours NUMERIC(4, 2),
    location JSONB,
    required_roles TEXT[] DEFAULT '{}', -- ['Producer', 'Engineer', 'Vocalist']
    participants JSONB DEFAULT '[]'::jsonb, -- Array of {user_id, role, status}
    status TEXT DEFAULT 'Planning' CHECK (status IN ('Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled')),
    budget NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist for sessions
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'booking_id') THEN
            ALTER TABLE sessions ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'creator_id') THEN
            ALTER TABLE sessions ADD COLUMN creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'title') THEN
            ALTER TABLE sessions ADD COLUMN title TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'description') THEN
            ALTER TABLE sessions ADD COLUMN description TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'date') THEN
            ALTER TABLE sessions ADD COLUMN date TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'duration_hours') THEN
            ALTER TABLE sessions ADD COLUMN duration_hours NUMERIC(4, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'location') THEN
            ALTER TABLE sessions ADD COLUMN location JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'required_roles') THEN
            ALTER TABLE sessions ADD COLUMN required_roles TEXT[] DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'participants') THEN
            ALTER TABLE sessions ADD COLUMN participants JSONB DEFAULT '[]'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'status') THEN
            ALTER TABLE sessions ADD COLUMN status TEXT DEFAULT 'Planning';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'budget') THEN
            ALTER TABLE sessions ADD COLUMN budget NUMERIC(10, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'notes') THEN
            ALTER TABLE sessions ADD COLUMN notes TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'created_at') THEN
            ALTER TABLE sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'updated_at') THEN
            ALTER TABLE sessions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Indexes for sessions (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'booking_id') THEN
        CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'creator_id') THEN
        CREATE INDEX IF NOT EXISTS idx_sessions_creator_id ON sessions(creator_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
    END IF;
END $$;

-- =====================================================
-- BROADCAST REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS broadcast_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    location JSONB,
    required_roles TEXT[] DEFAULT '{}',
    budget_range JSONB, -- {min, max}
    urgency TEXT DEFAULT 'Normal' CHECK (urgency IN ('Low', 'Normal', 'High', 'Urgent')),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Filled', 'Cancelled', 'Expired')),
    responses JSONB DEFAULT '[]'::jsonb, -- Array of {user_id, message, proposed_price}
    selected_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for broadcast requests (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broadcast_requests' AND column_name = 'creator_id') THEN
        CREATE INDEX IF NOT EXISTS idx_broadcast_requests_creator_id ON broadcast_requests(creator_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broadcast_requests' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_broadcast_requests_date ON broadcast_requests(date);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broadcast_requests' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_broadcast_requests_status ON broadcast_requests(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broadcast_requests' AND column_name = 'urgency') THEN
        CREATE INDEX IF NOT EXISTS idx_broadcast_requests_urgency ON broadcast_requests(urgency);
    END IF;
END $$;

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    categories JSONB DEFAULT '{}'::jsonb, -- {professionalism, quality, communication, etc.}
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, booking_id) -- One review per booking
);

-- Indexes for reviews (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewer_id') THEN
        CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'target_id') THEN
        CREATE INDEX IF NOT EXISTS idx_reviews_target_id ON reviews(target_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'booking_id') THEN
        CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'rating') THEN
        CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
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
DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
DROP TRIGGER IF EXISTS trigger_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS trigger_broadcast_requests_updated_at ON broadcast_requests;
DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;

-- Create triggers
CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_broadcast_requests_updated_at
    BEFORE UPDATE ON broadcast_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert their sessions" ON sessions;
DROP POLICY IF EXISTS "Broadcast requests are viewable by everyone" ON broadcast_requests;
DROP POLICY IF EXISTS "Users can insert their broadcast requests" ON broadcast_requests;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can insert their reviews" ON reviews;

-- Bookings: Users can see bookings they sent or received
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'sender_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'target_id') THEN
        CREATE POLICY "Users can view their bookings" ON bookings
            FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = target_id);
        
        CREATE POLICY "Users can insert their bookings" ON bookings
            FOR INSERT WITH CHECK (auth.uid() = sender_id);
        
        CREATE POLICY "Users can update their bookings" ON bookings
            FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = target_id);
    END IF;
END $$;

-- Sessions: Users can see sessions they created or are part of
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'creator_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'participants') THEN
        CREATE POLICY "Users can view their sessions" ON sessions
            FOR SELECT USING (
                auth.uid() = creator_id OR 
                EXISTS (
                    SELECT 1 FROM jsonb_array_elements(participants) AS participant
                    WHERE (participant->>'user_id')::uuid = auth.uid()
                )
            );
        
        CREATE POLICY "Users can insert their sessions" ON sessions
            FOR INSERT WITH CHECK (auth.uid() = creator_id);
    END IF;
END $$;

-- Broadcast Requests: Everyone can view open broadcast requests
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broadcast_requests' AND column_name = 'status')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'broadcast_requests' AND column_name = 'creator_id') THEN
        CREATE POLICY "Broadcast requests are viewable by everyone" ON broadcast_requests
            FOR SELECT USING (status = 'Open' OR creator_id = auth.uid());
        
        CREATE POLICY "Users can insert their broadcast requests" ON broadcast_requests
            FOR INSERT WITH CHECK (auth.uid() = creator_id);
    END IF;
END $$;

-- Reviews: Users can view all public reviews
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'is_public')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewer_id')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'target_id') THEN
        CREATE POLICY "Reviews are viewable by everyone" ON reviews
            FOR SELECT USING (is_public = true OR reviewer_id = auth.uid() OR target_id = auth.uid());
        
        CREATE POLICY "Users can insert their reviews" ON reviews
            FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
    END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE bookings IS 'Booking requests for sessions, studio rentals, and talent services';
COMMENT ON TABLE sessions IS 'Extended session information with participants and planning details';
COMMENT ON TABLE broadcast_requests IS 'Open requests for talent/services that multiple users can respond to';
COMMENT ON TABLE reviews IS 'User reviews and ratings for completed bookings';


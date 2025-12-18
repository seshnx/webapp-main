-- =====================================================
-- BOOKINGS MODULE - SQL Editor Script
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

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_sender_id ON bookings(sender_id);
CREATE INDEX IF NOT EXISTS idx_bookings_target_id ON bookings(target_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(type);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_sender_status ON bookings(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_target_status ON bookings(target_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);

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

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_sessions_creator_id ON sessions(creator_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

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

-- Indexes for broadcast requests
CREATE INDEX IF NOT EXISTS idx_broadcast_requests_creator_id ON broadcast_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_requests_date ON broadcast_requests(date);
CREATE INDEX IF NOT EXISTS idx_broadcast_requests_status ON broadcast_requests(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_requests_urgency ON broadcast_requests(urgency);

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

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target_id ON reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

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

-- Bookings: Users can see bookings they sent or received
CREATE POLICY "Users can view their bookings" ON bookings
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = target_id);

-- Bookings: Users can insert bookings they send
CREATE POLICY "Users can insert their bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Bookings: Users can update bookings they sent or received
CREATE POLICY "Users can update their bookings" ON bookings
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = target_id);

-- Sessions: Users can see sessions they created or are part of
CREATE POLICY "Users can view their sessions" ON sessions
    FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = ANY(SELECT jsonb_array_elements_text(participants->'user_id')));

-- Sessions: Users can insert their own sessions
CREATE POLICY "Users can insert their sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Broadcast Requests: Everyone can view open broadcast requests
CREATE POLICY "Broadcast requests are viewable by everyone" ON broadcast_requests
    FOR SELECT USING (status = 'Open' OR creator_id = auth.uid());

-- Broadcast Requests: Users can insert their own broadcast requests
CREATE POLICY "Users can insert their broadcast requests" ON broadcast_requests
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Reviews: Users can view all public reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (is_public = true OR reviewer_id = auth.uid() OR target_id = auth.uid());

-- Reviews: Users can insert their own reviews
CREATE POLICY "Users can insert their reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE bookings IS 'Booking requests for sessions, studio rentals, and talent services';
COMMENT ON TABLE sessions IS 'Extended session information with participants and planning details';
COMMENT ON TABLE broadcast_requests IS 'Open requests for talent/services that multiple users can respond to';
COMMENT ON TABLE reviews IS 'User reviews and ratings for completed bookings';


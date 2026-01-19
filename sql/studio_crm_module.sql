-- =====================================================
-- STUDIO CRM MODULE - SQL Editor Script
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Studio Client & Talent Management (CRM) module
-- =====================================================
-- Architecture: Neon PostgreSQL (persistent data)
-- Real-time sync: Convex (for live updates)
-- =====================================================

-- =====================================================
-- STUDIO CLIENTS TABLE
-- =====================================================
-- Central client database for studio owners
-- Links to auth.users for SeshNx members, supports non-members too
CREATE TABLE IF NOT EXISTS studio_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL, -- Studio owner (references auth.users implicitly)
    client_id UUID, -- NULL if not a SeshNx user
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    tags TEXT[] DEFAULT '{}',
    client_type TEXT DEFAULT 'regular' CHECK (client_type IN ('vip', 'regular', 'prospect', 'inactive')),
    notes TEXT,
    total_bookings INTEGER DEFAULT 0,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    first_booking_date DATE,
    last_booking_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_studio_clients_studio_id ON studio_clients(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_clients_client_type ON studio_clients(client_type);
CREATE INDEX IF NOT EXISTS idx_studio_clients_email ON studio_clients(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_clients_tags ON studio_clients USING GIN(tags);

-- =====================================================
-- CLIENT COMMUNICATIONS TABLE
-- =====================================================
-- Unified communication history for each client
CREATE TABLE IF NOT EXISTS client_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES studio_clients(id) ON DELETE CASCADE,
    communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'message', 'note', 'call', 'meeting')),
    subject TEXT,
    body TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- e.g., {"booking_id": "...", "sent_via": "gmail"}
    created_by UUID, -- User who created the record
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_communications_client_id ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_client_communications_created_at ON client_communications(created_at DESC);

-- =====================================================
-- STUDIO TALENT NETWORK TABLE
-- =====================================================
-- Freelance talent pipeline (engineers, producers, musicians)
CREATE TABLE IF NOT EXISTS studio_talent_network (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    talent_user_id UUID, -- SeshNx user (NULL if external)
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('engineer', 'producer', 'musician', 'technician', 'vocalist', 'dj', 'other')),
    skills TEXT[] DEFAULT '{}',
    hourly_rate NUMERIC(10, 2),
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable', 'touring')),
    reliability_rating INTEGER CHECK (reliability_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    total_collaborations INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_talent_network_studio_id ON studio_talent_network(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_talent_network_role ON studio_talent_network(role);
CREATE INDEX IF NOT EXISTS idx_studio_talent_network_availability ON studio_talent_network(availability_status);
CREATE INDEX IF NOT EXISTS idx_studio_talent_network_skills ON studio_talent_network USING GIN(skills);

-- =====================================================
-- BOOKING TEMPLATES TABLE
-- =====================================================
-- Reusable booking packages (e.g., "Full Day Recording Package")
CREATE TABLE IF NOT EXISTS booking_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_hours NUMERIC(4, 2) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    rooms JSONB DEFAULT '[]'::jsonb, -- Array of room configurations
    equipment_packages JSONB DEFAULT '[]'::jsonb, -- Pre-selected equipment
    add_on_services JSONB DEFAULT '[]'::jsonb, -- Additional services
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_templates_studio_id ON booking_templates(studio_id);
CREATE INDEX IF NOT EXISTS idx_booking_templates_active ON booking_templates(is_active) WHERE is_active = true;

-- =====================================================
-- BOOKING WAITLIST TABLE
-- =====================================================
-- Waitlist for fully booked time slots
CREATE TABLE IF NOT EXISTS booking_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    client_id UUID NOT NULL,
    studio_id UUID NOT NULL,
    requested_date TIMESTAMPTZ NOT NULL,
    requested_room_id UUID, -- Specific room if applicable
    priority INTEGER DEFAULT 0 CHECK (priority BETWEEN 0 AND 100), -- 0=normal, higher=VIP
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMPTZ, -- Auto-expire waitlist requests
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_waitlist_studio_date ON booking_waitlist(studio_id, requested_date);
CREATE INDEX IF NOT EXISTS idx_booking_waitlist_client_id ON booking_waitlist(client_id);
CREATE INDEX IF NOT EXISTS idx_booking_waitlist_status ON booking_waitlist(status);

-- =====================================================
-- BOOKING PAYMENTS TABLE
-- =====================================================
-- Track deposits, partial payments, refunds per booking
CREATE TABLE IF NOT EXISTS booking_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'partial', 'full', 'refund')),
    amount NUMERIC(10, 2) NOT NULL,
    payment_intent_id TEXT, -- Stripe payment intent ID
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_payments_booking_id ON booking_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_status ON booking_payments(status);
CREATE INDEX IF NOT EXISTS idx_booking_payments_due_date ON booking_payments(due_date);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to studio_clients
CREATE TRIGGER update_studio_clients_updated_at
    BEFORE UPDATE ON studio_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to studio_talent_network
CREATE TRIGGER update_studio_talent_network_updated_at
    BEFORE UPDATE ON studio_talent_network
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to booking_templates
CREATE TRIGGER update_booking_templates_updated_at
    BEFORE UPDATE ON booking_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE studio_clients IS 'Client database for studio owners - tracks all client interactions and booking history';
COMMENT ON TABLE client_communications IS 'Unified communication timeline - emails, messages, notes, calls with clients';
COMMENT ON TABLE studio_talent_network IS 'Freelance talent pipeline - engineers, producers, musicians available for collaboration';
COMMENT ON TABLE booking_templates IS 'Reusable booking packages - pre-configured room/equipment/service combinations';
COMMENT ON TABLE booking_waitlist IS 'Waitlist system for fully booked time slots with priority support';
COMMENT ON TABLE booking_payments IS 'Payment tracking per booking - deposits, partial payments, refunds';

-- =====================================================
-- END OF STUDIO CRM MODULE
-- =====================================================

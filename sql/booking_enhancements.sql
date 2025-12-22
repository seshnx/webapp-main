-- =====================================================
-- BOOKING ENHANCEMENTS - Additional Tables
-- =====================================================

-- =====================================================
-- BOOKING HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_history_booking_id ON booking_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_created_at ON booking_history(created_at DESC);

-- =====================================================
-- BOOKING REMINDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('day_before', 'hours_before', 'custom')),
    reminder_hours NUMERIC(4, 2) NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    cancelled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking_id ON booking_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_user_id ON booking_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_scheduled_for ON booking_reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_sent ON booking_reminders(sent, scheduled_for);

-- =====================================================
-- PUSH SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL, -- {p256dh, auth}
    active BOOLEAN DEFAULT true,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(active);

-- =====================================================
-- CANCELLATION POLICIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cancellation_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    free_cancellation_hours NUMERIC(4, 2) DEFAULT 48,
    fee_structure JSONB DEFAULT '{
        "48+": 0,
        "24-48": 0.25,
        "12-24": 0.5,
        "0-12": 0.75,
        "past": 1.0
    }'::jsonb,
    no_cancellation_after_hours NUMERIC(4, 2), -- NULL = can cancel anytime
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cancellation_policies_studio_id ON cancellation_policies(studio_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_policies_default ON cancellation_policies(is_default);

-- =====================================================
-- RECURRING BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS recurring_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    studio_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'custom')),
    recurrence_pattern JSONB NOT NULL, -- {daysOfWeek: [1,3,5], interval: 1, etc.}
    start_date DATE NOT NULL,
    end_date DATE, -- NULL = no end date
    next_occurrence DATE NOT NULL,
    occurrences_created INTEGER DEFAULT 0,
    max_occurrences INTEGER, -- NULL = unlimited
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_bookings_studio_id ON recurring_bookings(studio_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_sender_id ON recurring_bookings(sender_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_next_occurrence ON recurring_bookings(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_active ON recurring_bookings(is_active);

-- =====================================================
-- ROOM BOOKINGS TABLE (Multi-room support)
-- =====================================================
CREATE TABLE IF NOT EXISTS room_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    room_id UUID, -- Reference to rooms table or room name
    room_name TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_bookings_booking_id ON room_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_room_bookings_room_id ON room_bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_room_bookings_time_range ON room_bookings(start_time, end_time);


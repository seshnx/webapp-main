-- =====================================================
-- BUSINESS FEATURES UNIFIED SCHEMA - NEON COMPATIBLE
-- =====================================================
-- This file combines ALL business feature modules into a single schema
-- compatible with Neon PostgreSQL + Clerk authentication.
--
-- All auth.users references have been converted to clerk_users
--
-- Modules included:
-- 1. Bookings Module (sessions, bookings, reviews, broadcast_requests)
-- 2. Marketplace Module (gear_listings, market_items, marketplace_items, orders)
-- 3. Payments Module (wallets, transactions, subscriptions, payment_methods, invoices)
-- 4. Business Center (studios, label_roster, distribution_stats, releases)
-- 5. Tech Services (service_requests, equipment_items, equipment_database)
-- 6. Education Module (schools, students, courses, enrollments, etc.)
--
-- Run this in Neon SQL Editor AFTER running neon_unified_schema.sql
-- =====================================================

-- =====================================================
-- BOOKINGS MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    sender_name TEXT,
    target_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
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
    date TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_hours NUMERIC(4, 2),
    location JSONB,
    venue_id UUID,
    equipment TEXT[] DEFAULT '{}',
    description TEXT,
    message TEXT,
    budget_cap NUMERIC(10, 2),
    agreed_price NUMERIC(10, 2),
    logistics TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
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

CREATE INDEX IF NOT EXISTS idx_bookings_sender_id ON bookings(sender_id);
CREATE INDEX IF NOT EXISTS idx_bookings_target_id ON bookings(target_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(type);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_sender_status ON bookings(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_target_status ON bookings(target_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    duration_hours NUMERIC(4, 2),
    location JSONB,
    required_roles TEXT[] DEFAULT '{}',
    participants JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Planning' CHECK (status IN ('Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled')),
    budget NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_booking_id ON sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_sessions_creator_id ON sessions(creator_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

CREATE TABLE IF NOT EXISTS broadcast_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    location JSONB,
    required_roles TEXT[] DEFAULT '{}',
    budget_range JSONB,
    urgency TEXT DEFAULT 'Normal' CHECK (urgency IN ('Low', 'Normal', 'High', 'Urgent')),
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Filled', 'Cancelled', 'Expired')),
    responses JSONB DEFAULT '[]'::jsonb,
    selected_user_id UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcast_requests_creator_id ON broadcast_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_requests_date ON broadcast_requests(date);
CREATE INDEX IF NOT EXISTS idx_broadcast_requests_status ON broadcast_requests(status);
CREATE INDEX IF NOT EXISTS idx_broadcast_requests_urgency ON broadcast_requests(urgency);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    categories JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, booking_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target_id ON reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- =====================================================
-- MARKETPLACE MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS market_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('gear', 'seshfx', 'service', 'other')),
    subcategory TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    condition TEXT CHECK (condition IN ('New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor')),
    images JSONB DEFAULT '[]'::jsonb,
    location JSONB,
    shipping_available BOOLEAN DEFAULT true,
    local_pickup_available BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'removed', 'expired')),
    views INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sold_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_market_items_seller_id ON market_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_market_items_category ON market_items(category);
CREATE INDEX IF NOT EXISTS idx_market_items_category_status ON market_items(category, status);
CREATE INDEX IF NOT EXISTS idx_market_items_status ON market_items(status);
CREATE INDEX IF NOT EXISTS idx_market_items_created_at ON market_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_items_price ON market_items(price);

CREATE TABLE IF NOT EXISTS gear_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    model TEXT,
    category TEXT CHECK (category IN ('Audio Interface', 'Microphone', 'Monitor', 'Controller', 'Software', 'Instrument', 'Other')),
    condition TEXT CHECK (condition IN ('New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor')),
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    images JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    location JSONB,
    shipping_available BOOLEAN DEFAULT true,
    local_pickup_available BOOLEAN DEFAULT true,
    safe_exchange_enabled BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'removed')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sold_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gear_listings_seller_id ON gear_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_gear_listings_category ON gear_listings(category);
CREATE INDEX IF NOT EXISTS idx_gear_listings_status ON gear_listings(status);
CREATE INDEX IF NOT EXISTS idx_gear_listings_price ON gear_listings(price);
CREATE INDEX IF NOT EXISTS idx_gear_listings_created_at ON gear_listings(created_at DESC);

CREATE TABLE IF NOT EXISTS gear_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES gear_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    shipping_method TEXT CHECK (shipping_method IN ('shipping', 'pickup', 'safe_exchange')),
    shipping_address JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
    transaction_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gear_orders_listing_id ON gear_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_gear_orders_buyer_id ON gear_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_gear_orders_seller_id ON gear_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_gear_orders_status ON gear_orders(status);
CREATE INDEX IF NOT EXISTS idx_gear_orders_created_at ON gear_orders(created_at DESC);

CREATE TABLE IF NOT EXISTS gear_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES gear_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    offer_price NUMERIC(10, 2) NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'withdrawn')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gear_offers_listing_id ON gear_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_gear_offers_buyer_id ON gear_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_gear_offers_seller_id ON gear_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_gear_offers_status ON gear_offers(status);

CREATE TABLE IF NOT EXISTS safe_exchange_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES gear_orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    escrow_status TEXT DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'held', 'released', 'refunded', 'disputed')),
    buyer_verified BOOLEAN DEFAULT false,
    seller_verified BOOLEAN DEFAULT false,
    shipping_verified BOOLEAN DEFAULT false,
    photo_verification JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_safe_exchange_order_id ON safe_exchange_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_safe_exchange_buyer_id ON safe_exchange_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_safe_exchange_seller_id ON safe_exchange_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_safe_exchange_escrow_status ON safe_exchange_transactions(escrow_status);

CREATE TABLE IF NOT EXISTS marketplace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('Sample Pack', 'Loop Pack', 'Preset Pack', 'Plugin', 'Template', 'Other')),
    price NUMERIC(10, 2) NOT NULL,
    preview_audio_url TEXT,
    preview_image_url TEXT,
    file_url TEXT,
    file_size BIGINT,
    tags TEXT[] DEFAULT '{}',
    genre TEXT,
    bpm INTEGER,
    key TEXT,
    downloads_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    rating_average NUMERIC(3, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'removed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_tags ON marketplace_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_created_at ON marketplace_items(created_at DESC);

CREATE TABLE IF NOT EXISTS user_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    downloaded_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_item_id ON user_library(item_id);
CREATE INDEX IF NOT EXISTS idx_user_library_purchased_at ON user_library(purchased_at DESC);

-- =====================================================
-- PAYMENTS MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE UNIQUE,
    balance NUMERIC(12, 2) DEFAULT 0 CHECK (balance >= 0),
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'reward', 'purchase', 'sale', 'fee')),
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    payment_method TEXT,
    payment_intent_id TEXT,
    refund_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_intent_id ON transactions(payment_intent_id);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'trialing')),
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMPTZ,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal', 'wallet')),
    provider TEXT,
    provider_id TEXT,
    is_default BOOLEAN DEFAULT false,
    last4 TEXT,
    brand TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    billing_details JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default) WHERE is_default = true;

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    items JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- =====================================================
-- BUSINESS CENTER MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address JSONB NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    amenities TEXT[] DEFAULT '{}',
    equipment_list JSONB DEFAULT '[]'::jsonb,
    rooms JSONB DEFAULT '[]'::jsonb,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    pricing JSONB DEFAULT '{}'::jsonb,
    policies JSONB DEFAULT '{}'::jsonb,
    is_verified BOOLEAN DEFAULT false,
    rating_average NUMERIC(3, 2),
    review_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_verification')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studios_owner_id ON studios(owner_id);
CREATE INDEX IF NOT EXISTS idx_studios_status ON studios(status);
CREATE INDEX IF NOT EXISTS idx_studios_is_verified ON studios(is_verified);
CREATE INDEX IF NOT EXISTS idx_studios_rating ON studios(rating_average DESC);

CREATE TABLE IF NOT EXISTS label_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'Artist' CHECK (role IN ('Artist', 'Producer', 'Songwriter', 'Engineer', 'Manager')),
    contract_type TEXT CHECK (contract_type IN ('Exclusive', 'Non-Exclusive', 'Distribution Only', 'Management')),
    signed_date DATE,
    contract_end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'terminated')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(label_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_label_roster_label_id ON label_roster(label_id);
CREATE INDEX IF NOT EXISTS idx_label_roster_artist_id ON label_roster(artist_id);
CREATE INDEX IF NOT EXISTS idx_label_roster_status ON label_roster(status);

CREATE TABLE IF NOT EXISTS distribution_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    release_id UUID,
    platform TEXT NOT NULL,
    streams BIGINT DEFAULT 0,
    downloads BIGINT DEFAULT 0,
    revenue NUMERIC(12, 2) DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_distribution_stats_user_id ON distribution_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_release_id ON distribution_stats(release_id);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_platform ON distribution_stats(platform);
CREATE INDEX IF NOT EXISTS idx_distribution_stats_period ON distribution_stats(period_start, period_end);

CREATE TABLE IF NOT EXISTS royalty_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    release_id UUID,
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    total_streams BIGINT DEFAULT 0,
    platform_breakdown JSONB DEFAULT '{}'::jsonb,
    artist_breakdown JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'paid')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_royalty_reports_user_id ON royalty_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_royalty_reports_release_id ON royalty_reports(release_id);
CREATE INDEX IF NOT EXISTS idx_royalty_reports_period ON royalty_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_royalty_reports_status ON royalty_reports(status);

CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    label_id UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('Single', 'EP', 'Album', 'Mixtape', 'Compilation')),
    release_date DATE,
    cover_art_url TEXT,
    genre TEXT,
    subgenre TEXT,
    isrc TEXT,
    upc TEXT,
    platforms JSONB DEFAULT '[]'::jsonb,
    tracks JSONB DEFAULT '[]'::jsonb,
    total_streams BIGINT DEFAULT 0,
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'distributed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_label_id ON releases(label_id);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);

CREATE TABLE IF NOT EXISTS school_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    partner_type TEXT CHECK (partner_type IN ('Studio', 'Label', 'Venue', 'Other')),
    partner_id UUID NOT NULL,
    partnership_type TEXT CHECK (partnership_type IN ('Internship', 'Workshop', 'Event', 'Collaboration')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_partners_school_id ON school_partners(school_id);
CREATE INDEX IF NOT EXISTS idx_school_partners_partner_id ON school_partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_school_partners_status ON school_partners(status);

-- =====================================================
-- TECH SERVICES MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    tech_id UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    service_category TEXT NOT NULL CHECK (service_category IN ('Repair', 'Maintenance', 'Installation', 'Calibration', 'Inspection', 'Consultation', 'Other')),
    equipment_name TEXT NOT NULL,
    equipment_brand TEXT,
    equipment_model TEXT,
    issue_description TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
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

CREATE INDEX IF NOT EXISTS idx_service_requests_requester_id ON service_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_tech_id ON service_requests(tech_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(service_category);
CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON service_requests(priority);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS equipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    category TEXT,
    serial_number TEXT,
    purchase_date DATE,
    purchase_price NUMERIC(10, 2),
    condition TEXT CHECK (condition IN ('New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair')),
    location TEXT,
    notes TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    service_history JSONB DEFAULT '[]'::jsonb,
    warranty_expires DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_items_user_id ON equipment_items(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_items_category ON equipment_items(category);
CREATE INDEX IF NOT EXISTS idx_equipment_items_condition ON equipment_items(condition);

CREATE TABLE IF NOT EXISTS equipment_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    manual_url TEXT,
    support_url TEXT,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_by UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand, model)
);

CREATE INDEX IF NOT EXISTS idx_equipment_database_brand ON equipment_database(brand);
CREATE INDEX IF NOT EXISTS idx_equipment_database_category ON equipment_database(category);
CREATE INDEX IF NOT EXISTS idx_equipment_database_verified ON equipment_database(verified);

CREATE TABLE IF NOT EXISTS equipment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    manual_url TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Merged')),
    reviewed_by UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    reward_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_submissions_submitter_id ON equipment_submissions(submitter_id);
CREATE INDEX IF NOT EXISTS idx_equipment_submissions_status ON equipment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_equipment_submissions_created_at ON equipment_submissions(created_at DESC);

CREATE TABLE IF NOT EXISTS tech_public_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    bio TEXT,
    specialties TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    years_experience INTEGER,
    hourly_rate NUMERIC(10, 2),
    location JSONB,
    service_radius INTEGER,
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

CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_user_id ON tech_public_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_specialties ON tech_public_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_availability_status ON tech_public_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_rating ON tech_public_profiles(rating_average DESC);
CREATE INDEX IF NOT EXISTS idx_tech_public_profiles_is_verified_tech ON tech_public_profiles(is_verified_tech);

-- =====================================================
-- EDUCATION MODULE
-- =====================================================

CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,
    address JSONB,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    type TEXT CHECK (type IN ('Music School', 'University', 'College', 'Academy', 'Studio School', 'Other')),
    accreditation TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON schools(is_active);

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    school_id UUID,
    student_id TEXT,
    enrollment_date DATE,
    graduation_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'suspended', 'expelled')),
    program TEXT,
    cohort TEXT,
    gpa NUMERIC(4, 2),
    credits_earned INTEGER DEFAULT 0,
    internship_studio_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, school_id)
);

CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_cohort ON students(cohort);

CREATE TABLE IF NOT EXISTS school_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    school_id UUID,
    role_id UUID,
    title TEXT,
    department TEXT,
    hire_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    permissions JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, school_id)
);

CREATE INDEX IF NOT EXISTS idx_school_staff_user_id ON school_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_school_staff_school_id ON school_staff(school_id);
CREATE INDEX IF NOT EXISTS idx_school_staff_role_id ON school_staff(role_id);
CREATE INDEX IF NOT EXISTS idx_school_staff_status ON school_staff(status);

CREATE TABLE IF NOT EXISTS school_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, name)
);

CREATE INDEX IF NOT EXISTS idx_school_roles_school_id ON school_roles(school_id);

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    instructor_id UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    schedule JSONB DEFAULT '{}'::jsonb,
    prerequisites TEXT[] DEFAULT '{}',
    max_enrollment INTEGER,
    current_enrollment INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    semester TEXT,
    year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, code, semester, year)
);

CREATE INDEX IF NOT EXISTS idx_courses_school_id ON courses(school_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_semester_year ON courses(semester, year);

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID,
    course_id UUID,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'failed', 'incomplete')),
    grade TEXT,
    grade_points NUMERIC(4, 2),
    attendance_percentage NUMERIC(5, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID,
    name TEXT NOT NULL,
    description TEXT,
    courses JSONB DEFAULT '[]'::jsonb,
    estimated_duration_weeks INTEGER,
    difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_school_id ON learning_paths(school_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_status ON learning_paths(status);

CREATE TABLE IF NOT EXISTS edu_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    program TEXT,
    student_ids UUID[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edu_cohorts_school_id ON edu_cohorts(school_id);
CREATE INDEX IF NOT EXISTS idx_edu_cohorts_status ON edu_cohorts(status);

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID,
    author_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT[] DEFAULT '{}',
    priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    expires_at TIMESTAMPTZ,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_school_id ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);

CREATE TABLE IF NOT EXISTS edu_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('Document', 'Video', 'Audio', 'Link', 'File', 'Other')),
    url TEXT,
    file_url TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    access_level TEXT DEFAULT 'Public' CHECK (access_level IN ('Public', 'Students', 'Staff', 'Restricted')),
    created_by UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_edu_resources_school_id ON edu_resources(school_id);
CREATE INDEX IF NOT EXISTS idx_edu_resources_type ON edu_resources(type);
CREATE INDEX IF NOT EXISTS idx_edu_resources_category ON edu_resources(category);
CREATE INDEX IF NOT EXISTS idx_edu_resources_tags ON edu_resources USING GIN(tags);

CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID,
    student_id UUID,
    course_id UUID,
    evaluator_id UUID NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('Assignment', 'Exam', 'Project', 'Performance', 'Portfolio', 'Other')),
    title TEXT NOT NULL,
    score NUMERIC(5, 2),
    max_score NUMERIC(5, 2),
    grade TEXT,
    feedback TEXT,
    rubric JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_school_id ON evaluations(school_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_course_id ON evaluations(course_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id);

CREATE TABLE IF NOT EXISTS internship_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID,
    studio_id UUID,
    date DATE NOT NULL,
    hours_worked NUMERIC(4, 2) NOT NULL,
    tasks_completed TEXT,
    skills_learned TEXT[] DEFAULT '{}',
    supervisor_notes TEXT,
    student_notes TEXT,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internship_logs_student_id ON internship_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_logs_studio_id ON internship_logs(studio_id);
CREATE INDEX IF NOT EXISTS idx_internship_logs_date ON internship_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_internship_logs_verified ON internship_logs(verified);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID,
    user_id UUID REFERENCES clerk_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_school_id ON audit_log(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS trigger_bookings_updated_at ON bookings;
CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_sessions_updated_at ON sessions;
CREATE TRIGGER trigger_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_broadcast_requests_updated_at ON broadcast_requests;
CREATE TRIGGER trigger_broadcast_requests_updated_at
    BEFORE UPDATE ON broadcast_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_market_items_updated_at ON market_items;
CREATE TRIGGER trigger_market_items_updated_at
    BEFORE UPDATE ON market_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gear_listings_updated_at ON gear_listings;
CREATE TRIGGER trigger_gear_listings_updated_at
    BEFORE UPDATE ON gear_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gear_orders_updated_at ON gear_orders;
CREATE TRIGGER trigger_gear_orders_updated_at
    BEFORE UPDATE ON gear_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gear_offers_updated_at ON gear_offers;
CREATE TRIGGER trigger_gear_offers_updated_at
    BEFORE UPDATE ON gear_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_safe_exchange_transactions_updated_at ON safe_exchange_transactions;
CREATE TRIGGER trigger_safe_exchange_transactions_updated_at
    BEFORE UPDATE ON safe_exchange_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_marketplace_items_updated_at ON marketplace_items;
CREATE TRIGGER trigger_marketplace_items_updated_at
    BEFORE UPDATE ON marketplace_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_wallets_updated_at ON wallets;
CREATE TRIGGER trigger_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER trigger_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON invoices;
CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_studios_updated_at ON studios;
CREATE TRIGGER trigger_studios_updated_at
    BEFORE UPDATE ON studios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_label_roster_updated_at ON label_roster;
CREATE TRIGGER trigger_label_roster_updated_at
    BEFORE UPDATE ON label_roster
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_distribution_stats_updated_at ON distribution_stats;
CREATE TRIGGER trigger_distribution_stats_updated_at
    BEFORE UPDATE ON distribution_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_royalty_reports_updated_at ON royalty_reports;
CREATE TRIGGER trigger_royalty_reports_updated_at
    BEFORE UPDATE ON royalty_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_releases_updated_at ON releases;
CREATE TRIGGER trigger_releases_updated_at
    BEFORE UPDATE ON releases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_school_partners_updated_at ON school_partners;
CREATE TRIGGER trigger_school_partners_updated_at
    BEFORE UPDATE ON school_partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_service_requests_updated_at ON service_requests;
CREATE TRIGGER trigger_service_requests_updated_at
    BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_equipment_items_updated_at ON equipment_items;
CREATE TRIGGER trigger_equipment_items_updated_at
    BEFORE UPDATE ON equipment_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_equipment_database_updated_at ON equipment_database;
CREATE TRIGGER trigger_equipment_database_updated_at
    BEFORE UPDATE ON equipment_database
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_equipment_submissions_updated_at ON equipment_submissions;
CREATE TRIGGER trigger_equipment_submissions_updated_at
    BEFORE UPDATE ON equipment_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_tech_public_profiles_updated_at ON tech_public_profiles;
CREATE TRIGGER trigger_tech_public_profiles_updated_at
    BEFORE UPDATE ON tech_public_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_schools_updated_at ON schools;
CREATE TRIGGER trigger_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_students_updated_at ON students;
CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_school_staff_updated_at ON school_staff;
CREATE TRIGGER trigger_school_staff_updated_at
    BEFORE UPDATE ON school_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_school_roles_updated_at ON school_roles;
CREATE TRIGGER trigger_school_roles_updated_at
    BEFORE UPDATE ON school_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_courses_updated_at ON courses;
CREATE TRIGGER trigger_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_enrollments_updated_at ON enrollments;
CREATE TRIGGER trigger_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_learning_paths_updated_at ON learning_paths;
CREATE TRIGGER trigger_learning_paths_updated_at
    BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_edu_cohorts_updated_at ON edu_cohorts;
CREATE TRIGGER trigger_edu_cohorts_updated_at
    BEFORE UPDATE ON edu_cohorts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON announcements;
CREATE TRIGGER trigger_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRICYCLE IF EXISTS trigger_edu_resources_updated_at ON edu_resources;
CREATE TRIGGER trigger_edu_resources_updated_at
    BEFORE UPDATE ON edu_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_evaluations_updated_at ON evaluations;
CREATE TRIGGER trigger_evaluations_updated_at
    BEFORE UPDATE ON evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_internship_logs_updated_at ON internship_logs;
CREATE TRIGGER trigger_internship_logs_updated_at
    BEFORE UPDATE ON internship_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Course enrollment count trigger
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'enrolled' THEN
        UPDATE courses SET current_enrollment = current_enrollment + 1 WHERE id = NEW.course_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'enrolled' AND NEW.status != 'enrolled' THEN
            UPDATE courses SET current_enrollment = GREATEST(0, current_enrollment - 1) WHERE id = NEW.course_id;
        ELSIF OLD.status != 'enrolled' AND NEW.status = 'enrolled' THEN
            UPDATE courses SET current_enrollment = current_enrollment + 1 WHERE id = NEW.course_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'enrolled' THEN
        UPDATE courses SET current_enrollment = GREATEST(0, current_enrollment - 1) WHERE id = OLD.course_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_course_enrollment_count ON enrollments;
CREATE TRIGGER trigger_update_course_enrollment_count
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count();

-- Single default payment method trigger
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE payment_methods
        SET is_default = false
        WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_default_payment_method ON payment_methods;
CREATE TRIGGER trigger_ensure_single_default_payment_method
    BEFORE INSERT OR UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment_method();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- NOTE: RLS policies use auth.uid() which requires Clerk JWT context.
-- For development/testing without Clerk, you can disable RLS:
-- ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_exchange_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies (these will need proper Clerk JWT integration)
-- For now, using a permissive approach for development

-- Bookings
CREATE POLICY "Users can view their bookings" ON bookings
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = target_id);
CREATE POLICY "Users can insert their bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their bookings" ON bookings
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = target_id);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (is_public = true OR reviewer_id = auth.uid() OR target_id = auth.uid());
CREATE POLICY "Users can insert their reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Market items (everyone can view active)
CREATE POLICY "Market items are viewable by everyone" ON market_items
    FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- Gear listings
CREATE POLICY "Gear listings are viewable by everyone" ON gear_listings
    FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- Wallets
CREATE POLICY "Users can view their own wallet" ON wallets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Wallets can be created" ON wallets
    FOR INSERT WITH CHECK (true);

-- Transactions
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Transactions can be created" ON transactions
    FOR INSERT WITH CHECK (true);

-- Studios
CREATE POLICY "Studios are viewable by everyone" ON studios
    FOR SELECT USING (status = 'active' OR owner_id = auth.uid());
CREATE POLICY "Users can insert their own studios" ON studios
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Schools
CREATE POLICY "Schools are viewable by everyone" ON schools
    FOR SELECT USING (is_active = true);

-- Courses
CREATE POLICY "Courses are viewable by everyone" ON courses
    FOR SELECT USING (status = 'active' OR status = 'archived');

-- Equipment database
CREATE POLICY "Equipment database is viewable by everyone" ON equipment_database
    FOR SELECT USING (true);

-- Tech public profiles
CREATE POLICY "Tech public profiles are viewable by everyone" ON tech_public_profiles
    FOR SELECT USING (true);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE bookings IS 'Booking requests for sessions, studio rentals, and talent services';
COMMENT ON TABLE sessions IS 'Extended session information with participants';
COMMENT ON TABLE broadcast_requests IS 'Open requests for talent/services';
COMMENT ON TABLE reviews IS 'User reviews and ratings';
COMMENT ON TABLE market_items IS 'General marketplace items';
COMMENT ON TABLE gear_listings IS 'Music equipment and gear listings';
COMMENT ON TABLE gear_orders IS 'Orders for gear purchases';
COMMENT ON TABLE gear_offers IS 'Negotiation offers for gear listings';
COMMENT ON TABLE safe_exchange_transactions IS 'Escrow transactions for safe gear exchanges';
COMMENT ON TABLE marketplace_items IS 'Digital assets (SeshFx) for sale';
COMMENT ON TABLE user_library IS 'User library of purchased digital assets';
COMMENT ON TABLE wallets IS 'User wallet balances';
COMMENT ON TABLE transactions IS 'All financial transactions (Stripe integration)';
COMMENT ON TABLE subscriptions IS 'User subscription plans (Stripe)';
COMMENT ON TABLE payment_methods IS 'Saved payment methods (Stripe cards, bank accounts)';
COMMENT ON TABLE invoices IS 'Billing invoices';
COMMENT ON TABLE studios IS 'Music studio listings and information';
COMMENT ON TABLE label_roster IS 'Label artist roster and contracts';
COMMENT ON TABLE distribution_stats IS 'Music distribution statistics by platform';
COMMENT ON TABLE royalty_reports IS 'Royalty distribution reports';
COMMENT ON TABLE releases IS 'Music releases (singles, albums, EPs)';
COMMENT ON TABLE school_partners IS 'Partnerships between schools and businesses';
COMMENT ON TABLE service_requests IS 'Service requests for equipment repair and maintenance';
COMMENT ON TABLE equipment_items IS 'User equipment inventory';
COMMENT ON TABLE equipment_database IS 'Community gear database with verified equipment information';
COMMENT ON TABLE equipment_submissions IS 'User submissions to the equipment database';
COMMENT ON TABLE tech_public_profiles IS 'Public tech service provider profiles';
COMMENT ON TABLE schools IS 'Educational institutions';
COMMENT ON TABLE students IS 'Student enrollment records';
COMMENT ON TABLE school_staff IS 'School staff and administrators';
COMMENT ON TABLE school_roles IS 'Role definitions with permissions';
COMMENT ON TABLE courses IS 'Course catalog';
COMMENT ON TABLE enrollments IS 'Student course enrollments';
COMMENT ON TABLE learning_paths IS 'Structured learning paths';
COMMENT ON TABLE edu_cohorts IS 'Student cohorts/groups';
COMMENT ON TABLE announcements IS 'School announcements';
COMMENT ON TABLE edu_resources IS 'Educational resources';
COMMENT ON TABLE evaluations IS 'Student evaluations and grades';
COMMENT ON TABLE internship_logs IS 'Internship hour logs';
COMMENT ON TABLE audit_log IS 'System audit log';

-- =====================================================
-- IMPORTANT NOTES FOR NEON + CLERK SETUP
-- =====================================================
--
-- 1. Clerk Authentication Context:
--    The RLS policies above use auth.uid() which requires:
--    - Clerk to include user_id in JWT token
--    - Use Neon's "connection with authentication" feature
--    - Or use middleware to set the user context
--
-- 2. Alternative: Disable RLS and handle authorization in application code
--    - For demo: You can disable RLS temporarily
--    - ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
--
-- 3. For Development:
--    - These tables work immediately for queries
--    - RLS policies may need adjustment based on Clerk integration
--
-- 4. Migration from Supabase:
--    - Original files use auth.users (Supabase)
--    - This file converts to clerk_users (Neon + Clerk)
--    - All foreign keys updated to clerk_users
-- =====================================================

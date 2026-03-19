-- =====================================================
-- MARKETPLACE MODULE - SQL Editor Script (Fixed)
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Marketplace module (Gear Exchange & SeshFx Store)
--
-- MIGRATION-SAFE: This script can be run multiple times safely.
-- It will:
--   - Create tables if they don't exist
--   - Add missing columns to existing tables
--   - Create indexes only if columns exist
--   - Drop and recreate triggers (DROP IF EXISTS then CREATE)
--   - Recreate policies (DROP IF EXISTS then CREATE)
-- =====================================================

-- =====================================================
-- MARKET ITEMS TABLE (General marketplace items)
-- =====================================================
CREATE TABLE IF NOT EXISTS market_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('gear', 'seshfx', 'service', 'other')),
    subcategory TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    condition TEXT CHECK (condition IN ('New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor')),
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    location JSONB, -- {city, state, zip, lat, lng}
    shipping_available BOOLEAN DEFAULT true,
    local_pickup_available BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'removed', 'expired')),
    views INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sold_at TIMESTAMPTZ
);

-- Add missing columns if table exists (migration-safe)
DO $$ 
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'category') THEN
        ALTER TABLE market_items ADD COLUMN category TEXT NOT NULL DEFAULT 'other';
        ALTER TABLE market_items ADD CONSTRAINT market_items_category_check 
            CHECK (category IN ('gear', 'seshfx', 'service', 'other'));
    ELSE
        -- If column exists but doesn't have the check constraint, add it
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'market_items' 
                       AND constraint_name = 'market_items_category_check') THEN
            ALTER TABLE market_items ADD CONSTRAINT market_items_category_check 
                CHECK (category IN ('gear', 'seshfx', 'service', 'other'));
        END IF;
    END IF;
    
    -- Add other columns that might be missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'subcategory') THEN
        ALTER TABLE market_items ADD COLUMN subcategory TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'currency') THEN
        ALTER TABLE market_items ADD COLUMN currency TEXT DEFAULT 'USD';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'condition') THEN
        ALTER TABLE market_items ADD COLUMN condition TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'images') THEN
        ALTER TABLE market_items ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'location') THEN
        ALTER TABLE market_items ADD COLUMN location JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'shipping_available') THEN
        ALTER TABLE market_items ADD COLUMN shipping_available BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'local_pickup_available') THEN
        ALTER TABLE market_items ADD COLUMN local_pickup_available BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'status') THEN
        ALTER TABLE market_items ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'views') THEN
        ALTER TABLE market_items ADD COLUMN views INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'favorites_count') THEN
        ALTER TABLE market_items ADD COLUMN favorites_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'market_items' AND column_name = 'sold_at') THEN
        ALTER TABLE market_items ADD COLUMN sold_at TIMESTAMPTZ;
    END IF;
END $$;

-- Indexes for market_items (only create if columns exist)
CREATE INDEX IF NOT EXISTS idx_market_items_seller_id ON market_items(seller_id);
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'market_items' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_market_items_category ON market_items(category);
        CREATE INDEX IF NOT EXISTS idx_market_items_category_status ON market_items(category, status);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_market_items_status ON market_items(status);
CREATE INDEX IF NOT EXISTS idx_market_items_created_at ON market_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_items_price ON market_items(price);

-- =====================================================
-- GEAR LISTINGS TABLE (Equipment/Music Gear)
-- =====================================================
CREATE TABLE IF NOT EXISTS gear_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    model TEXT,
    category TEXT CHECK (category IN ('Audio Interface', 'Microphone', 'Monitor', 'Controller', 'Software', 'Instrument', 'Other')),
    condition TEXT CHECK (condition IN ('New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor')),
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    images JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb, -- Technical specs
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

-- Add missing columns if table exists (migration-safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gear_listings' AND column_name = 'category') THEN
        ALTER TABLE gear_listings ADD COLUMN category TEXT;
    END IF;
END $$;

-- Indexes for gear_listings (only create if columns exist)
CREATE INDEX IF NOT EXISTS idx_gear_listings_seller_id ON gear_listings(seller_id);
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'gear_listings' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_gear_listings_category ON gear_listings(category);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_gear_listings_status ON gear_listings(status);
CREATE INDEX IF NOT EXISTS idx_gear_listings_price ON gear_listings(price);
CREATE INDEX IF NOT EXISTS idx_gear_listings_created_at ON gear_listings(created_at DESC);

-- =====================================================
-- GEAR ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gear_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES gear_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    shipping_method TEXT CHECK (shipping_method IN ('shipping', 'pickup', 'safe_exchange')),
    shipping_address JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
    transaction_id UUID, -- Reference to safe_exchange_transactions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for gear_orders
CREATE INDEX IF NOT EXISTS idx_gear_orders_listing_id ON gear_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_gear_orders_buyer_id ON gear_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_gear_orders_seller_id ON gear_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_gear_orders_status ON gear_orders(status);
CREATE INDEX IF NOT EXISTS idx_gear_orders_created_at ON gear_orders(created_at DESC);

-- =====================================================
-- GEAR OFFERS TABLE (Negotiation offers)
-- =====================================================
CREATE TABLE IF NOT EXISTS gear_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES gear_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    offer_price NUMERIC(10, 2) NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'withdrawn')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for gear_offers
CREATE INDEX IF NOT EXISTS idx_gear_offers_listing_id ON gear_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_gear_offers_buyer_id ON gear_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_gear_offers_seller_id ON gear_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_gear_offers_status ON gear_offers(status);

-- =====================================================
-- SAFE EXCHANGE TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS safe_exchange_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES gear_orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    escrow_status TEXT DEFAULT 'pending' CHECK (escrow_status IN ('pending', 'held', 'released', 'refunded', 'disputed')),
    buyer_verified BOOLEAN DEFAULT false,
    seller_verified BOOLEAN DEFAULT false,
    shipping_verified BOOLEAN DEFAULT false,
    photo_verification JSONB, -- {buyer_photos, seller_photos, shipping_photos}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes for safe_exchange_transactions
CREATE INDEX IF NOT EXISTS idx_safe_exchange_order_id ON safe_exchange_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_safe_exchange_buyer_id ON safe_exchange_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_safe_exchange_seller_id ON safe_exchange_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_safe_exchange_escrow_status ON safe_exchange_transactions(escrow_status);

-- =====================================================
-- MARKETPLACE ITEMS TABLE (SeshFx Store - Digital Assets)
-- =====================================================
CREATE TABLE IF NOT EXISTS marketplace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('Sample Pack', 'Loop Pack', 'Preset Pack', 'Plugin', 'Template', 'Other')),
    price NUMERIC(10, 2) NOT NULL,
    preview_audio_url TEXT,
    preview_image_url TEXT,
    file_url TEXT, -- Downloadable file URL (after purchase)
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

-- Add missing columns if table exists (migration-safe)
DO $$ 
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'category') THEN
        ALTER TABLE marketplace_items ADD COLUMN category TEXT;
    END IF;
    
    -- Add other columns that might be missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'preview_audio_url') THEN
        ALTER TABLE marketplace_items ADD COLUMN preview_audio_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'preview_image_url') THEN
        ALTER TABLE marketplace_items ADD COLUMN preview_image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'file_url') THEN
        ALTER TABLE marketplace_items ADD COLUMN file_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'file_size') THEN
        ALTER TABLE marketplace_items ADD COLUMN file_size BIGINT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'tags') THEN
        ALTER TABLE marketplace_items ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'genre') THEN
        ALTER TABLE marketplace_items ADD COLUMN genre TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'bpm') THEN
        ALTER TABLE marketplace_items ADD COLUMN bpm INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'key') THEN
        ALTER TABLE marketplace_items ADD COLUMN key TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'downloads_count') THEN
        ALTER TABLE marketplace_items ADD COLUMN downloads_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'sales_count') THEN
        ALTER TABLE marketplace_items ADD COLUMN sales_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'rating_average') THEN
        ALTER TABLE marketplace_items ADD COLUMN rating_average NUMERIC(3, 2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_items' AND column_name = 'status') THEN
        ALTER TABLE marketplace_items ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Indexes for marketplace_items (only create if columns exist)
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON marketplace_items(seller_id);
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'marketplace_items' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON marketplace_items(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'marketplace_items' AND column_name = 'tags') THEN
        CREATE INDEX IF NOT EXISTS idx_marketplace_items_tags ON marketplace_items USING GIN(tags);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_created_at ON marketplace_items(created_at DESC);

-- =====================================================
-- USER LIBRARY TABLE (Purchased digital assets)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    downloaded_at TIMESTAMPTZ,
    download_count INTEGER DEFAULT 0,
    UNIQUE(user_id, item_id)
);

-- Indexes for user_library
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_item_id ON user_library(item_id);
CREATE INDEX IF NOT EXISTS idx_user_library_purchased_at ON user_library(purchased_at DESC);

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
DROP TRIGGER IF EXISTS trigger_market_items_updated_at ON market_items;
DROP TRIGGER IF EXISTS trigger_gear_listings_updated_at ON gear_listings;
DROP TRIGGER IF EXISTS trigger_gear_orders_updated_at ON gear_orders;
DROP TRIGGER IF EXISTS trigger_gear_offers_updated_at ON gear_offers;
DROP TRIGGER IF EXISTS trigger_safe_exchange_transactions_updated_at ON safe_exchange_transactions;
DROP TRIGGER IF EXISTS trigger_marketplace_items_updated_at ON marketplace_items;

-- Create triggers
CREATE TRIGGER trigger_market_items_updated_at
    BEFORE UPDATE ON market_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_gear_listings_updated_at
    BEFORE UPDATE ON gear_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_gear_orders_updated_at
    BEFORE UPDATE ON gear_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_gear_offers_updated_at
    BEFORE UPDATE ON gear_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_safe_exchange_transactions_updated_at
    BEFORE UPDATE ON safe_exchange_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_marketplace_items_updated_at
    BEFORE UPDATE ON marketplace_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_exchange_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- Market Items: Everyone can view active items
DROP POLICY IF EXISTS "Market items are viewable by everyone" ON market_items;
CREATE POLICY "Market items are viewable by everyone" ON market_items
    FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- Gear Listings: Everyone can view active listings
DROP POLICY IF EXISTS "Gear listings are viewable by everyone" ON gear_listings;
CREATE POLICY "Gear listings are viewable by everyone" ON gear_listings
    FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- Gear Orders: Users can see orders they're involved in
DROP POLICY IF EXISTS "Users can view their gear orders" ON gear_orders;
CREATE POLICY "Users can view their gear orders" ON gear_orders
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Gear Offers: Users can see offers they're involved in
DROP POLICY IF EXISTS "Users can view their gear offers" ON gear_offers;
CREATE POLICY "Users can view their gear offers" ON gear_offers
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Safe Exchange: Users can see transactions they're involved in
DROP POLICY IF EXISTS "Users can view their safe exchange transactions" ON safe_exchange_transactions;
CREATE POLICY "Users can view their safe exchange transactions" ON safe_exchange_transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Marketplace Items: Everyone can view active items
DROP POLICY IF EXISTS "Marketplace items are viewable by everyone" ON marketplace_items;
CREATE POLICY "Marketplace items are viewable by everyone" ON marketplace_items
    FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- User Library: Users can only see their own library
DROP POLICY IF EXISTS "Users can view their own library" ON user_library;
CREATE POLICY "Users can view their own library" ON user_library
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE market_items IS 'General marketplace items';
COMMENT ON TABLE gear_listings IS 'Music equipment and gear listings';
COMMENT ON TABLE gear_orders IS 'Orders for gear purchases';
COMMENT ON TABLE gear_offers IS 'Negotiation offers for gear listings';
COMMENT ON TABLE safe_exchange_transactions IS 'Escrow transactions for safe gear exchanges';
COMMENT ON TABLE marketplace_items IS 'Digital assets (SeshFx) for sale';
COMMENT ON TABLE user_library IS 'User library of purchased digital assets';


-- =====================================================
-- PAYMENTS MODULE - SQL Editor Script (Fixed)
-- =====================================================
-- This script sets up all database tables, columns, and indexes
-- needed for the Payments/Billing module (Wallets, Transactions, Subscriptions)
-- Updated for Vercel Stripe Integration
-- =====================================================

-- =====================================================
-- WALLETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance NUMERIC(12, 2) DEFAULT 0 CHECK (balance >= 0),
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'wallets'
    ) THEN
        -- Add id column if it doesn't exist (shouldn't happen, but just in case)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'id') THEN
            ALTER TABLE wallets ADD COLUMN id UUID DEFAULT gen_random_uuid();
        END IF;
        
        -- Ensure primary key exists on id column (needed for foreign key references)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                WHERE tc.table_name = 'wallets' 
                AND tc.constraint_type = 'PRIMARY KEY'
                AND ccu.column_name = 'id'
            ) THEN
                -- Drop any existing primary key first (if on different column)
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE table_name = 'wallets' AND constraint_type = 'PRIMARY KEY'
                ) THEN
                    -- Get the constraint name dynamically and drop it
                    DO $drop_pk$
                    DECLARE
                        pk_constraint_name TEXT;
                    BEGIN
                        SELECT constraint_name INTO pk_constraint_name
                        FROM information_schema.table_constraints 
                        WHERE table_name = 'wallets' AND constraint_type = 'PRIMARY KEY'
                        LIMIT 1;
                        
                        IF pk_constraint_name IS NOT NULL THEN
                            EXECUTE format('ALTER TABLE wallets DROP CONSTRAINT %I', pk_constraint_name);
                        END IF;
                    END;
                    $drop_pk$;
                END IF;
                ALTER TABLE wallets ADD PRIMARY KEY (id);
            END IF;
        END IF;
        
        -- Add other columns if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'user_id') THEN
            ALTER TABLE wallets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'balance') THEN
            ALTER TABLE wallets ADD COLUMN balance NUMERIC(12, 2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'currency') THEN
            ALTER TABLE wallets ADD COLUMN currency TEXT DEFAULT 'USD';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'created_at') THEN
            ALTER TABLE wallets ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'updated_at') THEN
            ALTER TABLE wallets ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Indexes for wallets (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
    END IF;
END $$;

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID, -- Foreign key added later after ensuring wallets.id has primary key
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'reward', 'purchase', 'sale', 'fee')),
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    description TEXT,
    reference_type TEXT, -- 'booking', 'marketplace_item', 'gear_order', etc.
    reference_id UUID, -- ID of the related record
    payment_method TEXT, -- 'wallet', 'stripe', 'paypal', etc.
    payment_intent_id TEXT, -- Stripe payment intent ID (Vercel Stripe Integration)
    refund_id TEXT, -- Stripe refund ID (for refunds)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'transactions'
    ) THEN
        -- Add id column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'id') THEN
            ALTER TABLE transactions ADD COLUMN id UUID DEFAULT gen_random_uuid();
            -- Only add primary key if one doesn't already exist
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'transactions' AND constraint_type = 'PRIMARY KEY'
            ) THEN
                ALTER TABLE transactions ADD PRIMARY KEY (id);
            END IF;
        END IF;
        
        -- Add wallet_id column if it doesn't exist (without foreign key - added later)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'wallet_id') THEN
            ALTER TABLE transactions ADD COLUMN wallet_id UUID;
        END IF;
        
        -- Add foreign key constraint to wallet_id if it doesn't exist and wallets.id has primary key
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'wallet_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'transactions' 
                AND constraint_name LIKE '%wallet_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'wallets' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE transactions ADD CONSTRAINT fk_transactions_wallet_id 
                        FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL;
                END IF;
            END IF;
        END IF;
        
        -- Add other columns if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id') THEN
            ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'type') THEN
            ALTER TABLE transactions ADD COLUMN type TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'amount') THEN
            ALTER TABLE transactions ADD COLUMN amount NUMERIC(12, 2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'currency') THEN
            ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'USD';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'status') THEN
            ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'pending';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'description') THEN
            ALTER TABLE transactions ADD COLUMN description TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'reference_type') THEN
            ALTER TABLE transactions ADD COLUMN reference_type TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'reference_id') THEN
            ALTER TABLE transactions ADD COLUMN reference_id UUID;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'payment_method') THEN
            ALTER TABLE transactions ADD COLUMN payment_method TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'payment_intent_id') THEN
            ALTER TABLE transactions ADD COLUMN payment_intent_id TEXT;
        END IF;
        
        -- Add refund_id for Vercel Stripe integration
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'refund_id') THEN
            ALTER TABLE transactions ADD COLUMN refund_id TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'metadata') THEN
            ALTER TABLE transactions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'created_at') THEN
            ALTER TABLE transactions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'completed_at') THEN
            ALTER TABLE transactions ADD COLUMN completed_at TIMESTAMPTZ;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'failed_at') THEN
            ALTER TABLE transactions ADD COLUMN failed_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- Indexes for transactions (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'wallet_id') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'reference_type')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'reference_id') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_type, reference_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
    END IF;
    
    -- Index for Stripe payment intent ID (Vercel Stripe Integration)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'payment_intent_id') THEN
        CREATE INDEX IF NOT EXISTS idx_transactions_payment_intent_id ON transactions(payment_intent_id);
    END IF;
END $$;

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Indexes for subscriptions (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id') THEN
        CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'current_period_end') THEN
        CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);
    END IF;
END $$;

-- =====================================================
-- PAYMENT METHODS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal', 'wallet')),
    provider TEXT, -- 'stripe', 'paypal', etc.
    provider_id TEXT, -- External provider's ID (Stripe payment method ID)
    is_default BOOLEAN DEFAULT false,
    last4 TEXT, -- Last 4 digits of card/account
    brand TEXT, -- 'visa', 'mastercard', etc.
    expiry_month INTEGER,
    expiry_year INTEGER,
    billing_details JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment_methods (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_methods' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_methods' AND column_name = 'is_default') THEN
            CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(user_id, is_default) WHERE is_default = true;
        END IF;
    END IF;
END $$;

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID, -- Foreign key added later after ensuring subscriptions.id has primary key
    transaction_id UUID, -- Foreign key added later after ensuring transactions.id has primary key
    invoice_number TEXT UNIQUE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    items JSONB DEFAULT '[]'::jsonb, -- Array of line items
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist (for existing tables)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'invoices'
    ) THEN
        -- Add subscription_id column if it doesn't exist (without foreign key - added later)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'subscription_id') THEN
            ALTER TABLE invoices ADD COLUMN subscription_id UUID;
        END IF;
        
        -- Add transaction_id column if it doesn't exist (without foreign key - added later)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'transaction_id') THEN
            ALTER TABLE invoices ADD COLUMN transaction_id UUID;
        END IF;
        
        -- Add foreign key constraints if they don't exist and referenced tables have primary keys
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'subscription_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'invoices' 
                AND constraint_name LIKE '%subscription_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'subscriptions' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE invoices ADD CONSTRAINT fk_invoices_subscription_id 
                        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL;
                END IF;
            END IF;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'transaction_id') THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'invoices' 
                AND constraint_name LIKE '%transaction_id%'
                AND constraint_type = 'FOREIGN KEY'
            ) THEN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                    WHERE tc.table_name = 'transactions' 
                    AND tc.constraint_type = 'PRIMARY KEY'
                    AND ccu.column_name = 'id'
                ) THEN
                    ALTER TABLE invoices ADD CONSTRAINT fk_invoices_transaction_id 
                        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL;
                END IF;
            END IF;
        END IF;
    END IF;
END $$;

-- Indexes for invoices (only create if columns exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'subscription_id') THEN
        CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'invoice_number') THEN
        CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
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
DROP TRIGGER IF EXISTS trigger_wallets_updated_at ON wallets;
DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS trigger_payment_methods_updated_at ON payment_methods;
DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON invoices;
DROP TRIGGER IF EXISTS trigger_ensure_single_default_payment_method ON payment_methods;

-- Create triggers
CREATE TRIGGER trigger_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default payment method per user
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

CREATE TRIGGER trigger_ensure_single_default_payment_method
    BEFORE INSERT OR UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_payment_method();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own wallet" ON wallets;
DROP POLICY IF EXISTS "Wallets can be created" ON wallets;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Transactions can be created" ON transactions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Subscriptions can be created" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Invoices can be created" ON invoices;

-- Wallets: Users can only see their own wallet
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can view their own wallet" ON wallets
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Wallets can be created" ON wallets
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Transactions: Users can only see their own transactions
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can view their own transactions" ON transactions
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Transactions can be created" ON transactions
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Subscriptions: Users can only see their own subscriptions
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can view their own subscriptions" ON subscriptions
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Subscriptions can be created" ON subscriptions
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Payment Methods: Users can only see their own payment methods
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_methods' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can view their own payment methods" ON payment_methods
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own payment methods" ON payment_methods
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Invoices: Users can only see their own invoices
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'user_id') THEN
        CREATE POLICY "Users can view their own invoices" ON invoices
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Invoices can be created" ON invoices
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE wallets IS 'User wallet balances';
COMMENT ON TABLE transactions IS 'All financial transactions (Vercel Stripe Integration)';
COMMENT ON TABLE subscriptions IS 'User subscription plans (Stripe)';
COMMENT ON TABLE payment_methods IS 'Saved payment methods (Stripe cards, bank accounts)';
COMMENT ON TABLE invoices IS 'Billing invoices';


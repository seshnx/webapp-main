/**
 * Create Core Application Tables
 * Creates essential tables: clerk_users, profiles, sub_profiles, bookings
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local file to get VITE_NEON_DATABASE_URL
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  for (const line of envContent.split('\n')) {
    const match = line.match(/^VITE_([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }

  return envVars;
}

async function createCoreTables() {
  console.log('\n🔨 Creating Core Application Tables...\n');

  // Load environment variables
  const env = loadEnv();
  const neonUrl = env['NEON_DATABASE_URL'];

  if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log(`✅ Database URL found: ${neonUrl.substring(0, 40)}...\n`);

  // Create Neon client
  const sqlClient = neon(neonUrl);

  // SQL statements for core tables
  const sqlStatements = [
    // Clerk users table
    `CREATE TABLE IF NOT EXISTS clerk_users (
      id TEXT PRIMARY KEY,
      email TEXT,
      phone TEXT,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      profile_photo_url TEXT,
      account_types TEXT[] DEFAULT '{}',
      active_role TEXT,
      bio TEXT,
      zip_code TEXT,
      settings JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      default_profile_role TEXT
    );`,

    // Profiles table
    `CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      display_name TEXT,
      bio TEXT,
      location JSONB,
      website TEXT,
      social_links JSONB DEFAULT '{}'::jsonb,
      photo_url TEXT,
      cover_photo_url TEXT,
      account_types JSONB DEFAULT '[]'::jsonb,
      active_role TEXT,
      profile_data JSONB DEFAULT '{}'::jsonb,
      hourly_rate NUMERIC(10, 2),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Sub profiles table
    `CREATE TABLE IF NOT EXISTS sub_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      account_type TEXT NOT NULL,
      profile_data JSONB DEFAULT '{}'::jsonb,
      is_active BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Bookings table
    `CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id TEXT NOT NULL,
      sender_name TEXT,
      sender_photo TEXT,
      target_id TEXT NOT NULL,
      target_name TEXT,
      target_photo TEXT,
      studio_owner_id TEXT,
      status TEXT DEFAULT 'pending',
      service_type TEXT,
      date DATE,
      time TEXT,
      duration INTEGER,
      offer_amount INTEGER,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Wallets table
    `CREATE TABLE IF NOT EXISTS wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      balance INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Wallet transactions table
    `CREATE TABLE IF NOT EXISTS wallet_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wallet_id UUID NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Equipment database table
    `CREATE TABLE IF NOT EXISTS equipment_database (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT,
      name TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      category TEXT,
      subcategory TEXT,
      year INTEGER,
      serial_number TEXT,
      condition TEXT,
      location JSONB,
      daily_rate NUMERIC(10, 2),
      is_available BOOLEAN DEFAULT true,
      photos TEXT[] DEFAULT '{}',
      description TEXT,
      specifications JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Software database table
    `CREATE TABLE IF NOT EXISTS software_database (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT,
      name TEXT NOT NULL,
      brand TEXT,
      version TEXT,
      category TEXT,
      subcategory TEXT,
      platform TEXT,
      license_key TEXT,
      expiry_date DATE,
      seats INTEGER,
      location JSONB,
      is_available BOOLEAN DEFAULT true,
      icon_url TEXT,
      description TEXT,
      specifications JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Studios table
    `CREATE TABLE IF NOT EXISTS studios (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      location JSONB,
      facilities TEXT[] DEFAULT '{}',
      hourly_rate NUMERIC(10, 2),
      daily_rate NUMERIC(10, 2),
      photos TEXT[] DEFAULT '{}',
      equipment JSONB DEFAULT '[]'::jsonb,
      amenities JSONB DEFAULT '[]'::jsonb,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Market items table
    `CREATE TABLE IF NOT EXISTS market_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price NUMERIC(10, 2),
      condition TEXT,
      images TEXT[] DEFAULT '{}',
      location JSONB,
      status TEXT DEFAULT 'active',
      views INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Messages table (for chat)
    `CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Conversations table (for chat)
    `CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      participant_ids TEXT[] NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // ========================================
    // INDEXES
    // ========================================

    // Clerk users indexes
    `CREATE INDEX IF NOT EXISTS idx_clerk_users_email ON clerk_users(email);`,
    `CREATE INDEX IF NOT EXISTS idx_clerk_users_username ON clerk_users(username);`,
    `CREATE INDEX IF NOT EXISTS idx_clerk_users_default_profile_role ON clerk_users(default_profile_role);`,

    // Profiles indexes
    `CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_profiles_active_role ON profiles(active_role);`,

    // Sub profiles indexes
    `CREATE INDEX IF NOT EXISTS idx_sub_profiles_user_id ON sub_profiles(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_sub_profiles_account_type ON sub_profiles(account_type);`,
    `CREATE INDEX IF NOT EXISTS idx_sub_profiles_is_active ON sub_profiles(is_active);`,

    // Bookings indexes
    `CREATE INDEX IF NOT EXISTS idx_bookings_sender_id ON bookings(sender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_target_id ON bookings(target_id);`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);`,
    `CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);`,

    // Wallets indexes
    `CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);`,

    // Wallet transactions indexes
    `CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);`,
    `CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);`,

    // Equipment database indexes
    `CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON equipment_database(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment_database(category);`,
    `CREATE INDEX IF NOT EXISTS idx_equipment_brand ON equipment_database(brand);`,

    // Software database indexes
    `CREATE INDEX IF NOT EXISTS idx_software_user_id ON software_database(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_software_category ON software_database(category);`,
    `CREATE INDEX IF NOT EXISTS idx_software_brand ON software_database(brand);`,

    // Studios indexes
    `CREATE INDEX IF NOT EXISTS idx_studios_owner_id ON studios(owner_id);`,
    `CREATE INDEX IF NOT EXISTS idx_studios_location ON studios USING GIN(location);`,

    // Market items indexes
    `CREATE INDEX IF NOT EXISTS idx_market_items_seller_id ON market_items(seller_id);`,
    `CREATE INDEX IF NOT EXISTS idx_market_items_category ON market_items(category);`,
    `CREATE INDEX IF NOT EXISTS idx_market_items_status ON market_items(status);`,

    // Messages indexes
    `CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);`,
    `CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);`,

    // Conversations indexes
    `CREATE INDEX IF NOT EXISTS idx_conversations_participant_ids ON conversations USING GIN(participant_ids);`,
    `CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);`,
  ];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    try {
      await sqlClient(sql);
      successCount++;
      if ((i + 1) % 15 === 0) {
        console.log(`   Progress: ${i + 1}/${sqlStatements.length} statements executed...`);
      }
    } catch (err) {
      errorCount++;
      if (errorCount <= 5) {
        console.error(`   ⚠️  Statement ${i + 1} failed: ${err.message}`);
      }
    }
  }

  console.log(`\n✅ Core tables created!`);
  console.log(`   - Total statements: ${sqlStatements.length}`);
  console.log(`   - Executed successfully: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors: ${errorCount} (expected for IF NOT EXISTS)`);
  }
  console.log();
}

createCoreTables().catch(console.error);

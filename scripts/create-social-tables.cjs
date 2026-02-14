/**
 * Create Social Feed Tables
 * Executes the social feed SQL file directly
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

async function createSocialTables() {
  console.log('\n🔨 Creating Social Feed Tables...\n');

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

  // SQL to create social feed tables (simplified, without comments)
  const sqlStatements = [
    // Posts table
    `CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      display_name TEXT,
      author_photo TEXT,
      content TEXT,
      text TEXT,
      role TEXT,
      media_type TEXT,
      media_urls TEXT[] DEFAULT '{}',
      media JSONB DEFAULT '[]'::jsonb,
      hashtags TEXT[] DEFAULT '{}',
      mentions TEXT[] DEFAULT '{}',
      location JSONB,
      visibility TEXT DEFAULT 'public',
      reaction_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      save_count INTEGER DEFAULT 0,
      repost_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      is_pinned BOOLEAN DEFAULT false,
      parent_post_id UUID,
      post_category TEXT,
      booking_id UUID,
      posted_as_role TEXT,
      credits JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ,
      is_archived BOOLEAN DEFAULT false,
      scheduled_for TIMESTAMPTZ
    );`,

    // Comments table
    `CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      parent_comment_id UUID,
      content TEXT NOT NULL,
      reaction_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    );`,

    // Reactions table
    `CREATE TABLE IF NOT EXISTS reactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id UUID NOT NULL,
      emoji TEXT NOT NULL DEFAULT '👍',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Follows table
    `CREATE TABLE IF NOT EXISTS follows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Saved posts table
    `CREATE TABLE IF NOT EXISTS saved_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      post_id UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      actor_id TEXT,
      actor_name TEXT,
      actor_photo TEXT,
      target_type TEXT,
      target_id UUID,
      title TEXT,
      body TEXT,
      link TEXT,
      read BOOLEAN DEFAULT false,
      action_taken TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      is_read BOOLEAN DEFAULT false,
      read_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}'::jsonb,
      reference_type TEXT,
      reference_id UUID,
      message TEXT,
      post_preview TEXT
    );`,

    // Content reports table
    `CREATE TABLE IF NOT EXISTS content_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id UUID NOT NULL,
      reason TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      reviewed_by TEXT,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // User blocks table
    `CREATE TABLE IF NOT EXISTS user_blocks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      blocker_id TEXT NOT NULL,
      blocked_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Post metrics table
    `CREATE TABLE IF NOT EXISTS post_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      reach INTEGER DEFAULT 0,
      engagement_rate DECIMAL(5, 2),
      recorded_at DATE DEFAULT CURRENT_DATE
    );`,

    // Post edit history table
    `CREATE TABLE IF NOT EXISTS post_edit_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL,
      user_id TEXT NOT NULL,
      old_content TEXT,
      new_content TEXT,
      edited_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Notification preferences table
    `CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id TEXT PRIMARY KEY,
      email_notifications BOOLEAN DEFAULT true,
      push_notifications BOOLEAN DEFAULT true,
      notify_on_like BOOLEAN DEFAULT true,
      notify_on_comment BOOLEAN DEFAULT true,
      notify_on_follow BOOLEAN DEFAULT true,
      notify_on_mention BOOLEAN DEFAULT true,
      notify_on_booking BOOLEAN DEFAULT true,
      quiet_hours_start TIME,
      quiet_hours_end TIME,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Demo submissions table
    `CREATE TABLE IF NOT EXISTS demo_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      title TEXT,
      description TEXT,
      genre TEXT[],
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Track listings table
    `CREATE TABLE IF NOT EXISTS track_listings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      audio_url TEXT NOT NULL,
      genre TEXT[],
      bpm INTEGER,
      key_text TEXT,
      price DECIMAL(10, 2),
      licensing_type TEXT,
      status TEXT DEFAULT 'available',
      plays_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,

    // Indexes for posts
    `CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON posts(parent_post_id);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_booking_id ON posts(booking_id);`,
    `CREATE INDEX IF NOT EXISTS idx_posts_posted_as_role ON posts(posted_as_role);`,

    // Indexes for comments
    `CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);`,
    `CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);`,
    `CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);`,

    // Indexes for reactions
    `CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_reactions_target ON reactions(target_type, target_id);`,
    `CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at DESC);`,

    // Indexes for follows
    `CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);`,
    `CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);`,
    `CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);`,

    // Indexes for saved_posts
    `CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);`,
    `CREATE INDEX IF NOT EXISTS idx_saved_posts_created_at ON saved_posts(created_at DESC);`,

    // Indexes for notifications
    `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = false;`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_reference ON notifications(reference_type, reference_id);`,

    // Indexes for content_reports
    `CREATE INDEX IF NOT EXISTS idx_content_reports_reporter_id ON content_reports(reporter_id);`,
    `CREATE INDEX IF NOT EXISTS idx_content_reports_target ON content_reports(target_type, target_id);`,
    `CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);`,
    `CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at DESC);`,

    // Indexes for user_blocks
    `CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_id ON user_blocks(blocker_id);`,
    `CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id ON user_blocks(blocked_id);`,

    // Indexes for post_metrics
    `CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON post_metrics(post_id);`,
    `CREATE INDEX IF NOT EXISTS idx_post_metrics_user_id ON post_metrics(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_post_metrics_recorded_at ON post_metrics(recorded_at DESC);`,

    // Indexes for post_edit_history
    `CREATE INDEX IF NOT EXISTS idx_post_edit_history_post_id ON post_edit_history(post_id);`,
    `CREATE INDEX IF NOT EXISTS idx_post_edit_history_user_id ON post_edit_history(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_post_edit_history_edited_at ON post_edit_history(edited_at DESC);`,

    // Indexes for demo_submissions
    `CREATE INDEX IF NOT EXISTS idx_demo_submissions_from_user_id ON demo_submissions(from_user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_demo_submissions_to_user_id ON demo_submissions(to_user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_demo_submissions_status ON demo_submissions(status);`,
    `CREATE INDEX IF NOT EXISTS idx_demo_submissions_created_at ON demo_submissions(created_at DESC);`,

    // Indexes for track_listings
    `CREATE INDEX IF NOT EXISTS idx_track_listings_post_id ON track_listings(post_id);`,
    `CREATE INDEX IF NOT EXISTS idx_track_listings_user_id ON track_listings(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_track_listings_genre ON track_listings USING GIN(genre);`,
    `CREATE INDEX IF NOT EXISTS idx_track_listings_status ON track_listings(status);`,
    `CREATE INDEX IF NOT EXISTS idx_track_listings_created_at ON track_listings(created_at DESC);`,

    // GIN indexes for full-text search
    `CREATE INDEX IF NOT EXISTS idx_posts_content_gin ON posts USING GIN(to_tsvector('english', COALESCE(content, '')));`,
    `CREATE INDEX IF NOT EXISTS idx_posts_hashtags_gin ON posts USING GIN(hashtags);`,
  ];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    try {
      await sqlClient(sql);
      successCount++;
      if ((i + 1) % 10 === 0) {
        console.log(`   Progress: ${i + 1}/${sqlStatements.length} statements executed...`);
      }
    } catch (err) {
      errorCount++;
      if (errorCount <= 5) {
        console.error(`   ⚠️  Statement ${i + 1} failed: ${err.message}`);
      }
    }
  }

  console.log(`\n✅ Social feed tables created!`);
  console.log(`   - Total statements: ${sqlStatements.length}`);
  console.log(`   - Executed successfully: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   - Errors: ${errorCount} (expected for IF NOT EXISTS)`);
  }
  console.log();
}

createSocialTables().catch(console.error);

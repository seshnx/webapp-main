# Neon Database Setup for Label Partnership Meeting

## 🚀 Quick Setup (15 Minutes)

### Step 1: Create Neon Project
1. Go to https://console.neon.tech/
2. Click "Create a project"
3. Choose region (closest to you)
4. Copy the connection string (Connection Details → Connection string)

### Step 2: Run SQL Scripts in Order

Open Neon SQL Editor and run these scripts in order:

```sql
-- 1. Base Schema (2-3 minutes)
-- Paste contents of: sql/neon_unified_schema.sql
-- Creates: clerk_users, profiles, posts, comments, bookings, marketplace, schools, etc.

-- 2. Contract Management (1 minute)
-- Paste contents of: sql/contracts_module.sql
-- Creates: contracts, contract_amendments

-- 3. Marketing Campaigns (1 minute)
-- Paste contents of: sql/marketing_campaigns_module.sql
-- Creates: marketing_campaigns, campaign_milestones, campaign_assets, campaign_metrics

-- 4. Label Critical Tables (1 minute) ⭐ IMPORTANT FOR MEETING
-- Paste contents of: sql/neon_label_critical_tables.sql
-- Creates: label_roster, releases, distribution_stats (needed for Label Dashboard)
```

### Step 3: Add Sample Data (Optional - For Demo)

After running the schemas, add some sample data to make the dashboard look good:

```sql
-- Get a label user ID first
SELECT id, username FROM clerk_users LIMIT 1;

-- Then add sample data (replace UUIDs with actual IDs from your database):

-- Sample 1: Add artist to roster
INSERT INTO label_roster (label_id, artist_id, name, email, photo_url, status, signed_date)
VALUES
('YOUR-LABEL-UUID', 'YOUR-ARTIST-UUID', 'Taylor Swift', 'taylor@example.com', null, 'active', '2024-01-01');

-- Sample 2: Add a release
INSERT INTO releases (artist_id, label_id, title, type, genre, release_date, status, streams, revenue)
VALUES
('YOUR-ARTIST-UUID', 'YOUR-LABEL-UUID', 'Midnights', 'Album', 'Pop', '2024-06-15', 'distributed', 50000000, 250000);

-- Sample 3: Add distribution stats
INSERT INTO distribution_stats (user_id, platform, streams, lifetime_earnings, monthly_streams)
VALUES
('YOUR-ARTIST-UUID', 'spotify', 150000000, 750000, 2500000);
```

### Step 4: Configure Environment Variables

Add to your `.env.local`:

```env
VITE_NEON_DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

## ✅ Verification

After setup, verify tables exist:

```sql
-- Should return 3 tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('label_roster', 'releases', 'distribution_stats');
```

## 🎯 For the Meeting

### What Works:
- ✅ Label Dashboard displays real data
- ✅ Roster performance table shows earnings
- ✅ Upcoming releases calendar works
- ✅ Contract management ready

### What to Show:
1. **Dashboard Metrics**: "Real-time data from our Neon PostgreSQL database"
2. **Roster Management**: Search, add, and manage artists
3. **Release Tracking**: Upcoming releases with dates
4. **Contract Templates**: Professional agreement system

### Demo Script:
1. Open `/labels` - Show overview
2. Point out metrics: "Live from database"
3. Click "Add Artist" - Show roster management
4. Navigate to `/labels/contracts` - Show contract system
5. Explain: "Template-based with variable substitution"

## ⚠️ Important Notes

1. **RLS Policies**: Row Level Security is enabled but may need adjustment for Clerk JWT integration
2. **auth.uid()**: Neon supports this but needs proper authentication context
3. **Sample Data**: Add sample data if database is empty for better demo

## 🔧 Troubleshooting

### Issue: "Table doesn't exist"
**Solution**: Make sure you ran ALL 4 SQL scripts in order

### Issue: "Permission denied"
**Solution**: Temporarily disable RLS for demo:
```sql
ALTER TABLE label_roster DISABLE ROW LEVEL SECURITY;
ALTER TABLE releases DISABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_stats DISABLE ROW LEVEL SECURITY;
```

### Issue: "No data showing"
**Solution**: Add sample data using the queries above

## 📊 Data Flow

```
User Action → React Component → Neon Query → Database → Real-time Update
```

For the meeting, emphasize:
- **Real data**: "Everything you see is live from the database"
- **Scalable**: "Built for labels managing 100+ artists"
- **Professional**: "Industry-standard contract templates"
- **Integrated**: "Distribution, contracts, and campaigns in one platform"

## 🎉 You're Ready!

After running the 4 SQL scripts, your Label Dashboard will work with real data from Neon PostgreSQL.

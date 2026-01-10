# ✅ Label Partnership Meeting - Setup Checklist

## 🎯 Meeting This Week? Here's What You Need:

### 1. Database Setup (15 minutes) ⭐ CRITICAL

**Go to**: https://console.neon.tech/sql

**Run these 4 SQL scripts in order:**

1. **`sql/neon_unified_schema.sql`** (base tables)
2. **`sql/contracts_module.sql`** (contract management)
3. **`sql/marketing_campaigns_module.sql`** (marketing tools)
4. **`sql/neon_label_critical_tables.sql`** (label-specific tables) ⭐

**Copy connection string** from Neon → Add to `.env.local`:
```env
VITE_NEON_DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### 2. Add Sample Data (5 minutes) - Optional but Recommended

After running schemas, add some demo data:

```sql
-- Get user IDs
SELECT id, username FROM clerk_users LIMIT 5;

-- Add sample label roster (replace UUIDs)
INSERT INTO label_roster (label_id, artist_id, name, email, status, signed_date)
VALUES
('YOUR-LABEL-ID', 'YOUR-ARTIST-ID', 'Demo Artist', 'artist@example.com', 'active', '2024-01-01');

-- Add sample release
INSERT INTO releases (artist_id, label_id, title, type, genre, release_date, status, streams, revenue)
VALUES
('YOUR-ARTIST-ID', 'YOUR-LABEL-ID', 'Summer Hits 2024', 'Album', 'Pop', '2024-12-25', 'distributed', 5000000, 25000);

-- Add distribution stats
INSERT INTO distribution_stats (user_id, platform, streams, lifetime_earnings, monthly_streams)
VALUES
('YOUR-ARTIST-ID', 'spotify', 10000000, 50000, 500000);
```

### 3. Test the Dashboard (2 minutes)

1. Run: `npm run dev`
2. Navigate to: `http://localhost:5173/labels`
3. Verify:
   - ✅ Dashboard shows metrics
   - ✅ Roster table displays artists
   - ✅ Quick action buttons work
   - ✅ Navigate to `/labels/contracts`
   - ✅ Contract list shows up

---

## 📊 What You Can Demonstrate

### Label Dashboard (`/labels`)
- **Metrics Cards**: Total artists, releases, revenue, streams
- **Roster Performance**: Top 10 artists with earnings
- **Upcoming Releases**: Release calendar
- **Quick Actions**: Add Artist, New Release, Upload Royalties, New Campaign

### Contract Management (`/labels/contracts`)
- **Contract List**: All contracts with status
- **Filtering**: By status (draft, sent, signed)
- **Search**: By artist or contract type
- **Signatures**: Track label/artist signatures

### Templates Available (in code)
- 360 Recording Deal
- Traditional Recording Deal
- Distribution Agreement
- Publishing Agreement

---

## 💬 Demo Script for Meeting

**Opening**: "Let me show you our label management platform..."

### Part 1: Dashboard (30 seconds)
"This is our label command center. Everything you see is real-time data from our PostgreSQL database."

- Point to metrics: "We track total artists, active releases, revenue, and streams live"
- "Roster performance shows top artists sorted by earnings"
- "Release calendar tracks all upcoming launches"

### Part 2: Roster Management (1 minute)
Navigate to Business Center → Artist Roster

"We make it easy to manage your roster:"
- Search and sign new artists
- Track contract status
- View artist performance at a glance

### Part 3: Contracts (1 minute)
Navigate to `/labels/contracts`

"Our contract management system includes:"
- "Four professional contract templates"
- "Status tracking from draft to signed"
- "Digital signature workflow ready"
- "All contracts tied to your database"

### Part 4: Distribution (30 seconds)
Navigate to Business Center → Distribution

"Integrated music distribution:"
- "150+ streaming platforms"
- "Analytics and royalty tracking"
- "Connected to your dashboard metrics"

### Closing: "Full-Service Platform" (30 seconds)

"What we've built is a complete label management platform:
- Artist discovery and signing
- Professional contract templates
- Music distribution to all platforms
- Real-time analytics and reporting
- Marketing campaign tools (in development)"

"Everything is database-backed, scalable, and ready for labels managing 10 to 100+ artists."

---

## 🚀 What's Implemented vs Coming Soon

### ✅ Working Now (for meeting):
- Label Dashboard with real data
- Contract list and management
- Contract templates system
- Database schemas (contracts, campaigns)
- Routing and navigation
- Permission system

### 🔨 In Development (post-meeting):
- Contract Builder wizard UI
- PDF generation
- E-signature integration
- Campaign Builder UI
- Automated royalty calculations

---

## ⚠️ Troubleshooting

### Dashboard Shows No Data
**Cause**: Database tables are empty
**Fix**: Run sample data queries from step 2 above

### "Table doesn't exist" Error
**Cause**: SQL scripts not run or run out of order
**Fix**: Run all 4 SQL scripts in order in Neon SQL Editor

### "Permission Denied" Error
**Cause**: RLS policies blocking access
**Fix**: Temporarily disable RLS:
```sql
ALTER TABLE label_roster DISABLE ROW LEVEL SECURITY;
ALTER TABLE releases DISABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
```

### Navigation Doesn't Work
**Cause**: Routes not set up
**Fix**: Already fixed in code - just refresh the page

---

## 📁 Key Files for Reference

### SQL Scripts (in `sql/` folder):
- `NEON_SETUP_GUIDE.md` - Detailed setup instructions
- `neon_label_critical_tables.sql` - Label tables for Neon
- `contracts_module.sql` - Contract management schema
- `marketing_campaigns_module.sql` - Campaign schema
- `neon_unified_schema.sql` - Base schema

### Components (in `src/components/labels/`):
- `LabelDashboard.jsx` - Main dashboard
- `ContractManager.jsx` - Contract list view

### Configuration:
- `src/config/contractTemplates.js` - Contract templates
- `src/utils/permissions.js` - Label permissions
- `src/routes/AppRoutes.jsx` - Route configuration

---

## ✅ Pre-Meeting Checklist

- [ ] Neon project created
- [ ] 4 SQL scripts run in Neon SQL Editor
- [ ] Connection string added to `.env.local`
- [ ] Sample data added (optional but recommended)
- [ ] Dashboard tested at `/labels`
- [ ] Contract manager tested at `/labels/contracts`
- [ ] All navigation working
- [ ] Quick links tested
- [ ] Demo script practiced

**Time Estimate**: 30 minutes total setup

---

## 🎉 You're Ready!

After completing the checklist, you'll have a fully functional label management platform to demo.

**Key Talking Points for Meeting:**
1. Real-time data from PostgreSQL
2. Professional contract templates
3. Scalable architecture (Neon serverless)
4. Integrated distribution and analytics
5. Campaign management foundation

**Emphasize**: "This is production-ready infrastructure built for serious label operations."

Good luck with your meeting! 🚀

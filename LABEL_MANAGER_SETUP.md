# Label Manager Setup Guide

This guide covers the setup and configuration of the Label Manager dashboard in the SeshNx Business Center.

## Overview

The Label Manager is a comprehensive dashboard for labels and agents to:
- Manage signed artists (platform artists and external artists)
- Track releases and distribution
- Monitor revenue and streaming metrics
- View upcoming releases calendar
- Access quick actions for common tasks

## Prerequisites

### Required Environment Variables

Ensure the following is set in your environment (`.env.local` for development, or Vercel/production environment):

```bash
VITE_NEON_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/database?sslmode=require
```

Get your connection string from: https://console.neon.tech/

### Required Account Types

Users must have one of the following account types to access the Label Manager:
- `Label`
- `Agent`

## Database Setup

### Step 1: Base Schema

Run `sql/neon_unified_schema.sql` in your Neon SQL Editor to create the base tables:
- `clerk_users` - User accounts synced from Clerk
- `profiles` - Extended profile data
- `posts`, `comments` - Social feed
- `bookings` - Session bookings
- Other core tables

### Step 2: External Artists Table

Run `sql/external_artists_table.sql` to enable tracking artists not yet on the platform:

```sql
CREATE TABLE IF NOT EXISTS external_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label_id TEXT NOT NULL REFERENCES clerk_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    stage_name TEXT,
    genre TEXT[],
    primary_role TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    contract_type TEXT,
    signed_date DATE,
    status TEXT DEFAULT 'invited',
    invitation_token TEXT UNIQUE,
    invitation_sent_at TIMESTAMPTZ,
    invitation_expires_at TIMESTAMPTZ,
    clerk_user_id TEXT REFERENCES clerk_users(id),
    total_streams BIGINT DEFAULT 0,
    total_revenue NUMERIC(10,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(label_id, email)
);
```

### Step 3: Label Critical Tables

Run `sql/neon_label_critical_tables.sql` to create:
- `label_roster` - Platform artists signed to the label
- `releases` - Music releases (singles, EPs, albums)
- `distribution_stats` - Streaming and revenue metrics

## Component Structure

```
src/components/
├── BusinessCenter.jsx          # Main hub with tab navigation
├── business/
│   ├── BusinessOverview.jsx    # Real-time metrics overview
│   ├── LabelOverviewCard.jsx   # Label metrics card
│   ├── StudioOverviewCard.jsx  # Studio metrics card
│   └── DistributionOverviewCard.jsx
└── labels/
    ├── LabelDashboard.jsx       # Main label management dashboard
    └── ExternalArtistManager.jsx # Manage artists not on platform
```

## Feature Breakdown

### 1. Platform Artists Tab

Displays artists who have joined the SeshNx platform and are signed to your label.

**Data Source:** `label_roster` table
- Fetches via `neon.js` query function
- Shows performance metrics (streams, revenue)
- Displays last release date
- Status badges (active, inactive, pending, terminated)

### 2. External Artists Tab

Manages artists who haven't joined the platform yet but are signed to your label.

**Features:**
- Add external artists with basic info
- Track invitation status
- Store contract details
- Migrate to platform artists when they join

### 3. Metrics Cards

Four key metrics displayed at top of dashboard:
- **Total Artists** - Count of active artists on roster
- **Active Releases** - Releases in distributed/submitted status
- **Total Revenue** - Sum of lifetime earnings from all artists
- **Total Streams** - Sum of lifetime streams from all artists

### 4. Quick Actions

Fast access to common tasks:
- Add Artist
- New Release
- Upload Royalties
- New Campaign

## Database Queries

### Label Dashboard Queries

```sql
-- Get artist count
SELECT COUNT(*) as count
FROM label_roster
WHERE label_id = $1 AND status = 'active';

-- Get active releases count
SELECT COUNT(*) as count
FROM releases
WHERE label_id = $1 AND status IN ('distributed', 'submitted');

-- Get revenue and streams
SELECT
  COALESCE(SUM(lifetime_earnings), 0) as total_revenue,
  COALESCE(SUM(lifetime_streams), 0) as total_streams
FROM distribution_stats
WHERE user_id IN (
  SELECT artist_id FROM label_roster WHERE label_id = $1
);

-- Get roster with performance
SELECT
  lr.id, lr.artist_id, lr.name, lr.email, lr.photo_url,
  lr.status, lr.signed_date,
  COALESCE(SUM(ds.lifetime_streams), 0) as streams,
  COALESCE(SUM(ds.lifetime_earnings), 0) as earnings,
  MAX(r.created_at) as last_release
FROM label_roster lr
LEFT JOIN distribution_stats ds ON ds.user_id = lr.artist_id
LEFT JOIN releases r ON r.artist_id = lr.artist_id
WHERE lr.label_id = $1
GROUP BY lr.id, lr.artist_id, lr.name, lr.email, lr.photo_url, lr.status, lr.signed_date
ORDER BY lr.signed_date DESC
LIMIT 10;
```

## Error Handling

The dashboard includes graceful degradation:

- **Missing Tables:** Shows zero values instead of crashing
- **Query Errors:** Console warnings indicate which tables are missing
- **Error State UI:** Helpful message directing to run SQL migrations

Console warnings you might see:
```
label_roster table not available: relation "label_roster" does not exist
releases table not available: relation "releases" does not exist
distribution_stats table not available: relation "distribution_stats" does not exist
```

## Troubleshooting

### Issue: "Query not found" errors

**Cause:** Using `executeQuery()` with raw SQL instead of query names.

**Fix:** Use `query()` function from `neon.js` for raw SQL:
```javascript
// ❌ Wrong
import { executeQuery } from '../../config/neon';
executeQuery(sql, params, 'name');

// ✅ Correct
import { query } from '../../config/neon';
query(sql, params);
```

### Issue: "column 'lifetime_earnings' does not exist"

**Cause:** The `distribution_stats` table hasn't been created yet.

**Fix:** Run `sql/neon_label_critical_tables.sql` in Neon SQL Editor.

### Issue: Dashboard shows all zeros

**Cause:** No data in the database tables.

**Fix:** Add sample data or wait for real data to accumulate.

### Issue: "Neon client is not configured"

**Cause:** Missing `VITE_NEON_DATABASE_URL` environment variable.

**Fix:** Add the Neon connection string to your environment.

## Styling Conventions

The Label Manager follows the Business Center design system:

### Component Structure
```jsx
<div className="max-w-7xl mx-auto pb-20">
  {/* Breadcrumb */}
  <div className="mb-6">
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Briefcase size={14} />
      <span>Business Center</span>
      <ChevronRight size={14} />
      <span>Label Manager</span>
    </div>
    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white">
        <Building2 size={24} />
      </div>
      Label Name
    </h1>
  </div>

  {/* Cards */}
  <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 p-6">
    {/* Content */}
  </div>
</div>
```

### Dark Mode Support
All components support dark mode:
- Background: `bg-white dark:bg-[#2c2e36]`
- Borders: `border dark:border-gray-700`
- Text: `dark:text-white`, `dark:text-gray-400`
- Icon backgrounds: `dark:bg-blue-900/30`, `dark:bg-purple-900/30`

## Future Enhancements

### Planned Features
- [ ] Email invitations for external artists
- [ ] Royalty calculation and splitting
- [ ] Campaign management integration
- [ ] Advanced analytics dashboard
- [ ] Export functionality (CSV, PDF)
- [ ] Batch operations on roster

### API Endpoints to Implement
```
POST /api/labels/invite         # Send invitation to external artist
GET  /api/labels/:id/royalties   # Get royalty reports
POST /api/releases              # Create new release
PUT  /api/releases/:id          # Update release
GET  /api/analytics/label       # Advanced analytics
```

## Related Documentation

- [Neon Database Setup](https://neon.tech/docs/get-started-with-neon)
- [Clerk Authentication](https://clerk.com/docs)
- [Business Center Architecture](./CLAUDE.md)
- [SQL Schema Reference](./sql/neon_label_critical_tables.sql)

## Support

If you encounter issues:

1. Check console for specific error messages
2. Verify Neon connection string is correct
3. Ensure SQL scripts were run in correct order
4. Check that user has appropriate account types

For additional help, see the main [CLAUDE.md](./CLAUDE.md) file or open an issue on GitHub.

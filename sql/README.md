# SQL Editor Scripts for SeshNx Modules

This directory contains SQL scripts for setting up database tables, indexes, triggers, and Row Level Security (RLS) policies for each module in the SeshNx application.

## 📁 Script Files

### Core Modules
- **`supabase_profiles_schema.sql`** - User profiles table (already exists in root)
- **`app_config_module.sql`** - App-wide configuration and sub-profiles

### Feature Modules
- **`social_feed_module.sql`** - Social Feed (posts, comments, reactions, follows, notifications)
- **`bookings_module.sql`** - Bookings (sessions, studio rentals, talent booking, reviews)
- **`marketplace_module.sql`** - Marketplace (gear exchange, SeshFx store, safe exchange)
- **`tech_services_module.sql`** - Tech Services (repairs, service requests, gear database)
- **`payments_module.sql`** - Payments/Billing (wallets, transactions, subscriptions, invoices)
- **`business_center_module.sql`** - Business Center (studios, labels, distribution, royalties)
- **`edu_module.sql`** - Education (schools, students, courses, learning paths, evaluations)
- **`legal_docs_module.sql`** - Legal Docs (documents, templates, moderation, safe zones)

## 🚀 Usage

### Running Scripts in Supabase SQL Editor

1. **Open Supabase Dashboard**
   - Navigate to your project
   - Go to SQL Editor

2. **Run Scripts in Order**
   - Start with `supabase_profiles_schema.sql` (if not already run)
   - Then run `app_config_module.sql`
   - Run feature module scripts as needed for your deployment

3. **Script Execution**
   - Each script is idempotent (safe to run multiple times)
   - Uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`
   - Includes error handling for existing objects

### Recommended Execution Order

```sql
-- 1. Core (if not already done)
-- Run: supabase_profiles_schema.sql

-- 2. App Config
-- Run: app_config_module.sql

-- 3. Core Features (most commonly used)
-- Run: social_feed_module.sql
-- Run: bookings_module.sql
-- Run: payments_module.sql

-- 4. Additional Features (as needed)
-- Run: marketplace_module.sql
-- Run: tech_services_module.sql
-- Run: business_center_module.sql
-- Run: edu_module.sql
-- Run: legal_docs_module.sql
```

## 📋 What Each Script Includes

Each module script includes:

1. **Table Definitions**
   - All required columns with appropriate data types
   - Constraints (CHECK, UNIQUE, FOREIGN KEY)
   - Default values

2. **Indexes**
   - Performance indexes for common queries
   - GIN indexes for array/JSONB columns
   - Composite indexes for multi-column queries

3. **Triggers**
   - Automatic `updated_at` timestamp updates
   - Count updates (e.g., comment_count, reaction_count)
   - Business logic triggers

4. **Row Level Security (RLS)**
   - Policies for SELECT, INSERT, UPDATE, DELETE
   - User-based access control
   - Public/private visibility rules

5. **Comments**
   - Table and column documentation

## ⚠️ Important Notes

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies are configured for authenticated users
- Some tables allow public read access (e.g., active listings, public profiles)
- Users can only modify their own data

### Foreign Keys
- Most tables reference `auth.users(id)` for user relationships
- Cascade deletes are used where appropriate
- Some relationships use `ON DELETE SET NULL` to preserve data

### Data Types
- **UUID**: Used for all primary keys and foreign keys
- **JSONB**: Used for flexible schema (media arrays, metadata, etc.)
- **TEXT[]**: Used for arrays of strings (tags, specialties, etc.)
- **TIMESTAMPTZ**: Used for all timestamps (timezone-aware)

### Indexes
- Indexes are created for:
  - Foreign keys
  - Frequently queried columns
  - Composite queries (user_id + status, etc.)
  - Array/JSONB columns (GIN indexes)

## 🔧 Customization

### Adding New Columns
To add new columns to existing tables:

```sql
ALTER TABLE table_name
ADD COLUMN IF NOT EXISTS new_column_name TYPE DEFAULT value;
```

### Modifying RLS Policies
To update RLS policies:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Create new policy
CREATE POLICY "policy_name" ON table_name
    FOR SELECT USING (your_condition);
```

## 🐛 Troubleshooting

### "Relation already exists" Errors
- Scripts use `IF NOT EXISTS` clauses
- Safe to re-run scripts
- If errors occur, check for conflicting constraints

### RLS Policy Issues
- Ensure user is authenticated (`auth.uid()` is not null)
- Check policy conditions match your use case
- Verify foreign key relationships

### Performance Issues
- Check that indexes are created
- Use `EXPLAIN ANALYZE` to debug slow queries
- Consider adding additional indexes for your query patterns

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🔄 Updates

When updating scripts:
1. Test in a development environment first
2. Backup your database before running updates
3. Review changes to RLS policies carefully
4. Update this README if adding new modules


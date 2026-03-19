# SeshNx Database Setup Guide

## Quick Start

Run the master setup script to install all required tables:
```bash
psql -U your_user -d your_database -f 01_master_schema.sql
```

Or run individual files in numerical order (see below).

---

## File Numbering System

All SQL files are numbered by execution order:
- **00-09**: Core schemas (run first)
- **10-19**: App configuration
- **20-29**: Core features (bookings, marketplace, payments, social)
- **30-39**: Booking enhancements
- **40-49**: Business features (labels, distribution)
- **50-59**: Studio operations
- **60-69**: Tech services
- **70-79**: Education (EDU)
- **80-89**: Legal & contracts
- **90-99**: Marketing
- **100-109**: Databases (equipment, instruments)
- **200-299**: Fixes & migrations

---

## Execution Order

### Required for All Installations ✅

```bash
# Core schemas
\ir 00_core_unified_schema.sql

# App config
\ir 10_app_config.sql

# Core features
\ir 20_bookings.sql
\ir 21_marketplace.sql
\ir 22_payments.sql
\ir 23_social_feed.sql

# Booking enhancements
\ir 30_booking_enhancements.sql
\ir 31_blocked_dates.sql
\ir 32_google_calendar_sync.sql
```

### Optional Features ⚠️

```bash
# Business (labels, distribution)
\ir 40_business.sql
\ir 41_business_features.sql
\ir 42_external_artists.sql
\ir 43_label_critical.sql

# Studio operations
\ir 50_studio_crm.sql
\ir 51_studio_operations.sql
\ir 52_studio_analytics.sql
\ir 53_studio_ops_enhancements.sql

# Tech services
\ir 60_tech_services.sql

# Education (schools)
\ir 70_education.sql

# Legal documents
\ir 80_legal_docs.sql
\ir 81_contracts.sql

# Marketing campaigns
\ir 90_marketing_campaigns.sql

# Equipment/instrument databases
\ir 100_databases.sql
```

### Fixes & Migrations 🔧

Run only if needed to fix existing data:

```bash
\ir 200_fix_clerk_id.sql
\ir 201_fix_sub_profiles.sql
\ir 202_fix_equipment_constraint.sql
\ir 203_fix_brands.sql
\ir 204_fix_software_brands.sql
```

---

## File Reference

### Core (Required)

| # | File | Description |
|---|------|-------------|
| 00 | 00_core_unified_schema.sql | User profiles & auth |
| 10 | 10_app_config.sql | App configuration |
| 20 | 20_bookings.sql | Booking system |
| 21 | 21_marketplace.sql | Marketplace/gear exchange |
| 22 | 22_payments.sql | Payment processing |
| 23 | 23_social_feed.sql | Social feed |
| 30 | 30_booking_enhancements.sql | Booking enhancements |
| 31 | 31_blocked_dates.sql | Blocked dates calendar |
| 32 | 32_google_calendar_sync.sql | Google Calendar integration |

### Business (Optional)

| # | File | Description |
|---|------|-------------|
| 40 | 40_business.sql | Business center |
| 41 | 41_business_features.sql | Business features |
| 42 | 42_external_artists.sql | External artists |
| 43 | 43_label_critical.sql | Label critical tables |
| 50 | 50_studio_crm.sql | Studio CRM |
| 51 | 51_studio_operations.sql | Studio operations |
| 52 | 52_studio_analytics.sql | Studio analytics |
| 53 | 53_studio_ops_enhancements.sql | Studio ops enhancements |
| 60 | 60_tech_services.sql | Technician services |
| 70 | 70_education.sql | Education/EDU module |
| 80 | 80_legal_docs.sql | Legal documents |
| 81 | 81_contracts.sql | Contract management |
| 90 | 90_marketing_campaigns.sql | Marketing campaigns |

### Databases (Optional)

| # | File | Description |
|---|------|-------------|
| 100 | 100_databases.sql | Equipment + Instrument databases |
| 101 | 101_gear_import.sql | Gear import script |
| 102 | 102_software_import.sql | Software import script |

### Migrations (Run if Needed)

| # | File | Description |
|---|------|-------------|
| 200 | 200_fix_clerk_id.sql | Fix clerk user IDs |
| 201 | 201_fix_sub_profiles.sql | Fix sub-profiles |
| 202 | 202_fix_equipment_constraint.sql | Fix equipment constraints |
| 203 | 203_fix_brands.sql | Fix incorrect brands |
| 204 | 204_fix_software_brands.sql | Fix software brands |

---

## Import Scripts

After schema setup, import reference data:

```bash
# From webapp-main directory
node scripts/import-gear-database.js
node scripts/import-instruments-database.js
node scripts/import-software-database.js
```

---

## Quick Commands

### Run everything
```bash
psql -U your_user -d your_database -f 01_master_schema.sql
```

### Run core only
```bash
psql -U your_user -d your_database <<EOF
\ir 00_core_unified_schema.sql
\ir 10_app_config.sql
\ir 20_bookings.sql
\ir 21_marketplace.sql
\ir 22_payments.sql
\ir 23_social_feed.sql
EOF
```

### Run specific module
```bash
psql -U your_user -d your_database -f 50_studio_crm.sql
```

---

## Verification

After setup, verify installation:

```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Count tables
SELECT COUNT(*) as total_tables FROM pg_tables WHERE schemaname = 'public';

-- Verify critical tables
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'bookings', 'market_items', 'posts', 'equipment_database', 'instrument_database')
ORDER BY tablename;
```

---

## Troubleshooting

### "relation already exists"
Tables are already installed. Run fixes instead:
```bash
psql -f 202_fix_equipment_constraint.sql
```

### Missing dependencies
Ensure files are run in numerical order. Core scripts (00-32) must run first.

### Permission errors
Grant permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
```

---

## Additional Resources

- `QUICK_REFERENCE.sql` - Common DBA queries
- `01_master_schema.sql` - Master setup script
- `../scripts/` - Import scripts

---

**Last Updated**: 2025-01-19
**Version**: 3.0 (Numbered)

-- ============================================================================
-- SeshNx Master Database Schema
-- ============================================================================
-- Run scripts in order for complete database setup
-- Version: 2.0
-- Last Updated: 2025-01-19
-- ============================================================================

-- ============================================================================
-- INSTRUCTIONS: Run this file in psql with: psql -f 01_master_schema.sql
-- Or run individual files in numerical order (00, 10, 20, 21, etc.)
-- ============================================================================

-- ============================================================================
-- SECTION 1: CORE SCHEMAS (00-09)
-- ============================================================================
-- Required: Always run these first

\ir 00_core_unified_schema.sql

-- ============================================================================
-- SECTION 2: APP CONFIGURATION (10-19)
-- ============================================================================
-- Required: Yes - manages app-wide settings

\ir 10_app_config.sql

-- ============================================================================
-- SECTION 3: CORE FEATURES (20-29)
-- ============================================================================
-- Required: Yes - primary app functionality

\ir 20_bookings.sql
\ir 21_marketplace.sql
\ir 22_payments.sql
\ir 23_social_feed.sql

-- ============================================================================
-- SECTION 4: BOOKING ENHANCEMENTS (30-39)
-- ============================================================================
-- Required: Yes - booking system enhancements

\ir 30_booking_enhancements.sql
\ir 31_blocked_dates.sql
\ir 32_google_calendar_sync.sql

-- ============================================================================
-- SECTION 5: BUSINESS FEATURES (40-49)
-- ============================================================================
-- Required: No - only for labels and distribution

\ir 40_business.sql
\ir 41_business_features.sql
\ir 42_external_artists.sql
\ir 43_label_critical.sql

-- ============================================================================
-- SECTION 6: STUDIO OPERATIONS (50-59)
-- ============================================================================
-- Required: No - only for studio accounts

\ir 50_studio_crm.sql
\ir 51_studio_operations.sql
\ir 52_studio_analytics.sql
\ir 53_studio_ops_enhancements.sql

-- ============================================================================
-- SECTION 7: TECH SERVICES (60-69)
-- ============================================================================
-- Required: No - only for technician accounts

\ir 60_tech_services.sql

-- ============================================================================
-- SECTION 8: EDUCATION (70-79)
-- ============================================================================
-- Required: No - only for EDU/school accounts

\ir 70_education.sql

-- ============================================================================
-- SECTION 9: LEGAL & CONTRACTS (80-89)
-- ============================================================================
-- Required: No - only if using legal document features

\ir 80_legal_docs.sql
\ir 81_contracts.sql

-- ============================================================================
-- SECTION 10: MARKETING (90-99)
-- ============================================================================
-- Required: No - only if using campaign management

\ir 90_marketing_campaigns.sql

-- ============================================================================
-- SECTION 11: DATABASES (100-109)
-- ============================================================================
-- Required: No - only if using equipment/instrument databases

\ir 100_databases.sql

-- Run import scripts after database setup:
-- node ../scripts/import-gear-database.js
-- node ../scripts/import-instruments-database.js

-- ============================================================================
-- SECTION 12: FIXES & MIGRATIONS (200-299)
-- ============================================================================
-- Required: No - run only if needed to fix existing data

\ir 200_fix_clerk_id.sql
\ir 201_fix_sub_profiles.sql
\ir 202_fix_equipment_constraint.sql
\ir 203_fix_brands.sql
\ir 204_fix_software_brands.sql

-- ============================================================================
-- POST-SETUP VERIFICATION
-- ============================================================================

-- Check table counts
SELECT
    schemaname,
    COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public'
GROUP BY schemaname;

-- Verify critical tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'bookings', 'market_items', 'posts', 'equipment_database', 'instrument_database')
ORDER BY tablename;

-- ============================================================================
-- EXECUTION SUMMARY
-- ============================================================================
-- Total scripts executed: See above sections
-- Expected tables: 100+
-- Expected time: 2-5 minutes
-- ============================================================================

#!/bin/bash
# Script to rename all SQL files with execution order prefixes

cd "$(dirname "$0")"

# Core Schemas (00-09)
echo "=== Core Schemas ==="
[ -f "neon_unified_schema.sql" ] && mv neon_unified_schema.sql 00_core_unified_schema.sql && echo "00: 00_core_unified_schema.sql"

# App Configuration (10-19)
echo "=== App Configuration ==="
[ -f "app_config.sql" ] && mv app_config.sql 10_app_config.sql && echo "10: 10_app_config.sql"

# Core Features (20-29)
echo "=== Core Features ==="
[ -f "bookings.sql" ] && mv bookings.sql 20_bookings.sql && echo "20: 20_bookings.sql"
[ -f "marketplace.sql" ] && mv marketplace.sql 21_marketplace.sql && echo "21: 21_marketplace.sql"
[ -f "payments.sql" ] && mv payments.sql 22_payments.sql && echo "22: 22_payments.sql"
[ -f "social_feed_module.sql" ] && mv social_feed_module.sql 23_social_feed.sql && echo "23: 23_social_feed.sql"

# Booking Enhancements (30-39)
echo "=== Booking Enhancements ==="
[ -f "booking_enhancements.sql" ] && mv booking_enhancements.sql 30_booking_enhancements.sql && echo "30: 30_booking_enhancements.sql"
[ -f "blocked_dates_table.sql" ] && mv blocked_dates_table.sql 31_blocked_dates.sql && echo "31: 31_blocked_dates.sql"
[ -f "google_calendar_sync.sql" ] && mv google_calendar_sync.sql 32_google_calendar_sync.sql && echo "32: 32_google_calendar_sync.sql"

# Business Features (40-49)
echo "=== Business Features ==="
[ -f "business.sql" ] && mv business.sql 40_business.sql && echo "40: 40_business.sql"
[ -f "business_features_unified.sql" ] && mv business_features_unified.sql 41_business_features.sql && echo "41: 41_business_features.sql"
[ -f "external_artists_table.sql" ] && mv external_artists_table.sql 42_external_artists.sql && echo "42: 42_external_artists.sql"
[ -f "neon_label_critical_tables.sql" ] && mv neon_label_critical_tables.sql 43_label_critical.sql && echo "43: 43_label_critical.sql"

# Studio Operations (50-59)
echo "=== Studio Operations ==="
[ -f "studio_crm_module.sql" ] && mv studio_crm_module.sql 50_studio_crm.sql && echo "50: 50_studio_crm.sql"
[ -f "studio_operations_module.sql" ] && mv studio_operations_module.sql 51_studio_operations.sql && echo "51: 51_studio_operations.sql"
[ -f "studio_analytics_views.sql" ] && mv studio_analytics_views.sql 52_studio_analytics.sql && echo "52: 52_studio_analytics.sql"
[ -f "studio_ops_booking_enhancements.sql" ] && mv studio_ops_booking_enhancements.sql 53_studio_ops_enhancements.sql && echo "53: 53_studio_ops_enhancements.sql"

# Tech Services (60-69)
echo "=== Tech Services ==="
[ -f "tech_services.sql" ] && mv tech_services.sql 60_tech_services.sql && echo "60: 60_tech_services.sql"

# Education (70-79)
echo "=== Education ==="
[ -f "education.sql" ] && mv education.sql 70_education.sql && echo "70: 70_education.sql"

# Legal & Contracts (80-89)
echo "=== Legal & Contracts ==="
[ -f "legal_docs.sql" ] && mv legal_docs.sql 80_legal_docs.sql && echo "80: 80_legal_docs.sql"
[ -f "contracts_module.sql" ] && mv contracts_module.sql 81_contracts.sql && echo "81: 81_contracts.sql"

# Marketing (90-99)
echo "=== Marketing ==="
[ -f "marketing_campaigns_module.sql" ] && mv marketing_campaigns_module.sql 90_marketing_campaigns.sql && echo "90: 90_marketing_campaigns.sql"

# Databases (100-109)
echo "=== Databases ==="
[ -f "databases_unified.sql" ] && mv databases_unified.sql 100_databases.sql && echo "100: 100_databases.sql"
[ -f "gear_database_import.sql" ] && mv gear_database_import.sql 101_gear_import.sql && echo "101: 101_gear_import.sql"
[ -f "software_database_import.sql" ] && mv software_database_import.sql 102_software_import.sql && echo "102: 102_software_import.sql"

# Fixes & Migrations (200-299)
echo "=== Fixes & Migrations ==="
[ -f "fix_clerk_users_id_type.sql" ] && mv fix_clerk_users_id_type.sql 200_fix_clerk_id.sql && echo "200: 200_fix_clerk_id.sql"
[ -f "fix_sub_profiles_is_active.sql" ] && mv fix_sub_profiles_is_active.sql 201_fix_sub_profiles.sql && echo "201: 201_fix_sub_profiles.sql"
[ -f "fix_equipment_database_constraint.sql" ] && mv fix_equipment_database_constraint.sql 202_fix_equipment_constraint.sql && echo "202: 202_fix_equipment_constraint.sql"
[ -f "fix_incorrect_brands.sql" ] && mv fix_incorrect_brands.sql 203_fix_brands.sql && echo "203: 203_fix_brands.sql"
[ -f "fix_incorrect_software_brands.sql" ] && mv fix_incorrect_software_brands.sql 204_fix_software_brands.sql && echo "204: 204_fix_software_brands.sql"

echo ""
echo "=== Rename Complete ==="
echo "Files are now numbered by execution order!"

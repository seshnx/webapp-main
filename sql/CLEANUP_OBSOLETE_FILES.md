# SQL File Cleanup Guide

## Files to Keep

### Core Schema Files ✅
- `supabase_profiles_schema.sql` - Base user/profile tables
- `app_config_module_fixed.sql` → Rename to `app_config.sql`
- `bookings_module_fixed.sql` → Rename to `bookings.sql`
- `marketplace_module_fixed.sql` → Rename to `marketplace.sql`
- `payments_module_fixed.sql` → Rename to `payments.sql`
- `social_feed_module.sql` → Keep as is
- `education_module_fixed.sql` → Rename to `education.sql` (optional)
- `business_center_module_fixed.sql` → Rename to `business.sql` (optional)
- `tech_services_module_fixed.sql` → Rename to `tech_services.sql` (optional)
- `legal_docs_module_fixed.sql` → Rename to `legal_docs.sql` (optional)

### Database Files ✅
- `databases_unified.sql` - NEW: Unified equipment + instrument databases
- `equipment_database_schema.sql` - Can be removed (merged into unified)
- `instrument_database_schema.sql` - Can be removed (merged into unified)

### Studio Files ✅
- `studio_crm_module.sql` → Rename to `studio_crm.sql`
- `studio_operations_module.sql` → Rename to `studio_ops.sql`
- `studio_analytics_views.sql` → Keep as is
- `studio_ops_booking_enhancements.sql` → Keep as is

### Enhancement Files ✅
- `booking_enhancements.sql` - Keep as is
- `blocked_dates_table.sql` - Keep as is
- `google_calendar_sync.sql` - Keep as is
- `contracts_module.sql` - Keep as is (optional)
- `marketing_campaigns_module.sql` - Keep as is (optional)

### Import Scripts ✅
- `gear_database_import.sql` - Keep as is
- `software_database_import.sql` - Keep as is

### Migration/Fix Files ✅
- Keep all files starting with `fix_` - these are migration scripts

### Reference Files ✅
- `README_DATABASE_SETUP.md` - NEW: Main setup guide
- `NEON_SETUP_GUIDE.md` - Keep as is
- `NEON_SCHEMA_VERIFICATION.md` - Keep as is
- `01_master_schema.sql` - NEW: Master setup script

## Files to Remove 🗑️

### Obsolete Module Files (Replaced by _fixed versions)
```
app_config_module.sql (replaced by _fixed)
bookings_module.sql (replaced by _fixed)
marketplace_module.sql (replaced by _fixed)
payments_module.sql (replaced by _fixed)
tech_services_module.sql (replaced by _fixed)
legal_docs_module.sql (replaced by _fixed)
```

### Duplicate Schema Files (Now in unified)
```
equipment_database_schema.sql (merged into databases_unified.sql)
instrument_database_schema.sql (merged into databases_unified.sql)
```

## Renaming Pattern

Rename all `_fixed` files to remove suffix:
```bash
app_config_module_fixed.sql → app_config.sql
bookings_module_fixed.sql → bookings.sql
marketplace_module_fixed.sql → marketplace.sql
payments_module_fixed.sql → payments.sql
education_module_fixed.sql → education.sql
business_center_module_fixed.sql → business.sql
tech_services_module_fixed.sql → tech_services.sql
legal_docs_module_fixed.sql → legal_docs.sql
```

## Final Structure

```
sql/
├── README_DATABASE_SETUP.md
├── 01_master_schema.sql
├── databases_unified.sql
│
├── Core/
│   ├── supabase_profiles_schema.sql
│   ├── app_config.sql
│   ├── bookings.sql
│   ├── marketplace.sql
│   ├── payments.sql
│   └── social_feed_module.sql
│
├── Optional/
│   ├── education.sql
│   ├── business.sql
│   ├── tech_services.sql
│   ├── studio_crm.sql
│   ├── studio_ops.sql
│   ├── legal_docs.sql
│   ├── contracts_module.sql
│   └── marketing_campaigns_module.sql
│
├── Enhancements/
│   ├── booking_enhancements.sql
│   ├── blocked_dates_table.sql
│   └── google_calendar_sync.sql
│
├── Migrations/
│   ├── fix_clerk_users_id_type.sql
│   ├── fix_sub_profiles_is_active.sql
│   ├── fix_equipment_database_constraint.sql
│   ├── fix_incorrect_brands.sql
│   └── fix_incorrect_software_brands.sql
│
└── Reference/
    ├── NEON_SETUP_GUIDE.md
    └── NEON_SCHEMA_VERIFICATION.md
```

## Migration Commands

### Remove obsolete files
```bash
cd sql
rm app_config_module.sql
rm bookings_module.sql
rm marketplace_module.sql
rm payments_module.sql
rm tech_services_module.sql
rm legal_docs_module.sql
```

### Rename _fixed files
```bash
mv app_config_module_fixed.sql app_config.sql
mv bookings_module_fixed.sql bookings.sql
mv marketplace_module_fixed.sql marketplace.sql
mv payments_module_fixed.sql payments.sql
mv education_module_fixed.sql education.sql
mv business_center_module_fixed.sql business.sql
mv tech_services_module_fixed.sql tech_services.sql
mv legal_docs_module_fixed.sql legal_docs.sql
```

### Remove old schema files (now in unified)
```bash
rm equipment_database_schema.sql
rm instrument_database_schema.sql
```

## Benefits

✅ **Cleaner**: No duplicate files
✅ **Clearer**: Obvious which files to use
✅ **Smaller**: ~50% reduction in file count
✅ **Faster**: Unified database schema
✅ **Organized**: Logical folder structure

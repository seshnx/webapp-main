# Gear Database Setup Guide

This guide explains how to set up the gear database in Supabase using the JSON files containing equipment data.

## Overview

The gear database stores information about audio equipment (microphones, interfaces, software, etc.) that can be used with the `EquipmentAutocomplete` component throughout the app.

## Files Structure

- **SQL Migration**: `sql/gear_database_import.sql` - Creates/updates the `equipment_database` table
- **Import Script**: `scripts/import-gear-database.js` - Node.js script to import JSON files into Supabase
- **Hooks**: 
  - `src/hooks/useEquipmentDatabase.js` - Fetches equipment from Supabase
  - `src/hooks/useEquipmentSearch.js` - Provides search functionality

## Setup Steps

### 1. Run SQL Migration

First, run the SQL migration script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of sql/gear_database_import.sql
-- This creates the equipment_database table with proper indexes
```

Or run it via Supabase CLI:
```bash
supabase db push
```

### 2. Install Dependencies

Make sure you have the required Node.js packages (dotenv may need to be installed):

```bash
npm install dotenv
```

Note: `@supabase/supabase-js` should already be in your dependencies.

### 3. Configure Environment Variables

Ensure your `.env.local` file has the Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# OR
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Note**: The service role key is preferred for the import script as it bypasses RLS policies. If you only have the anon key, the script will use that, but you may need to adjust RLS policies.

### 4. Prepare JSON Files

Place your JSON files in one of these locations:
- `../Amalia Media LLC/Webapp/` (relative to project root)
- Same directory as the script
- Or modify the path in `scripts/import-gear-database.js`

Required JSON files:
- `mixers_and_consoles.json`
- `microphones_and_transducers.json`
- `outboard_gear.json`
- `audio_interfaces.json`
- `headphones.json`
- `studio_monitors.json`
- `recording_devices.json`

**Note:** `software_audio.json` is excluded as it will have a separate Software Database.

### 5. Run Import Script

Execute the import script:

```bash
node scripts/import-gear-database.js
```

The script will:
1. Read each JSON file
2. Parse equipment names to extract brand/model
3. Generate search tokens for full-text search
4. Insert/update records in Supabase (using upsert to avoid duplicates)

### 6. Verify Import

Check the Supabase dashboard to verify items were imported:

```sql
SELECT COUNT(*) FROM equipment_database;
SELECT category, COUNT(*) FROM equipment_database GROUP BY category;
```

## Database Schema

The `equipment_database` table has the following structure:

- `id` (UUID) - Primary key
- `brand` (TEXT) - Equipment brand/manufacturer
- `model` (TEXT) - Model number/identifier
- `name` (TEXT) - Short name (e.g., "SM57", "U87")
- `category` (TEXT) - Main category (e.g., "Microphones", "Software")
- `subcategory` (TEXT) - Subcategory (e.g., "Dynamic Microphones", "DAWs")
- `description` (TEXT) - Optional description
- `specifications` (JSONB) - Technical specifications
- `images` (JSONB) - Array of image URLs
- `search_tokens` (TEXT[]) - Array of searchable terms
- `verified` (BOOLEAN) - Whether item is verified
- `created_at`, `updated_at` (TIMESTAMPTZ) - Timestamps

## Usage in Components

The `EquipmentAutocomplete` component automatically uses the database:

```jsx
import EquipmentAutocomplete from './components/shared/EquipmentAutocomplete';

<EquipmentAutocomplete
    onSelect={(item) => console.log('Selected:', item)}
    placeholder="Search for gear..."
    multi={false} // Set to true for comma-separated list
/>
```

## Search Functionality

The search uses:
- Full-text search on `search_tokens` array
- Brand, model, and name matching
- All query terms must match (AND logic)
- Results limited to 50 items for performance

## Adding New Equipment

### Via Import Script

1. Add new items to the appropriate JSON file
2. Re-run the import script (it will upsert, so duplicates are handled)

### Via Supabase Dashboard

1. Go to Supabase Dashboard > Table Editor > `equipment_database`
2. Insert new row with required fields:
   - `brand`, `model`, `name`, `category`
   - Optionally set `verified = true` for immediate visibility

### Via User Submissions

Users can submit new equipment through the `equipment_submissions` table (if implemented). These will need to be reviewed and approved before appearing in the database.

## Troubleshooting

### Import Script Fails

- Check that JSON files are in the correct location
- Verify Supabase credentials in `.env.local`
- Ensure `equipment_database` table exists (run SQL migration first)
- Check console for specific error messages

### No Search Results

- Verify items are in the database: `SELECT * FROM equipment_database LIMIT 10;`
- Check that `verified = true` for items you want to appear
- Ensure `search_tokens` array is populated
- Check browser console for errors in `useEquipmentSearch` hook

### Duplicate Items

The table has a unique constraint on `(brand, model, category)`. If you see duplicates:
- They might be in different categories (which is allowed)
- Check the actual data: `SELECT brand, model, category, COUNT(*) FROM equipment_database GROUP BY brand, model, category HAVING COUNT(*) > 1;`

## Performance

- Indexes are created on `brand`, `model`, `name`, `category`, `subcategory`, and `search_tokens`
- Search results are limited to 50 items
- Consider adding pagination if you have thousands of items

## Next Steps

- Add image URLs to equipment items
- Implement user submissions workflow
- Add equipment specifications/details
- Create admin interface for managing equipment database


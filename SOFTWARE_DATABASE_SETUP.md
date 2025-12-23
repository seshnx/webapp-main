# Software Database Setup Guide

This guide explains how to set up the software database in Supabase using the `software_audio.json` file.

## Overview

The software database stores information about audio software (DAWs, plugins, virtual instruments, etc.) that can be used with the `SoftwareAutocomplete` component throughout the app.

## Files Structure

- **SQL Migration**: `sql/software_database_import.sql` - Creates/updates the `software_database` table
- **Import Script**: `scripts/import-software-database.js` - Node.js script to import multiple JSON files into Supabase
- **JSON Data Files**: `data/software/*.json` - Category-specific JSON files (see `data/software/CATEGORY_TEMPLATES.md`)
- **Hooks**: 
  - `src/hooks/useSoftwareDatabase.js` - Fetches software from Supabase
  - `src/hooks/useSoftwareSearch.js` - Provides search functionality
- **Component**: `src/components/shared/SoftwareAutocomplete.jsx` - Autocomplete component for software

## Setup Steps

### 1. Run SQL Migration

First, run the SQL migration script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of sql/software_database_import.sql
-- This creates the software_database table with proper indexes
```

Or run it via Supabase CLI:
```bash
supabase db push
```

### 2. Install Dependencies

Make sure you have the required Node.js packages (dotenv may need to be installed):

```bash
npm install
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

Create JSON files for each software category in the `data/software/` directory. See `data/software/CATEGORY_TEMPLATES.md` for a complete list of recommended categories and file structure.

**Required files:**
- `daws.json` ✅ (Already created)
- `plugins_effects.json` ✅ (Already created)
- `plugins_instruments.json` (To create)
- `plugins_mastering.json` (To create)
- `plugins_restoration.json` (To create)
- And more... (see templates document)

Each file should follow this structure:
```json
{
  "Category Name": {
    "Subcategory 1": [
      "Developer Software Name",
      "Another Developer Another Software"
    ]
  }
}
```

### 5. Run Import Script

Execute the import script:

```bash
node scripts/import-software-database.js
```

The script will:
1. Read all JSON files from `data/software/` directory
2. Parse software names to extract developer/software name
3. Generate search tokens for full-text search
4. Insert/update records in Supabase (handling duplicates automatically)
5. Process each category file separately

### 6. Verify Import

Check the Supabase dashboard to verify items were imported:

```sql
SELECT COUNT(*) FROM software_database;
SELECT category, COUNT(*) FROM software_database GROUP BY category;
```

## Database Schema

The `software_database` table has the following structure:

- `id` (UUID) - Primary key
- `brand` (TEXT) - Developer/Publisher (e.g., "Avid", "Apple", "Native Instruments")
- `model` (TEXT) - Software name/version (e.g., "Pro Tools", "Logic Pro", "Kontakt")
- `name` (TEXT) - Short name (e.g., "Pro Tools", "Logic", "Kontakt")
- `category` (TEXT) - Main category (e.g., "DAWs", "Plugins", "Virtual Instruments")
- `subcategory` (TEXT) - Subcategory (e.g., "Desktop DAWs", "EQ Plugins", "Synths")
- `description` (TEXT) - Optional description
- `specifications` (JSONB) - Technical specifications
- `images` (JSONB) - Array of image URLs
- `website_url` (TEXT) - Software website URL
- `search_tokens` (TEXT[]) - Array of searchable terms
- `verified` (BOOLEAN) - Whether item is verified
- `created_at`, `updated_at` (TIMESTAMPTZ) - Timestamps

## Usage in Components

The `SoftwareAutocomplete` component can be used like this:

```jsx
import SoftwareAutocomplete from './components/shared/SoftwareAutocomplete';

<SoftwareAutocomplete
    onSelect={(item) => console.log('Selected:', item)}
    placeholder="Search for software..."
    multi={false} // Set to true for comma-separated list
/>
```

## Search Functionality

The search uses:
- Full-text search on `search_tokens` array
- Brand, model, and name matching
- All query terms must match (AND logic)
- Results limited to 50 items for performance

## Adding New Software

### Via Import Script

1. Add new items to the appropriate category JSON file in `data/software/`
2. Re-run the import script (it will handle duplicates automatically)

### Via Supabase Dashboard

1. Go to Supabase Dashboard > Table Editor > `software_database`
2. Insert new row with required fields:
   - `brand`, `model`, `name`, `category`
   - Optionally set `verified = true` for immediate visibility

## Fixing Incorrect Brand Parsing

After importing, you may find some entries where multi-word developers were incorrectly split. For example:
- ❌ `brand: "Native"`, `model: "Instruments Kontakt"` 
- ✅ `brand: "Native Instruments"`, `model: "Kontakt"`

### Using the Fix Script

1. **Run SQL query first** to identify potentially incorrect entries:
   ```sql
   -- Copy and paste contents of sql/fix_incorrect_software_brands.sql
   ```

2. **Run the Node.js fix script**:
   ```bash
   node scripts/fix-incorrect-software-brands.js
   ```

The script will:
- Identify entries with suspicious brand/model patterns
- Re-parse using the improved `parseSoftwareName` function
- Update entries with correct brand/model/name
- Regenerate search tokens
- Handle duplicates (delete incorrect, keep correct)

### Common Issues Fixed

- Models starting with "&" or "-" (split multi-word brands)
- Models starting with "Instruments", "Audio", "Studio", "Multimedia", "Records", "Labs", "DSP"
- Incorrect parsing of multi-word developers like:
  - "Native Instruments" → "Native" / "Instruments Kontakt"
  - "Universal Audio" → "Universal" / "Audio Pultec"
  - "Xfer Records" → "Xfer" / "Records Serum"
  - "IK Multimedia" → "IK" / "Multimedia SampleTank"

## Troubleshooting

### Import Script Fails

- Check that JSON files are in `data/software/` directory
- Verify Supabase credentials in `.env.local`
- Ensure `software_database` table exists (run SQL migration first)
- Check console for specific error messages

### No Search Results

- Verify items are in the database: `SELECT * FROM software_database LIMIT 10;`
- Check that `verified = true` for items you want to appear
- Ensure `search_tokens` array is populated
- Check browser console for errors in `useSoftwareSearch` hook

### Duplicate Items

The table has a unique constraint on `(brand, model, category)`. If you see duplicates:
- They might be in different categories (which is allowed)
- Check the actual data: `SELECT brand, model, category, COUNT(*) FROM software_database GROUP BY brand, model, category HAVING COUNT(*) > 1;`

### Incorrect Brand/Model Parsing

If you notice incorrect brand/model parsing after import:
1. Run `sql/fix_incorrect_software_brands.sql` to identify issues
2. Run `node scripts/fix-incorrect-software-brands.js` to automatically fix them

## Performance

- Indexes are created on `brand`, `model`, `name`, `category`, `subcategory`, and `search_tokens`
- Search results are limited to 50 items
- Consider adding pagination if you have thousands of items

## Differences from Gear Database

- Software database uses `brand` for developer/publisher (not manufacturer)
- Software database includes `website_url` field
- Software database is separate from equipment database for better organization


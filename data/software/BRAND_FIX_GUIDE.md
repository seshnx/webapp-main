# Software Database Brand Fix Guide

## Overview

After importing software data, some entries may have incorrect brand/model parsing, especially for multi-word developers like "Native Instruments", "Universal Audio", "Xfer Records", etc.

## Identifying Issues

### SQL Query

Run the SQL script to identify potentially incorrect entries:

```sql
-- See sql/fix_incorrect_software_brands.sql
```

This will show entries where:
- Model starts with "&" or "-"
- Model starts with common developer words ("Instruments", "Audio", "Studio", etc.)
- Both brand and model contain "&"

### Common Patterns

**Incorrect:**
- `brand: "Native"`, `model: "Instruments Kontakt"`
- `brand: "Universal"`, `model: "Audio Pultec EQP-1A"`
- `brand: "Xfer"`, `model: "Records Serum"`
- `brand: "IK"`, `model: "Multimedia SampleTank"`

**Correct:**
- `brand: "Native Instruments"`, `model: "Kontakt"`
- `brand: "Universal Audio"`, `model: "Pultec EQP-1A"`
- `brand: "Xfer Records"`, `model: "Serum"`
- `brand: "IK Multimedia"`, `model: "SampleTank"`

## Automatic Fix

### Step 1: Run SQL Query (Optional)

First, identify the issues:

```sql
-- Run sql/fix_incorrect_software_brands.sql in Supabase SQL Editor
```

### Step 2: Run Fix Script

Automatically fix all incorrect entries:

```bash
node scripts/fix-incorrect-software-brands.js
```

The script will:
1. Fetch entries with suspicious patterns
2. Re-parse using improved `parseSoftwareName` function
3. Update brand, model, name, and search_tokens
4. Handle duplicates (delete incorrect, keep correct)
5. Report fixed/skipped/error counts

## How It Works

The fix script uses the same `parseSoftwareName` function from the import script, which:
1. Checks against a comprehensive list of known multi-word developers
2. Matches longer developer names first (e.g., "Native Instruments" before "Native")
3. Properly handles special characters (&, -, etc.)
4. Generates correct search tokens

## Example Output

```
Starting software brand fix process...

Found 25 potentially incorrect entries

  Fixed: "Native Instruments Kontakt" → "Native Instruments Kontakt"
  Fixed: "Universal Audio Pultec EQP-1A" → "Universal Audio Pultec EQP-1A"
  Fixed: "Xfer Records Serum" → "Xfer Records Serum"
  ...

Fix complete!
Fixed: 20 entries
Skipped: 5 entries (already correct or no significant change)
Errors: 0 entries
```

## Manual Fix (If Needed)

If the automatic script doesn't catch everything, you can manually fix entries:

```sql
-- Example: Fix "Native Instruments" entries
UPDATE software_database
SET 
    brand = 'Native Instruments',
    model = REPLACE(model, 'Instruments ', ''),
    name = REPLACE(model, 'Instruments ', '')
WHERE brand = 'Native' AND model LIKE 'Instruments %';
```

## Prevention

The import script (`scripts/import-software-database.js`) already uses the improved parsing function, so new imports should be correct. This fix script is primarily for:
- Data imported before the improved parsing was implemented
- Manual entries that were incorrectly formatted
- Data migrated from other sources


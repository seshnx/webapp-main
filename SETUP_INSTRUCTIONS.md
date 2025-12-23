# Quick Setup Instructions for Gear Database

## Step 1: Create .env.local file

Create a file named `.env.local` in the project root with:

```env
VITE_SUPABASE_URL=https://jifhavvwftrdubyriugu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZmhhdnZ3ZnRyZHVieXJpdWd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgxNTI2OSwiZXhwIjoyMDgxMzkxMjY5fQ.ysbbQ9_z65fw3Toc5KwiHimkuaTnF8K-P3sGO8Ik7Ms
```

## Step 2: Run SQL Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jifhavvwftrdubyriugu
2. Navigate to SQL Editor
3. Copy and paste the contents of `sql/gear_database_import.sql`
4. Click "Run" to execute the migration

This will create the `equipment_database` table with all necessary indexes and policies.

## Step 3: Install Dependencies (if needed)

```bash
npm install
```

## Step 4: Run Import Script

Make sure your JSON files are in: `../Amalia Media LLC/Webapp/` (relative to project root)

**Note:** The script will skip `software_audio.json` as it will have a separate Software Database.

Then run:

```bash
node scripts/import-gear-database.js
```

The script will:
- Read all 8 JSON files
- Parse equipment names
- Generate search tokens
- Import into Supabase

## Step 5: Verify

Check in Supabase Dashboard:
- Table Editor > `equipment_database`
- Should see thousands of equipment items

Or run in SQL Editor:
```sql
SELECT COUNT(*) FROM equipment_database;
SELECT category, COUNT(*) FROM equipment_database GROUP BY category;
```

## Troubleshooting

### Import script can't find JSON files
- Check that files are in: `../Amalia Media LLC/Webapp/`
- Or modify the path in `scripts/import-gear-database.js`

### Missing credentials error
- Ensure `.env.local` exists in project root
- Check that credentials are correct

### Duplicate key errors
- This is normal - the script uses upsert, so duplicates are handled
- Items with same (brand, model, category) will be updated


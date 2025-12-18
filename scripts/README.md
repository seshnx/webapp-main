# Supabase Diagnostic Scripts

These scripts help you diagnose Supabase connection and table issues.

## Quick Browser Check (Easiest)

1. Open your app in the browser
2. Open the browser console (F12)
3. Copy and paste the contents of `check-supabase-browser.js` into the console
4. Press Enter

This will check all your tables and show you which ones exist, which are missing, and which have permission issues.

## Node.js Script (Alternative)

If you prefer to run from the command line:

```bash
# Make sure you have your Supabase credentials in your environment
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-anon-key"

# Run the script
node scripts/check-supabase-tables.js
```

## What to Do If Tables Are Missing

If the script shows that tables are missing (like `market_items`):

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor**
4. Open the relevant SQL file from the `sql/` folder (e.g., `sql/marketplace_module.sql`)
5. Copy and paste the entire SQL script
6. Click **Run** to execute it
7. Refresh your app

## Common Issues

### 404 Error (Table does not exist)
- **Solution**: Run the SQL script to create the table

### Permission Denied (RLS blocking)
- **Solution**: Check your Row Level Security policies in Supabase
- Go to **Authentication** → **Policies** in your Supabase dashboard
- Make sure the SELECT policy allows the operation you're trying to perform

### Connection Issues
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Verify your Supabase project is active and not paused


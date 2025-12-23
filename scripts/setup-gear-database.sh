#!/bin/bash
# Setup script for gear database
# This script helps set up the environment and run the import

echo "Setting up gear database..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
VITE_SUPABASE_URL=https://jifhavvwftrdubyriugu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZmhhdnZ3ZnRyZHVieXJpdWd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgxNTI2OSwiZXhwIjoyMDgxMzkxMjY5fQ.ysbbQ9_z65fw3Toc5KwiHimkuaTnF8K-P3sGO8Ik7Ms
EOF
    echo ".env.local created!"
else
    echo ".env.local already exists, skipping..."
fi

echo ""
echo "Next steps:"
echo "1. Run the SQL migration in Supabase SQL Editor (sql/gear_database_import.sql)"
echo "2. Run: node scripts/import-gear-database.js"


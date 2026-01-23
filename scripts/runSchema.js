/**
 * Run SQL Schema Script
 *
 * This script executes SQL files against the Neon database.
 * Run with: node scripts/runSchema.js [sqlfile]
 *
 * @example
 * node scripts/runSchema.js sql/equipment_database_schema.sql
 */

import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env and .env.local
const envPath = path.join(__dirname, '..');
dotenv.config({ path: path.join(envPath, '.env') });
dotenv.config({ path: path.join(envPath, '.env.local') });

// Direct Neon connection (doesn't use Vite's import.meta.env)
const neonUrl = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL or DATABASE_URL not found in environment');
    console.error('Please make sure your .env file contains the database URL');
    process.exit(1);
}

let client;

async function executeQuery(queryString) {
    if (!client) {
        client = new Client({ connectionString: neonUrl });
        await client.connect();
    }
    return await client.query(queryString);
}

async function runSqlFile(sqlFilePath) {
    const fullPath = path.join(__dirname, '..', sqlFilePath);

    console.log(`📄 Reading SQL file: ${sqlFilePath}`);

    if (!fs.existsSync(fullPath)) {
        console.error(`❌ File not found: ${fullPath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(fullPath, 'utf8');

    console.log(`📝 Executing SQL script...\n`);

    try {
        // Run the entire SQL file at once
        await executeQuery(sql);
        console.log('✅ SQL script executed successfully!\n');
    } catch (error) {
        console.error('❌ Error executing SQL script:');
        console.error(`   ${error.message}\n`);
        process.exit(1);
    }
}

// Main execution
const sqlFile = process.argv[2];

if (!sqlFile) {
    console.error('Usage: node scripts/runSchema.js <sql-file>');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/runSchema.js sql/equipment_database_schema.sql');
    console.error('');
    console.error('Available SQL files:');
    const sqlDir = path.join(__dirname, '..', 'sql');
    if (fs.existsSync(sqlDir)) {
        const files = fs.readdirSync(sqlDir).filter(f => f.endsWith('.sql'));
        files.forEach(f => console.error(`  - sql/${f}`));
    }
    process.exit(1);
}

runSqlFile(sqlFile)
    .then(async () => {
        console.log('✅ Done!\n');
        if (client) await client.end();
        process.exit(0);
    })
    .catch(async (err) => {
        console.error('\n❌ Fatal error:', err);
        if (client) await client.end();
        process.exit(1);
    });

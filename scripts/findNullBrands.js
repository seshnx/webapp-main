/**
 * Find all items with NULL brands to identify remaining issues
 */

import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '..');
dotenv.config({ path: path.join(envPath, '.env') });
dotenv.config({ path: path.join(envPath, '.env.local') });

const neonUrl = process.env.VITE_NEON_DATABASE_URL || process.env.DATABASE_URL;
const client = new Client({ connectionString: neonUrl });

await client.connect();

// Find all items with NULL brands
const result = await client.query(
    'SELECT name FROM equipment_database WHERE brand IS NULL ORDER BY name'
);

console.log(`\n🔍 Found ${result.rows.length} items with NULL brands:\n`);

result.rows.forEach(row => {
    console.log(`- ${row.name}`);
});

console.log('\n');

await client.end();

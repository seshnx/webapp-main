/**
 * Verify Current Database State
 * Run with: node scripts/verify-database.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const { Client } = pg;

async function verifyDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // List all tables
        console.log('=== Current Tables ===');
        const tables = await client.query(`
            SELECT tablename, tableowner
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `);

        if (tables.rows.length === 0) {
            console.log('No tables found in public schema.');
        } else {
            console.log(`Found ${tables.rows.length} tables:\n`);
            tables.rows.forEach((row, i) => {
                console.log(`${(i + 1).toString().padStart(3)}. ${row.tablename} (owner: ${row.tableowner})`);
            });
        }

        // Get table counts
        console.log('\n=== Table Statistics ===');
        const stats = await client.query(`
            SELECT
                COUNT(*) as total_tables,
                COUNT(*) FILTER (WHERE tablename LIKE 'booking%') as booking_tables,
                COUNT(*) FILTER (WHERE tablename LIKE 'market%') as market_tables,
                COUNT(*) FILTER (WHERE tablename LIKE 'profile%') as profile_tables,
                COUNT(*) FILTER (WHERE tablename LIKE 'equipment%') as equipment_tables,
                COUNT(*) FILTER (WHERE tablename LIKE 'instrument%') as instrument_tables
            FROM pg_tables
            WHERE schemaname = 'public';
        `);

        const s = stats.rows[0];
        console.log(`Total tables: ${s.total_tables}`);
        console.log(`Booking tables: ${s.booking_tables}`);
        console.log(`Marketplace tables: ${s.market_tables}`);
        console.log(`Profile tables: ${s.profile_tables}`);
        console.log(`Equipment tables: ${s.equipment_tables}`);
        console.log(`Instrument tables: ${s.instrument_tables}`);

        // Check for critical tables
        console.log('\n=== Critical Tables Check ===');
        const critical = await client.query(`
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename IN ('profiles', 'bookings', 'market_items', 'posts', 'equipment_database', 'instrument_database')
            ORDER BY tablename;
        `);

        const criticalTables = ['profiles', 'bookings', 'market_items', 'posts', 'equipment_database', 'instrument_database'];
        criticalTables.forEach(table => {
            const exists = critical.rows.find(r => r.tablename === table);
            console.log(`${exists ? '✅' : '❌'} ${table}`);
        });

        // Database size
        console.log('\n=== Database Size ===');
        const size = await client.query(`
            SELECT
                pg_size_pretty(pg_database_size(current_database())) as database_size;
        `);
        console.log(`Database size: ${size.rows[0].database_size}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

verifyDatabase();

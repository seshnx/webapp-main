/**
 * Safe Schema Update Script
 * Creates missing tables and adds missing columns/indexes without dropping data
 * Run with: node scripts/apply-schema-update.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const { Client } = pg;

// Schema definitions for tables to check/create
const SCHEMA_DEFINITIONS = {
    equipment_database: `
        CREATE TABLE IF NOT EXISTS equipment_database (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(500) NOT NULL,
            brand VARCHAR(255),
            model VARCHAR(500),
            category VARCHAR(255) NOT NULL,
            subcategory VARCHAR(255) NOT NULL,
            description TEXT,
            specifications JSONB,
            search_tokens TEXT[] DEFAULT '{}',
            verified BOOLEAN DEFAULT true,
            verified_by UUID[] DEFAULT '{}',
            added_by UUID,
            added_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `,
    equipment_submissions: `
        CREATE TABLE IF NOT EXISTS equipment_submissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            brand VARCHAR(255) NOT NULL,
            model VARCHAR(500) NOT NULL,
            category VARCHAR(255) NOT NULL,
            sub_category VARCHAR(255),
            specs TEXT NOT NULL,
            submitted_by UUID NOT NULL,
            submitter_name VARCHAR(255),
            status VARCHAR(50) DEFAULT 'pending',
            votes JSONB DEFAULT '{"yes": [], "fake": [], "duplicate": []}',
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `,
    instrument_database: `
        CREATE TABLE IF NOT EXISTS instrument_database (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(500) NOT NULL,
            brand VARCHAR(255),
            model VARCHAR(500),
            category VARCHAR(255) NOT NULL,
            subcategory VARCHAR(255) NOT NULL,
            type VARCHAR(255),
            series VARCHAR(255),
            size VARCHAR(100),
            description TEXT,
            specifications JSONB,
            search_tokens TEXT[] DEFAULT '{}',
            verified BOOLEAN DEFAULT true,
            verified_by UUID[] DEFAULT '{}',
            added_by UUID,
            added_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `,
    instrument_submissions: `
        CREATE TABLE IF NOT EXISTS instrument_submissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            brand VARCHAR(255) NOT NULL,
            model VARCHAR(500) NOT NULL,
            category VARCHAR(255) NOT NULL,
            sub_category VARCHAR(255),
            type VARCHAR(255),
            series VARCHAR(255),
            size VARCHAR(100),
            specs TEXT NOT NULL,
            submitted_by UUID NOT NULL,
            submitter_name VARCHAR(255),
            status VARCHAR(50) DEFAULT 'pending',
            votes JSONB DEFAULT '{"yes": [], "fake": [], "duplicate": []}',
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `
};

const INDEX_DEFINITIONS = {
    equipment_database: [
        'CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment_database(category);',
        'CREATE INDEX IF NOT EXISTS idx_equipment_subcategory ON equipment_database(subcategory);',
        'CREATE INDEX IF NOT EXISTS idx_equipment_verified ON equipment_database(verified);',
        'CREATE INDEX IF NOT EXISTS idx_equipment_brand ON equipment_database(brand);',
        'CREATE INDEX IF NOT EXISTS idx_equipment_tokens ON equipment_database USING GIN(search_tokens);'
    ],
    instrument_database: [
        'CREATE INDEX IF NOT EXISTS idx_instrument_category ON instrument_database(category);',
        'CREATE INDEX IF NOT EXISTS idx_instrument_subcategory ON instrument_database(subcategory);',
        'CREATE INDEX IF NOT EXISTS idx_instrument_type ON instrument_database(type);',
        'CREATE INDEX IF NOT EXISTS idx_instrument_series ON instrument_database(series);',
        'CREATE INDEX IF NOT EXISTS idx_instrument_brand ON instrument_database(brand);',
        'CREATE INDEX IF NOT EXISTS idx_instrument_verified ON instrument_database(verified);',
        'CREATE INDEX IF NOT EXISTS idx_instrument_tokens ON instrument_database USING GIN(search_tokens);'
    ]
};

const FUNCTION_DEFINITIONS = {
    generate_equipment_tokens: `
        CREATE OR REPLACE FUNCTION generate_equipment_tokens()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.search_tokens := ARRAY[
                LOWER(NEW.name),
                LOWER(NEW.brand),
                LOWER(NEW.model),
                LOWER(NEW.category),
                LOWER(NEW.subcategory)
            ];
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `,
    update_equipment_timestamp: `
        CREATE OR REPLACE FUNCTION update_equipment_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `,
    generate_instrument_tokens: `
        CREATE OR REPLACE FUNCTION generate_instrument_tokens()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.search_tokens := ARRAY[
                LOWER(NEW.name),
                LOWER(NEW.brand),
                LOWER(NEW.model),
                LOWER(NEW.category),
                LOWER(NEW.subcategory),
                LOWER(COALESCE(NEW.type, '')),
                LOWER(COALESCE(NEW.series, '')),
                LOWER(COALESCE(NEW.size, ''))
            ];
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `,
    update_instrument_timestamp: `
        CREATE OR REPLACE FUNCTION update_instrument_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `
};

const TRIGGER_DEFINITIONS = [
    'DROP TRIGGER IF EXISTS equipment_tokens_trigger ON equipment_database;',
    'CREATE TRIGGER equipment_tokens_trigger BEFORE INSERT OR UPDATE ON equipment_database FOR EACH ROW EXECUTE FUNCTION generate_equipment_tokens();',
    'DROP TRIGGER IF EXISTS equipment_timestamp_trigger ON equipment_database;',
    'CREATE TRIGGER equipment_timestamp_trigger BEFORE UPDATE ON equipment_database FOR EACH ROW EXECUTE FUNCTION update_equipment_timestamp();',
    'DROP TRIGGER IF EXISTS instrument_tokens_trigger ON instrument_database;',
    'CREATE TRIGGER instrument_tokens_trigger BEFORE INSERT OR UPDATE ON instrument_database FOR EACH ROW EXECUTE FUNCTION generate_instrument_tokens();',
    'DROP TRIGGER IF EXISTS instrument_timestamp_trigger ON instrument_database;',
    'CREATE TRIGGER instrument_timestamp_trigger BEFORE UPDATE ON instrument_database FOR EACH ROW EXECUTE FUNCTION update_instrument_timestamp();'
];

async function applySchemaUpdate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Step 1: Check existing tables
        console.log('=== Step 1: Checking Existing Tables ===');
        const existingTables = await client.query(`
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `);
        const existingTableNames = new Set(existingTables.rows.map(r => r.tablename));
        console.log(`Found ${existingTableNames.size} existing tables\n`);

        // Step 2: Create missing tables
        console.log('=== Step 2: Creating Missing Tables ===');
        for (const [tableName, tableSQL] of Object.entries(SCHEMA_DEFINITIONS)) {
            if (existingTableNames.has(tableName)) {
                console.log(`⊙ ${tableName} - already exists, skipping`);
            } else {
                console.log(`+ Creating ${tableName}...`);
                await client.query(tableSQL);
                console.log(`  ✅ Created ${tableName}`);
            }
        }
        console.log('');

        // Step 3: Create indexes
        console.log('=== Step 3: Creating Missing Indexes ===');
        for (const [tableName, indexes] of Object.entries(INDEX_DEFINITIONS)) {
            if (!existingTableNames.has(tableName)) {
                console.log(`⊙ ${tableName} - new table, skipping index check`);
                continue;
            }
            console.log(`Checking indexes for ${tableName}...`);
            for (const indexSQL of indexes) {
                try {
                    await client.query(indexSQL);
                    console.log(`  + Index created/verified`);
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.log(`  ⚠️  ${err.message.substring(0, 100)}`);
                    }
                }
            }
        }
        console.log('');

        // Step 4: Create/update functions
        console.log('=== Step 4: Creating/Updating Functions ===');
        for (const [funcName, funcSQL] of Object.entries(FUNCTION_DEFINITIONS)) {
            console.log(`+ ${funcName}...`);
            await client.query(funcSQL);
            console.log(`  ✅ Created/updated ${funcName}`);
        }
        console.log('');

        // Step 5: Create triggers
        console.log('=== Step 5: Creating Triggers ===');
        for (const triggerSQL of TRIGGER_DEFINITIONS) {
            try {
                await client.query(triggerSQL);
                if (triggerSQL.includes('CREATE TRIGGER')) {
                    console.log(`+ Trigger created`);
                }
            } catch (err) {
                if (!err.message.includes('already exists')) {
                    console.log(`⚠️  ${err.message.substring(0, 100)}`);
                }
            }
        }
        console.log('');

        // Step 6: Verify
        console.log('=== Step 6: Verification ===');
        const finalTables = await client.query(`
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename LIKE '%equipment%' OR tablename LIKE '%instrument%'
            ORDER BY tablename;
        `);

        const dbStats = await client.query(`
            SELECT
                COUNT(*) FILTER (WHERE tablename = 'equipment_database') as has_equipment,
                COUNT(*) FILTER (WHERE tablename = 'instrument_database') as has_instrument,
                COUNT(*) FILTER (WHERE tablename = 'equipment_submissions') as has_equipment_sub,
                COUNT(*) FILTER (WHERE tablename = 'instrument_submissions') as has_instrument_sub
            FROM pg_tables
            WHERE schemaname = 'public';
        `);

        const s = dbStats.rows[0];
        console.log(`Equipment Database: ${s.has_equipment ? '✅' : '❌'}`);
        console.log(`Equipment Submissions: ${s.has_equipment_sub ? '✅' : '❌'}`);
        console.log(`Instrument Database: ${s.has_instrument ? '✅' : '❌'}`);
        console.log(`Instrument Submissions: ${s.has_instrument_sub ? '✅' : '❌'}`);

        console.log('\n✅ Schema update complete!');
        console.log('\nNext steps:');
        console.log('1. Import equipment data: node scripts/import-gear-database.js');
        console.log('2. Import instrument data: node scripts/import-instruments-database.js');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applySchemaUpdate();

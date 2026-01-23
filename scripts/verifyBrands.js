/**
 * Quick script to verify brand detection for previously problematic items
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

// Check previously problematic items
const testItems = [
    'Rane HA6S',
    'ART HeadAmp6Pro',
    'Lake People G103-S',
    'Etymotic ER2XR',
    'Stax SR-007',
    'Westone UM Pro 10',
    'Ultimate Ears UE 18 Pro',
    'JH Audio JH16 Pro',
    '64 Audio A12t',
    'Campfire Audio Andromeda',
    'Strymon BigSky',
    'Electro-Harmonix Memory Man',
    'MXR Carbon Copy',
    'Eventide H9000',
    'Sound Devices 888',
    'Zaxcom Deva 24',
    'Nagra VI',
    'Audeze LCD-4',
    'HiFiMan Susvara',
    'Dan Clark Audio Stealth',
    'Meze Audio Empyrean',
    'ZMF Verite',
    'Grado PS1000e',
    'DiGiCo SD12',
    'Midas Pro9',
    'Neve 1073DPD',
    'Solid State Logic (SSL) L550'
];

console.log('🔍 Verifying brand detection for previously problematic items:\n');

let successCount = 0;
let failCount = 0;

for (const itemName of testItems) {
    const result = await client.query(
        'SELECT brand, model FROM equipment_database WHERE name = $1',
        [itemName]
    );

    if (result.rows.length > 0) {
        const { brand, model } = result.rows[0];
        const status = brand ? '✅' : '❌';
        if (brand) successCount++;
        else failCount++;

        console.log(`${status} ${itemName}`);
        console.log(`   Brand: ${brand || 'NULL'}`);
        console.log(`   Model: ${model || 'NULL'}`);
        console.log('');
    } else {
        console.log(`⚠️  ${itemName} - Not found in database\n`);
        failCount++;
    }
}

console.log('\n📊 Summary:');
console.log(`   ✅ Successful: ${successCount}`);
console.log(`   ❌ Failed: ${failCount}`);
console.log(`   📝 Total: ${testItems.length}\n`);

// Show count of null brands
const nullBrandCount = await client.query(
    'SELECT COUNT(*) FROM equipment_database WHERE brand IS NULL'
);
console.log(`\n⚠️  Items with NULL brand: ${nullBrandCount.rows[0].count}\n`);

await client.end();

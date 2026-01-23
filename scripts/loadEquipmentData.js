/**
 * Equipment Database Loader
 *
 * This script loads equipment data from JSON files into the Neon database.
 * Run with: node scripts/loadEquipmentData.js
 *
 * Prerequisites:
 * - Neon database connection string in .env (DATABASE_URL)
 * - Equipment JSON files in the parent directory
 * - equipment_database table created in Neon
 */

import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
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

if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL or DATABASE_URL not found in environment');
    process.exit(1);
}

const client = new Client({ connectionString: neonUrl });
await client.connect();

async function query(sql, params) {
    return await client.query(sql, params);
}

// Equipment JSON files
const EQUIPMENT_FILES = [
    'microphones_and_transducers.json',
    'audio_interfaces.json',
    'studio_monitors.json',
    'mixers_and_consoles.json',
    'outboard_gear.json',
    'recording_devices.json',
    'headphones.json'
];

/**
 * Parse equipment name to extract brand and model
 * @param {string} fullName - Full equipment name (e.g., "Neumann U87")
 * @returns {object} - { brand, model }
 */
function parseEquipmentName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
        return { brand: null, model: fullName };
    }

    // Common brand patterns
    const brands = [
        // Major microphone brands
        'Neumann', 'Shure', 'AKG', 'Sennheiser', 'Audio-Technica', 'Rode', 'Blue',
        'Telefunken', 'Beyerdynamic', 'Electro-Voice', 'Audix', 'Heil', 'Warm',
        'Aston', 'sE', 'Lauten', 'Miktek', 'Roswell', 'Manley', 'Peluso',
        'Chandler', 'MXL', 'Samson', 'Sony', 'DPA', 'Schoeps', 'Earthworks',
        'Oktava', 'Lewitt', 'Josephson', 'Bock', 'Lawson', 'Royer', 'AEA',
        'Coles', 'RCA', 'Cathedral', 'Wunder',

        // Audio interfaces
        'Focusrite', 'PreSonus', 'Behringer', 'Audient', 'Universal', 'MOTU',
        'SSL', 'Apogee', 'Antelope', 'Merging', 'Metric', 'Prism', 'RME',
        'Lynx', 'Avid', 'Steinberg', 'Tascam', 'Zoom', 'Elgato',

        // Studio monitors
        'Yamaha', 'Mackie', 'KRK', 'Genelec', 'Adam', 'Dynaudio', 'PMC', 'ATC',
        'Focal', 'JBL', 'M-Audio', 'IK', 'Arturia', 'Native', 'Roland', 'Line',
        'Alesis', 'Event', 'Tannoy', 'Quested', 'Barefoot', 'Amphion', 'Unity',
        'HEDD', 'PSI', 'Kali Audio', 'Equator',

        // Console/control brands
        'Soundcraft', 'Midas', 'DiGiCo', 'Allen & Heath', 'Solid State Logic',
        'QSC', 'iCon', 'Novation', 'Euphonix', 'Harrison', 'Calrec', 'Lawo',

        // Outboard gear brands
        'Grace', 'Dangerous', 'Coleman', 'Drawmer', 'Radial', 'Crane', 'SPL',
        'API', 'ESI', 'Kenton', 'Edirol', 'Boss', 'Echo', 'Lexicon', 'E-Mu',
        'Digidesign', 'Neve', 'Avalon', 'Millennia', 'dbx', 'Aphex', 'TL Audio',
        'MindPrint', 'Joemeek', 'Summit Audio', 'Sebatron', 'Vintech Audio',
        'Chameleon Labs', 'LaChapell Audio', 'Phoenix Audio', 'Shadow Hills',
        'Shadow Hills Industries', 'Tree Audio', 'Heritage Audio', 'Daking',
        'Pendulum Audio', 'A-Designs', 'True Systems', 'BAE', 'Avedis', 'FMR Audio',
        'Empirical Labs', 'Teletronix', 'Tube-Tech', 'Purple Audio',
        'Retro Instruments', 'Fairchild', 'Pultec', 'Tegeler Audio',
        'Undertone Audio', 'Lindell Audio', 'Klark Teknik', 'Bricasti',
        'Great River', 'ART', 'Art Pro Audio', 'Louder Than Liftoff', 'Rolls',

        // Effects brands
        'Strymon', 'Electro-Harmonix', 'MXR', 'Eventide', 'Waves', 'iZotope',
        'Sound Toys', 'FabFilter', 'Valhalla', 'Softube', 'Brainworx',
        'Slate Digital', 'Baby Audio',

        // Recording devices
        'Korg', 'Fostex', 'Sound Devices', 'Aaton', 'Zaxcom', 'Nagra', 'JoeCo',
        'Marantz', 'Olympus', 'Denon',

        // Headphone/IEM brands
        'Etymotic', 'Stax', 'Westone', 'Ultimate Ears', 'JH Audio', '64 Audio',
        'Campfire Audio', 'Audeze', 'AudioQuest', 'HiFiMan', 'Dan Clark Audio',
        'Meze Audio', 'ZMF', 'Grado', 'Rane', 'Lake People', 'Ferrofish',
        'Fifine', 'Fluid Audio', 'Avantone',

        // Computer/gaming audio
        'Neat Microphones', 'Maono', 'HyperX', 'Logitech', 'Movo', 'Razer',
        'Audioengine', 'Schiit', 'Topping', 'FiiO', 'Pro-Ject', 'Woo Audio',
        'Ocean Way Audio',

        // Wireless/system brands
        'Mipro', 'Lectrosonics', 'Atomos', 'Crown', 'Whirlwind', 'BSS',
        'Little Labs', 'Reamp', 'Sonoma Wire Works', 'iConnectivity',
        'Aviom', 'KLANG', 'Speck Electronics', 'Wheatstone',

        // Software/tech brands
        'IK Multimedia', 'Polarity', 'Sanken', 'Countryman', 'Tram',
        'Bubblebee', 'Deity', 'Azden', 'Point Source', 'PSP', 'AtoV',
        'Golden Age', 'Samar', 'Mesanovic', 'Stager', 'Cascade', 'Cloud',
        'Palmer', 'Rupert Neve Designs', 'Trident', 'Fluid', 'Studio',
        'Spitfire', 'Output', 'Native Instruments', 'TC', 'Mercury',
        'Plugin Alliance', 'Maag', 'Black Box', 'Overstayer', 'Elysia',
        'Buzz Audio', 'Tonelux', 'Hendyamps'
    ];

    // Find brand in name
    let brand = null;
    let model = fullName;

    for (const b of brands) {
        const regex = new RegExp(`^${b}\\s+(.+)$`, 'i');
        const match = fullName.match(regex);
        if (match) {
            brand = b;
            model = match[1];
            break;
        }
    }

    return { brand: brand || null, model: model.trim() || fullName };
}

/**
 * Flatten nested category structure from JSON
 * @param {object} categoryData - Category object with subcategories
 * @param {string} categoryName - Top-level category name
 * @returns {array} - Array of equipment items
 */
function flattenCategoryData(categoryData, categoryName) {
    const items = [];

    for (const [subcategory, data] of Object.entries(categoryData)) {
        if (Array.isArray(data)) {
            // Simple array of items
            data.forEach(item => {
                items.push({
                    name: item,
                    category: categoryName,
                    subcategory
                });
            });
        } else if (typeof data === 'object') {
            // Nested subcategories
            for (const [nestedSubcategory, nestedItems] of Object.entries(data)) {
                if (Array.isArray(nestedItems)) {
                    nestedItems.forEach(item => {
                        items.push({
                            name: item,
                            category: categoryName,
                            subcategory: nestedSubcategory
                        });
                    });
                }
            }
        }
    }

    return items;
}

/**
 * Load equipment data from JSON files
 * @returns {Promise<void>}
 */
async function loadEquipmentData() {
    console.log('🎧 Equipment Database Loader\n');

    try {
        const jsonDir = path.join(__dirname, '../..');
        let totalItems = 0;
        let loadedCount = 0;
        let skippedCount = 0;

        // Clear existing data
        console.log('🗑️  Clearing existing equipment data...');
        await query('DELETE FROM equipment_database');
        console.log('✅ Cleared existing data\n');

        // Process each JSON file
        for (const filename of EQUIPMENT_FILES) {
            const filepath = path.join(jsonDir, filename);

            if (!fs.existsSync(filepath)) {
                console.warn(`⚠️  File not found: ${filename}`);
                continue;
            }

            console.log(`📄 Reading ${filename}...`);
            const fileContent = fs.readFileSync(filepath, 'utf8');
            const jsonData = JSON.parse(fileContent);

            // Process each category in the file
            for (const [categoryName, categoryData] of Object.entries(jsonData)) {
                console.log(`   Processing: ${categoryName}`);

                const items = flattenCategoryData(categoryData, categoryName);
                totalItems += items.length;

                // Batch insert items (100 at a time)
                const batchSize = 100;
                for (let i = 0; i < items.length; i += batchSize) {
                    const batch = items.slice(i, i + batchSize);

                    for (const item of batch) {
                        const { brand, model } = parseEquipmentName(item.name);

                        try {
                            await query(
                                `INSERT INTO equipment_database (
                                    name, brand, model, category, subcategory, verified
                                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                                [item.name, brand, model, item.category, item.subcategory, true]
                            );
                            loadedCount++;
                        } catch (err) {
                            if (err.code !== '23505') { // Ignore duplicate key errors
                                console.error(`   ❌ Error inserting "${item.name}":`, err.message);
                                skippedCount++;
                            } else {
                                skippedCount++;
                            }
                        }
                    }

                    process.stdout.write(`\r   Progress: ${Math.min(i + batchSize, items.length)}/${items.length} items`);
                }

                console.log(`\n   ✅ Completed: ${categoryName}`);
            }
        }

        console.log('\n');
        console.log('📊 Summary:');
        console.log(`   Total items processed: ${totalItems}`);
        console.log(`   Successfully loaded: ${loadedCount}`);
        console.log(`   Skipped/duplicates: ${skippedCount}`);

        // Verify count
        const { rows } = await query('SELECT COUNT(*) as count FROM equipment_database');
        console.log(`   Database count: ${rows[0].count}`);

        console.log('\n✅ Equipment database loaded successfully!\n');

    } catch (error) {
        console.error('❌ Error loading equipment data:', error);
        await client.end();
        process.exit(1);
    }
}

// Run the loader
loadEquipmentData()
    .then(async () => {
        await client.end();
        process.exit(0);
    })
    .catch(async (err) => {
        console.error('Fatal error:', err);
        await client.end();
        process.exit(1);
    });

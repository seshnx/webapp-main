/**
 * Import Instrument Database from JSON files to Neon/Supabase
 *
 * This script reads the JSON files containing instrument data and imports them
 * into the instrument_database table using the 'pg' package directly.
 *
 * Usage: node scripts/import-instruments-database.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Missing DATABASE_URL. Please check your .env.local file.');
    process.exit(1);
}

// Map JSON file names to categories and subcategories
const CATEGORY_MAP = {
    // String Instruments
    'electric_guitars.json': { category: 'String Instruments', subcategory: 'Electric Guitars' },
    'acoustic_guitars.json': { category: 'String Instruments', subcategory: 'Acoustic Guitars' },
    'classical_guitars.json': { category: 'String Instruments', subcategory: 'Classical & Nylon String Guitars' },
    'bass_guitars.json': { category: 'String Instruments', subcategory: 'Bass Guitars' },
    'orchestral_strings.json': { category: 'String Instruments', subcategory: 'Orchestral Strings' },
    'fretted_strings.json': { category: 'String Instruments', subcategory: 'Fretted Strings' },

    // Keyboard Instruments
    'acoustic_pianos.json': { category: 'Keyboard Instruments', subcategory: 'Acoustic Pianos' },
    'digital_pianos.json': { category: 'Keyboard Instruments', subcategory: 'Digital Pianos' },
    'synthesizers.json': { category: 'Keyboard Instruments', subcategory: 'Synthesizers' },
    'organs.json': { category: 'Keyboard Instruments', subcategory: 'Organs' },
    'workstations_arrangers.json': { category: 'Keyboard Instruments', subcategory: 'Workstations & Arrangers' },

    // Percussion Instruments
    'drum_kits.json': { category: 'Percussion Instruments', subcategory: 'Drum Kits' },
    'snare_drums.json': { category: 'Percussion Instruments', subcategory: 'Snare Drums' },
    'cymbals.json': { category: 'Percussion Instruments', subcategory: 'Cymbals' },
    'hand_percussion.json': { category: 'Percussion Instruments', subcategory: 'Hand Percussion' },
    'tuned_percussion.json': { category: 'Percussion Instruments', subcategory: 'Tuned Percussion' },
    'marching_percussion.json': { category: 'Percussion Instruments', subcategory: 'Marching Percussion' },
    'orchestral_percussion.json': { category: 'Percussion Instruments', subcategory: 'Orchestral Percussion' },
    'electronic_percussion.json': { category: 'Percussion Instruments', subcategory: 'Electronic Percussion' },

    // Wind Instruments
    'woodwinds.json': { category: 'Wind Instruments', subcategory: 'Woodwinds' },
    'brass.json': { category: 'Wind Instruments', subcategory: 'Brass' },
    'woodwind_brands.json': { category: 'Wind Instruments', subcategory: 'Popular Woodwind Brands' },

    // Electronic Instruments
    'midi_keyboards.json': { category: 'Electronic Instruments', subcategory: 'MIDI Keyboards' },
    'sound_modules.json': { category: 'Electronic Instruments', subcategory: 'Sound Modules' },
    'samplers.json': { category: 'Electronic Instruments', subcategory: 'Samplers' },
    'drum_machines.json': { category: 'Electronic Instruments', subcategory: 'Drum Machines' },

    // Folk & World Instruments
    'folk_string.json': { category: 'Folk & World Instruments', subcategory: 'String Instruments' },
    'folk_wind.json': { category: 'Folk & World Instruments', subcategory: 'Wind Instruments' },
    'folk_percussion.json': { category: 'Folk & World Instruments', subcategory: 'Percussion Instruments' },

    // Orchestral Instruments
    'orchestral_strings_inst.json': { category: 'Orchestral Instruments', subcategory: 'Strings' },
    'orchestral_woodwinds.json': { category: 'Orchestral Instruments', subcategory: 'Woodwinds' },
    'orchestral_brass.json': { category: 'Orchestral Instruments', subcategory: 'Brass' },
    'orchestral_keyboards.json': { category: 'Orchestral Instruments', subcategory: 'Keyboards' },

    // Accessories
    'guitar_accessories.json': { category: 'Accessories', subcategory: 'Guitar Accessories' },
    'drum_accessories.json': { category: 'Accessories', subcategory: 'Drum Accessories' },
    'keyboard_accessories.json': { category: 'Accessories', subcategory: 'Keyboard Accessories' },
    'wind_accessories.json': { category: 'Accessories', subcategory: 'Wind Instrument Accessories' },
};

/**
 * Extract brand and model from instrument name
 */
function parseInstrumentName(fullName) {
    const knownBrands = [
        'Paul Reed Smith', 'Steinway & Sons', 'Bosendorfer', 'Roland', 'Yamaha',
        'Fender', 'Gibson', 'Rickenbacker', 'Gretsch', 'Epiphone', 'Squier',
        'Ibanez', 'Jackson', 'Charvel', 'B.C. Rich', 'Dean', 'Hamer', 'Kramer',
        'Carvin', 'Music Man', 'Peavey', 'ESP', 'Schecter', 'Warwick', 'Spector',
        'Hofner', 'Alembic', 'Ken Smith', 'Tobias', 'Pedulla', 'Rob Allen',
        'Moog', 'Sequential', 'Arturia', 'Elektron', 'Korg', 'Kurzweil',
        'Access', 'Novation', 'DSI', 'E-mu', 'Oberheim', 'ARP', 'Buchla',
        'Doepfer', 'Intellijel', 'Mutable Instruments', 'Make Noise', 'Verbos',
        'Erica Synths', 'DW', 'Ludwig', 'Pearl', 'Tama', 'Sonor', 'Gretsch',
        'Rogers', 'Slingerland', 'Mapex', 'PDP', 'SJC', 'Craviotto', 'Noble & Cooley',
        'Zildjian', 'Sabian', 'Meinl', 'Paiste', 'UFIP', 'Bosphorus', 'Istanbul',
        'Dream', 'Stagg', 'Wuhan', 'Buffet Crampon', 'Yanagisawa', 'Selmer',
        'Trevor James', 'Cannonball', 'Leblanc', 'Gemeinhardt', 'Taylor',
        'Martin', 'Boss', 'Line 6', 'Positive Grid', 'Neural DSP', 'Strymon',
        'Eventide', 'TC Electronic', 'MXR', 'Electro-Harmonix', 'Zoom',
        'Akai', 'Native Instruments', 'Behringer', 'Alesis', 'M-Audio',
        'Mackie', 'PreSonus', 'Focusrite', 'RME', 'MOTU', 'Apogee',
        'Antelope Audio', 'RME', 'Merging Technologies', 'Prism Sound',
        'Fairchild', 'Manley', 'Pultec', 'Neve', 'API', 'SSL',
        'Shure', 'Neumann', 'AKG', 'Sennheiser', 'Beyerdynamic', 'Audio-Technica',
        'Rode', 'Blue', 'sE Electronics', 'Lauten Audio', 'Mojave',
        'Coles', 'Royer', 'AEA', 'DPA', 'Schoeps', 'Earthworks',
        'JBL', 'KRK', 'Genelec', 'Focal', 'Dynaudio', 'PMC',
        'ATC', 'Adam Audio', 'Event', 'Mackie', 'Behringer', 'Alesis',
        'Native Instruments', 'Waves', 'iZotope', 'FabFilter', 'Soundtoys',
        'Valhalla', 'Softube', 'Slate Digital', 'UAD', 'Plugin Alliance',
        'EastWest', 'Spitfire Audio', 'VSL', 'Cinesamples', '8Dio',
        'Toontrack', 'XLN Audio', 'Reason Studios', 'Bitwig', 'Image-Line',
        'Ableton', 'Steinberg', 'Avid', 'Presonus', 'Cakewalk',
        'Celemony', 'Melodyne', 'Antares', 'Auto-Tune', 'Waves'
    ];

    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
        return { brand: 'Unknown', model: fullName, name: fullName };
    }

    let brand = 'Unknown';
    let model = fullName;
    let name = fullName;

    for (const knownBrand of knownBrands) {
        const brandWords = knownBrand.split(/\s+/);
        if (parts.length >= brandWords.length) {
            const potentialBrand = parts.slice(0, brandWords.length).join(' ');
            if (potentialBrand.toLowerCase() === knownBrand.toLowerCase()) {
                brand = knownBrand;
                model = parts.slice(brandWords.length).join(' ').trim();
                name = model || knownBrand;
                break;
            }
        }
    }

    if (brand === 'Unknown') {
        brand = parts[0];
        model = parts.slice(1).join(' ').trim();
        name = model || fullName;
    }

    return { brand, model, name };
}

/**
 * Generate search tokens
 */
function generateSearchTokens(brand, model, name, category, subcategory, type, series, size) {
    const tokens = new Set();

    [brand, model, name, category, subcategory, type, series, size].forEach(term => {
        if (term) {
            term.split(/\s+/).forEach(word => {
                const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (clean.length > 1) {
                    tokens.add(clean);
                }
            });
            const full = term.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            if (full.length > 1) {
                tokens.add(full);
            }
        }
    });

    return Array.from(tokens);
}

/**
 * Process JSON file and extract instruments
 */
function extractInstrumentsFromFile(data, categoryInfo) {
    const items = [];
    const category = categoryInfo.category;
    const subcategory = categoryInfo.subcategory;

    function extractItems(obj, currentCategory, currentSubcategory, currentSeries = null, currentType = null) {
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                if (typeof item === 'string') {
                    if (item.includes('"') || /^\d+(\.\d+)?$/.test(item)) {
                        return;
                    }

                    const { brand, model, name } = parseInstrumentName(item);
                    const searchTokens = generateSearchTokens(
                        brand, model, name, currentCategory, currentSubcategory,
                        currentType, currentSeries, null
                    );

                    items.push({
                        brand,
                        model,
                        name,
                        category: currentCategory,
                        subcategory: currentSubcategory,
                        type: currentType,
                        series: currentSeries,
                        size: null,
                        search_tokens: searchTokens,
                        verified: true,
                        verified_at: new Date().toISOString()
                    });
                }
            });
        } else if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
                if (currentSubcategory === 'Cymbals' || currentSubcategory === 'Acoustic Pianos' ||
                    currentSubcategory === 'Digital Pianos' || currentSubcategory === 'Synthesizers') {
                    if (Array.isArray(value)) {
                        if (value.length > 0 && typeof value[0] === 'string') {
                            if (value[0].includes('"') || /^\d+(\.\d+)?$/.test(value[0])) {
                                return;
                            }
                        }
                        extractItems(value, currentCategory, currentSubcategory, currentSeries, key);
                    } else if (typeof value === 'object' && !Array.isArray(value)) {
                        extractItems(value, currentCategory, currentSubcategory, key, currentType);
                    }
                } else {
                    if (Array.isArray(value)) {
                        const subcat = currentSubcategory || key;
                        extractItems(value, currentCategory, subcat, currentSeries, currentType);
                    } else if (typeof value === 'object') {
                        if (currentSubcategory === 'Cymbals') {
                            extractItems(value, currentCategory, currentSubcategory, key, currentType);
                        } else {
                            extractItems(value, currentCategory, currentSubcategory, key, currentType);
                        }
                    }
                }
            });
        }
    }

    Object.entries(data).forEach(([topLevelKey, topLevelValue]) => {
        extractItems(topLevelValue, category, subcategory);
    });

    return items;
}

/**
 * Main import function
 */
async function importInstrumentsDatabase() {
    const client = new Client({ connectionString: DATABASE_URL });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');
        console.log('Starting instrument database import...\n');

        // Find JSON files directory
        const possiblePaths = [
            path.join(process.cwd(), '..'),
            path.join(__dirname, '..', '..'),
            path.join(__dirname, '..', '..', '..', 'Amalia Media LLC', 'Webapp'),
            process.cwd(),
        ];

        let jsonDir = null;
        for (const possiblePath of possiblePaths) {
            const testFile = path.join(possiblePath, 'electric_guitars.json');
            if (fs.existsSync(testFile)) {
                jsonDir = possiblePath;
                console.log(`Found JSON files in: ${jsonDir}\n`);
                break;
            }
        }

        if (!jsonDir) {
            console.error('Could not find JSON files. Please ensure they are in the parent directory.');
            process.exit(1);
        }

        let totalProcessed = 0;
        let totalInserted = 0;
        let totalSkipped = 0;

        for (const [filename, categoryInfo] of Object.entries(CATEGORY_MAP)) {
            const filePath = path.join(jsonDir, filename);

            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  File not found: ${filename}, skipping...`);
                continue;
            }

            console.log(`\nProcessing ${filename}...`);

            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            const items = extractInstrumentsFromFile(data, categoryInfo);

            console.log(`  Extracted ${items.length} items`);

            let insertedCount = 0;
            let errorCount = 0;

            const BATCH_SIZE = 100;
            for (let i = 0; i < items.length; i += BATCH_SIZE) {
                const batch = items.slice(i, i + BATCH_SIZE);

                for (const item of batch) {
                    try {
                        const result = await client.query(
                            `INSERT INTO instrument_database
                             (name, brand, model, category, subcategory, type, series, size,
                              search_tokens, verified, verified_at)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                             ON CONFLICT (name, brand, category)
                             DO UPDATE SET
                                 model = EXCLUDED.model,
                                 type = EXCLUDED.type,
                                 series = EXCLUDED.series,
                                 size = EXCLUDED.size,
                                 search_tokens = EXCLUDED.search_tokens
                             RETURNING id`,
                            [
                                item.name,
                                item.brand,
                                item.model,
                                item.category,
                                item.subcategory,
                                item.type,
                                item.series,
                                item.size,
                                item.search_tokens,
                                item.verified,
                                item.verified_at
                            ]
                        );

                        if (result.rows.length > 0) {
                            insertedCount++;
                        }
                    } catch (err) {
                        errorCount++;
                    }
                }
            }

            console.log(`  Inserted: ${insertedCount}, Skipped: ${errorCount}`);
            totalProcessed += items.length;
            totalInserted += insertedCount;
            totalSkipped += errorCount;
        }

        console.log(`\n\n=== Import Complete ===`);
        console.log(`Total items processed: ${totalProcessed}`);
        console.log(`Total items inserted: ${totalInserted}`);
        console.log(`Total items skipped: ${totalSkipped}`);

        // Get final count
        const result = await client.query(
            "SELECT COUNT(*) as count FROM instrument_database"
        );
        console.log(`\nTotal instruments in database: ${result.rows[0].count}`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

importInstrumentsDatabase();

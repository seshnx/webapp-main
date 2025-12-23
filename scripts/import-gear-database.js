/**
 * Import Gear Database from JSON files to Supabase
 * 
 * This script reads the JSON files containing gear data and imports them
 * into the Supabase equipment_database table.
 * 
 * Usage: node scripts/import-gear-database.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map JSON file names to categories
// Note: software_audio.json is excluded - will have separate Software Database
const CATEGORY_MAP = {
    // 'software_audio.json': 'Software', // Excluded - separate database
    'mixers_and_consoles.json': 'Mixers & Consoles',
    'microphones_and_transducers.json': 'Microphones & Transducers',
    'outboard_gear.json': 'Outboard Gear',
    'audio_interfaces.json': 'Audio Interfaces',
    'headphones.json': 'Headphones',
    'studio_monitors.json': 'Studio Monitors',
    'recording_devices.json': 'Recording Devices'
};

/**
 * Extract brand and model from equipment name
 */
function parseEquipmentName(fullName) {
    // Comprehensive list of known brands (including multi-word brands)
    // Order matters - check longer names first
    const knownBrands = [
        // Multi-word brands (check these first)
        'Universal Audio', 'Audio-Technica', 'Allen & Heath', 'Empirical Labs',
        'Native Instruments', 'Tube-Tech', 'Adam Audio', 'Solid State Logic',
        'Rupert Neve Designs', 'Plugin Alliance', 'Brainworx', 'Shadow Hills',
        'Golden Age Project', 'Warm Audio', 'Chandler Limited', 'A-Designs',
        'Black Rooster Audio', 'Acustica Audio', 'LiquidSonics', 'Exponential Audio',
        'Tokyo Dawn Records', 'Klanghelm', 'Cytomic', 'Pulsar', 'Kush Audio',
        'Newfangled Audio', 'McDSP', 'IK Multimedia', 'Arturia', 'Spectrasonics',
        'Toontrack', 'XLN Audio', 'EastWest', 'Spitfire Audio', 'VSL',
        'Audio Imperia', 'Cinesamples', 'Neural DSP', 'Line 6', 'Positive Grid',
        'Softube', 'Slate Digital', 'Eventide', 'Lexicon', 'Bricasti',
        'TC Electronic', 'Strymon', 'Electro-Harmonix', 'MXR', 'Boss',
        'Zoom', 'Tascam', 'Roland', 'Yamaha', 'Korg', 'Alesis', 'Behringer',
        'Mackie', 'Soundcraft', 'Midas', 'DiGiCo', 'Lawo', 'Calrec', 'Wheatstone',
        'PreSonus', 'Focusrite', 'Apogee', 'RME', 'MOTU', 'Antelope Audio',
        'Ferrofish', 'Merging Technologies', 'Metric Halo', 'Prism Sound',
        'Lynx Studio Technology', 'Grace Design', 'Millennia', 'Avalon',
        'Great River', 'Pendulum Audio', 'True Systems', 'BAE', 'Avedis',
        'Phoenix Audio', 'Vintech Audio', 'FMR Audio', 'Heritage Audio',
        'Undertone Audio', 'Lindell Audio', 'Elysia', 'SPL', 'Buzz Audio',
        'Tonelux', 'Hendyamps', 'Overstayer', 'Drawmer', 'dbx', 'Empirical Labs',
        'Manley', 'Fairchild', 'Purple Audio', 'Retro Instruments', 'Focusrite Red',
        'Maag Audio', 'Tegeler Audio', 'Undertone Audio', 'A-Designs', 'Avedis',
        'Sonnox', 'DMG Audio', 'Weiss', 'PSP', 'Elephant', 'Newfangled Audio',
        'Pulsar', 'Brainworx', 'IK Multimedia', 'Stealth Limiter', 'McDSP',
        'Sony', 'Telefunken', 'Warm Audio', 'Aston', 'sE Electronics',
        'Lauten Audio', 'Miktek', 'Roswell Audio', 'Blue', 'Mojave Audio',
        'Vanguard Audio Labs', 'Peluso', 'Chandler Limited', 'Lewitt',
        'Shure', 'Neumann', 'AKG', 'Sennheiser', 'Beyerdynamic', 'Electro-Voice',
        'Audix', 'Heil Sound', 'Rode', 'Samson', 'Oktava', 'DPA', 'Schoeps',
        'Earthworks', 'Gefell', 'Line Audio', 'Monheim', 'Cathedral Pipes',
        'Josephson', 'Bock Audio', 'Lawson', 'Michael Joly Engineering',
        'Groove Tubes', 'Royer', 'AEA', 'RCA', 'Coles', 'Cloud Microphones',
        'Cascade', 'SE Electronics', 'Golden Age Project', 'Samar Audio',
        'Mesanovic', 'Stager', 'MXL', 'Avantone', 'Neat Microphones',
        'Maono', 'HyperX', 'Logitech', 'Elgato', 'RODE X', 'Movo', 'Razer',
        'Fifine', 'Deity', 'Countryman', 'Tram', 'Point Source Audio',
        'KRK', 'Genelec', 'JBL', 'Focal', 'Dynaudio', 'PMC', 'ATC',
        'PreSonus', 'M-Audio', 'Behringer', 'IK Multimedia', 'Steinberg',
        'Alesis', 'Samson', 'Fluid Audio', 'Mackie', 'Tannoy', 'Event',
        'Neumann', 'Amphion', 'Quested', 'Barefoot Sound', 'Audioengine',
        'Blue Sky', 'Avantone', 'Equator Audio', 'Unity Audio', 'Ocean Way Audio',
        'HEDD Audio', 'PSI Audio', 'Schiit', 'Topping', 'FiiO', 'Pro-Ject',
        'Woo Audio', 'Aviom', 'KLANG', 'ART', 'Rane', 'Radial Engineering',
        'Sound Devices', 'Aaton', 'Zaxcom', 'Nagra', 'JoeCo', 'Edirol',
        'Marantz', 'Olympus', 'Fostex', 'Denon', 'Alesis', 'Korg', 'Boss',
        'Steinberg', 'Apple', 'Ableton', 'Avid', 'Image-Line', 'Bitwig',
        'Cockos', 'Reason Studios', 'Harrison', 'Universal Audio'
    ];
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
        return { brand: 'Unknown', model: fullName, name: fullName };
    }
    
    let brand = 'Unknown';
    let model = fullName;
    let name = fullName;
    
    // Try to match known brands (check longer names first)
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
    
    // If no brand matched, try common patterns
    if (brand === 'Unknown') {
        // Check if first word is a common single-word brand
        const singleWordBrands = knownBrands.filter(b => !b.includes(' ') && !b.includes('-') && !b.includes('&'));
        if (singleWordBrands.includes(parts[0])) {
            brand = parts[0];
            model = parts.slice(1).join(' ').trim();
            name = model;
        } else {
            // Fallback: assume first word is brand (but this is less reliable)
            brand = parts[0];
            model = parts.slice(1).join(' ').trim();
            name = model;
        }
    }
    
    // Clean up model/name
    if (!model || model.length === 0) {
        model = fullName;
        name = fullName;
    }
    
    return { brand, model, name };
}

/**
 * Generate search tokens from equipment data
 */
function generateSearchTokens(brand, model, name, category, subcategory) {
    const tokens = new Set();
    
    // Add all parts
    [brand, model, name, category, subcategory].forEach(term => {
        if (term) {
            // Split by spaces and add each word
            term.split(/\s+/).forEach(word => {
                const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (clean.length > 1) {
                    tokens.add(clean);
                }
            });
            // Add full term
            const full = term.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            if (full.length > 1) {
                tokens.add(full);
            }
        }
    });
    
    return Array.from(tokens);
}

/**
 * Process a single JSON file
 */
async function processFile(filePath, category) {
    console.log(`\nProcessing ${path.basename(filePath)}...`);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const items = [];
    let processed = 0;
    let skipped = 0;
    
    // Iterate through the JSON structure
    function extractItems(obj, currentCategory, currentSubcategory = null) {
        if (Array.isArray(obj)) {
            // Array of items
            obj.forEach(item => {
                if (typeof item === 'string') {
                    // Simple string item
                    const { brand, model, name } = parseEquipmentName(item);
                    const searchTokens = generateSearchTokens(brand, model, name, currentCategory, currentSubcategory);
                    
                    items.push({
                        brand,
                        model,
                        name,
                        category: currentCategory,
                        subcategory: currentSubcategory,
                        search_tokens: searchTokens,
                        verified: true,
                        verified_at: new Date().toISOString()
                    });
                    processed++;
                } else if (typeof item === 'object' && item !== null) {
                    // Object item
                    const itemName = item.name || item.model || item.title || Object.values(item)[0];
                    if (itemName) {
                        const { brand, model, name } = parseEquipmentName(itemName);
                        const searchTokens = generateSearchTokens(brand, model, name, currentCategory, currentSubcategory);
                        
                        items.push({
                            brand,
                            model,
                            name,
                            category: currentCategory,
                            subcategory: currentSubcategory,
                            description: item.description || null,
                            specifications: item.specifications || item.specs || {},
                            search_tokens: searchTokens,
                            verified: true,
                            verified_at: new Date().toISOString()
                        });
                        processed++;
                    }
                }
            });
        } else if (typeof obj === 'object' && obj !== null) {
            // Object with nested structure
            Object.entries(obj).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    // Key is subcategory, value is array of items
                    extractItems(value, currentCategory, key);
                } else if (typeof value === 'object') {
                    // Nested object - recurse
                    extractItems(value, currentCategory, key);
                }
            });
        }
    }
    
    // Start extraction
    Object.entries(data).forEach(([topLevelKey, topLevelValue]) => {
        extractItems(topLevelValue, category);
    });
    
    console.log(`  Extracted ${processed} items from ${path.basename(filePath)}`);
    
    // Insert in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        
        // Insert items using a simpler approach: check and insert/update
        let insertedCount = 0;
        let errorCount = 0;
        
        for (const item of batch) {
            try {
                // Try to insert - if duplicate, update instead
                const { error: insertError } = await supabase
                    .from('equipment_database')
                    .insert(item);
                
                if (insertError) {
                    // If duplicate, try to update
                    if (insertError.code === '23505' || insertError.message.includes('duplicate key')) {
                        // Find existing item
                        const { data: existing } = await supabase
                            .from('equipment_database')
                            .select('id')
                            .eq('brand', item.brand)
                            .eq('model', item.model)
                            .eq('category', item.category)
                            .maybeSingle();
                        
                        if (existing) {
                            // Update existing
                            const { error: updateError } = await supabase
                                .from('equipment_database')
                                .update(item)
                                .eq('id', existing.id);
                            
                            if (updateError) {
                                errorCount++;
                            } else {
                                insertedCount++;
                            }
                        } else {
                            // Duplicate but can't find it - might be old constraint issue
                            errorCount++;
                        }
                    } else {
                        console.error(`  Error inserting ${item.brand} ${item.model}:`, insertError.message);
                        errorCount++;
                    }
                } else {
                    insertedCount++;
                }
            } catch (err) {
                console.error(`  Error processing ${item.brand} ${item.model}:`, err.message);
                errorCount++;
            }
        }
        
        if (insertedCount > 0 || errorCount > 0) {
            console.log(`  Processed ${insertedCount} items in batch ${Math.floor(i / BATCH_SIZE) + 1} (${errorCount} errors)`);
        }
        skipped += errorCount;
    }
    
    return { processed, skipped };
}

/**
 * Main import function
 */
async function importGearDatabase() {
    console.log('Starting gear database import...\n');
    
    // Try multiple possible locations for JSON files
    const possiblePaths = [
        path.join(process.cwd(), '..'), // One level up from webapp-main (most likely)
        path.join(__dirname, '..', '..'), // From scripts/ directory, two levels up
        path.join(__dirname, '..', '..', '..', 'Amalia Media LLC', 'Webapp'), // Alternative
        process.cwd(), // Current directory as fallback
    ];
    
    let jsonDir = null;
    for (const possiblePath of possiblePaths) {
        // Check if any of the JSON files exist in this directory
        const testFile = path.join(possiblePath, 'software_audio.json');
        if (fs.existsSync(testFile)) {
            jsonDir = possiblePath;
            console.log(`Found JSON files in: ${jsonDir}`);
            break;
        }
    }
    
    if (!jsonDir) {
        console.error('\nCould not find JSON files. Searched in:');
        possiblePaths.forEach(p => console.error(`  - ${p}`));
        console.error('\nPlease ensure the JSON files are in the same directory as webapp-main,');
        console.error('or modify the path in scripts/import-gear-database.js');
        process.exit(1);
    }
    
    if (!fs.existsSync(jsonDir)) {
        console.error(`Directory not found: ${jsonDir}`);
        console.log('Please ensure the JSON files are in the correct location.');
        process.exit(1);
    }
    
    let totalProcessed = 0;
    let totalSkipped = 0;
    
    for (const [filename, category] of Object.entries(CATEGORY_MAP)) {
        const filePath = path.join(jsonDir, filename);
        
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filename}, skipping...`);
            continue;
        }
        
        try {
            const { processed, skipped } = await processFile(filePath, category);
            totalProcessed += processed;
            totalSkipped += skipped;
        } catch (err) {
            console.error(`Error processing ${filename}:`, err.message);
            totalSkipped += 1;
        }
    }
    
    console.log(`\n\nImport complete!`);
    console.log(`Total items processed: ${totalProcessed}`);
    console.log(`Total items skipped: ${totalSkipped}`);
    
    // Get final count
    const { count } = await supabase
        .from('equipment_database')
        .select('*', { count: 'exact', head: true });
    
    console.log(`Total items in database: ${count}`);
}

// Run the import
importGearDatabase().catch(console.error);


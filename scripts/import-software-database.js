/**
 * Import Software Database from JSON files to Supabase
 * 
 * This script reads the software_audio.json file and imports it
 * into the Supabase software_database table.
 * 
 * Usage: node scripts/import-software-database.js
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

/**
 * Extract brand (developer) and model (software name) from software name
 */
function parseSoftwareName(fullName) {
    // Comprehensive list of known software developers/publishers
    const knownDevelopers = [
        // Multi-word developers (check these first)
        'Universal Audio', 'Native Instruments', 'Image-Line', 'Reason Studios',
        'Harrison Mixbus', 'Steinberg', 'PreSonus', 'Cockos', 'MOTU',
        'Solid State Logic', 'Plugin Alliance', 'Brainworx', 'Shadow Hills',
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
        'Focusrite', 'Apogee', 'RME', 'Antelope Audio', 'Ferrofish',
        'Merging Technologies', 'Metric Halo', 'Prism Sound', 'Lynx Studio Technology',
        'Grace Design', 'Millennia', 'Avalon', 'Great River', 'Pendulum Audio',
        'True Systems', 'BAE', 'Avedis', 'Phoenix Audio', 'Vintech Audio',
        'FMR Audio', 'Heritage Audio', 'Undertone Audio', 'Lindell Audio',
        'Elysia', 'SPL', 'Buzz Audio', 'Tonelux', 'Hendyamps', 'Overstayer',
        'Drawmer', 'dbx', 'Manley', 'Fairchild', 'Purple Audio', 'Retro Instruments',
        'Focusrite Red', 'Maag Audio', 'Tegeler Audio', 'A-Designs', 'Avedis',
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
        'Apple', 'Ableton', 'Avid', 'Image-Line', 'Bitwig', 'Cockos',
        'Reason Studios', 'Harrison', 'Universal Audio',
        // Software-specific developers
        'FabFilter', 'Soundtoys', 'iZotope', 'Waves', 'UAD', 'Valhalla DSP',
        'Relab', 'Exponential Audio', 'LiquidSonics', 'Dear Reality',
        'Sound Particles', 'Flux', 'Audio Movers', 'Antares', 'Celemony',
        'Synchro Arts', 'Zynaptiq', 'Cedar', 'NUGEN Audio', 'HoRNet',
        'Voxengo', 'Blue Cat', 'DDMF', 'TopSoundLabs', 'Audiomovers',
        'Source Elements', 'Rogue Amoeba', 'VB-Audio', 'Xfer', 'u-he',
        'Kilohearts', 'LennarDigital', 'Modartt', 'Gospel Musicians',
        'Steven Slate Drums', 'GetGood Drums', 'Ample Sound', 'Shreddage',
        'Neural DSP', 'Line 6', 'Positive Grid', 'IK Multimedia',
        // Additional software developers
        'Madrona Labs', 'Mutable Instruments', 'Mutable', 'Madrona',
        'TAL Software', 'TAL', 'UVI', 'SampleTank',
        'MakeMusic', 'BandLab', 'Notion',
        'Serato', 'Pioneer', 'Atomix', 'Mixvibes', 'Algoriddim',
        'Blackmagic', 'DaVinci', 'Adobe',
        'Magix', 'FFmpeg', 'SoX',
        'dBpoweramp', 'XLD', 'Max', 'Switch', 'MP3Tag',
        'MusicBrainz', 'TagScanner', 'Kid3', 'Audio Hijack',
        'Loopback', 'Soundflower', 'BlackHole'
    ];
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
        return { brand: 'Unknown', model: fullName, name: fullName };
    }
    
    let brand = 'Unknown';
    let model = fullName;
    let name = fullName;
    
    // Sort knownDevelopers by length (longest first) to match longer names first
    // This ensures "Native Instruments" matches before "Native"
    const sortedDevelopers = [...knownDevelopers].sort((a, b) => {
        const aWords = a.split(/\s+/).length;
        const bWords = b.split(/\s+/).length;
        if (aWords !== bWords) {
            return bWords - aWords; // Longer first
        }
        return a.localeCompare(b); // Alphabetical for same length
    });
    
    // Try to match known developers (check longer names first)
    for (const knownDeveloper of sortedDevelopers) {
        const developerWords = knownDeveloper.split(/\s+/);
        if (parts.length >= developerWords.length) {
            const potentialDeveloper = parts.slice(0, developerWords.length).join(' ');
            if (potentialDeveloper.toLowerCase() === knownDeveloper.toLowerCase()) {
                brand = knownDeveloper;
                model = parts.slice(developerWords.length).join(' ').trim();
                name = model || knownDeveloper;
                break;
            }
        }
    }
    
    // If no developer matched, try common patterns
    if (brand === 'Unknown') {
        const singleWordDevelopers = knownDevelopers.filter(d => !d.includes(' ') && !d.includes('-') && !d.includes('&'));
        if (singleWordDevelopers.includes(parts[0])) {
            brand = parts[0];
            model = parts.slice(1).join(' ').trim();
            name = model;
        } else {
            // Fallback: assume first word is developer
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
 * Generate search tokens from software data
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
                    const { brand, model, name } = parseSoftwareName(item);
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
                        const { brand, model, name } = parseSoftwareName(itemName);
                        const searchTokens = generateSearchTokens(brand, model, name, currentCategory, currentSubcategory);
                        
                        items.push({
                            brand,
                            model,
                            name,
                            category: currentCategory,
                            subcategory: currentSubcategory,
                            description: item.description || null,
                            specifications: item.specifications || item.specs || {},
                            website_url: item.website || item.url || null,
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
    
    // Start extraction - iterate through top-level categories
    Object.entries(data).forEach(([topLevelKey, topLevelValue]) => {
        // Use provided category or top-level key
        const mainCategory = category || topLevelKey;
        
        if (typeof topLevelValue === 'object') {
            Object.entries(topLevelValue).forEach(([subcategoryKey, subcategoryValue]) => {
                if (Array.isArray(subcategoryValue)) {
                    // Direct array under subcategory
                    extractItems(subcategoryValue, mainCategory, subcategoryKey);
                } else if (typeof subcategoryValue === 'object') {
                    // Nested structure
                    extractItems(subcategoryValue, mainCategory, subcategoryKey);
                }
            });
        }
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
                    .from('software_database')
                    .insert(item);
                
                if (insertError) {
                    // If duplicate, try to update
                    if (insertError.code === '23505' || insertError.message.includes('duplicate key')) {
                        // Find existing item
                        const { data: existing } = await supabase
                            .from('software_database')
                            .select('id')
                            .eq('brand', item.brand)
                            .eq('model', item.model)
                            .eq('category', item.category)
                            .maybeSingle();
                        
                        if (existing) {
                            // Update existing
                            const { error: updateError } = await supabase
                                .from('software_database')
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
async function importSoftwareDatabase() {
    console.log('Starting software database import...\n');
    
    // Map JSON file names to categories
    const CATEGORY_MAP = {
        'daws.json': 'DAWs',
        'plugins_effects.json': 'Audio Effects Plugins',
        'plugins_instruments.json': 'Virtual Instruments',
        'plugins_mastering.json': 'Mastering Tools',
        'plugins_restoration.json': 'Audio Restoration',
        'sample_libraries.json': 'Sample Libraries',
        'notation.json': 'Music Notation',
        'live_performance.json': 'Live Performance',
        'audio_analysis.json': 'Audio Analysis',
        'midi_tools.json': 'MIDI Tools',
        'video_audio.json': 'Video Audio',
        'utilities.json': 'Audio Utilities'
    };
    
    // Try multiple possible locations for JSON files
    const possiblePaths = [
        path.join(process.cwd(), 'data', 'software'), // data/software/ directory in project
        path.join(process.cwd(), '..', 'Amalia Media LLC', 'Webapp', 'data', 'software'), // Alternative location
        path.join(process.cwd(), '..'), // One level up from webapp-main
        path.join(__dirname, '..', '..'), // From scripts/ directory, two levels up
        process.cwd(), // Current directory as fallback
    ];
    
    let jsonDir = null;
    for (const possiblePath of possiblePaths) {
        // Check if any software JSON file exists in this directory
        const testFile = path.join(possiblePath, 'daws.json');
        if (fs.existsSync(testFile)) {
            jsonDir = possiblePath;
            console.log(`Found JSON files in: ${jsonDir}`);
            break;
        }
    }
    
    if (!jsonDir) {
        console.error('\nCould not find software JSON files. Searched in:');
        possiblePaths.forEach(p => console.error(`  - ${p}`));
        console.error('\nPlease ensure JSON files are in data/software/ directory,');
        console.error('or modify the path in scripts/import-software-database.js');
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
        .from('software_database')
        .select('*', { count: 'exact', head: true });
    
    console.log(`Total items in database: ${count}`);
}

// Run the import
importSoftwareDatabase().catch(console.error);


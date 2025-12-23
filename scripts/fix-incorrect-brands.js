/**
 * Fix Incorrect Brand Parsing in Equipment Database
 * 
 * This script identifies and fixes equipment entries where multi-word brands
 * were incorrectly split (e.g., "Allen & Heath" became brand: "Allen", model: "& Heath SQ-7")
 * 
 * Usage: node scripts/fix-incorrect-brands.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

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

// Same brand parsing function from import script
function parseEquipmentName(fullName) {
    const knownBrands = [
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
        'Tonelux', 'Hendyamps', 'Overstayer', 'Drawmer', 'dbx',
        'Manley', 'Fairchild', 'Purple Audio', 'Retro Instruments', 'Focusrite Red',
        'Maag Audio', 'Tegeler Audio', 'A-Designs', 'Avedis',
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
        const singleWordBrands = knownBrands.filter(b => !b.includes(' ') && !b.includes('-') && !b.includes('&'));
        if (singleWordBrands.includes(parts[0])) {
            brand = parts[0];
            model = parts.slice(1).join(' ').trim();
            name = model;
        } else {
            brand = parts[0];
            model = parts.slice(1).join(' ').trim();
            name = model;
        }
    }
    
    if (!model || model.length === 0) {
        model = fullName;
        name = fullName;
    }
    
    return { brand, model, name };
}

function generateSearchTokens(brand, model, name, category, subcategory) {
    const tokens = new Set();
    
    [brand, model, name, category, subcategory].forEach(term => {
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

async function fixIncorrectBrands() {
    console.log('Starting brand fix process...\n');
    
    // Find entries that likely have incorrect brand parsing
    // Look for models that start with "&", "-", or contain brand-like words
    const { data: suspiciousEntries, error: fetchError } = await supabase
        .from('equipment_database')
        .select('*')
        .or('model.ilike.%&%,model.ilike.%-%,brand.ilike.%&%')
        .limit(1000);
    
    if (fetchError) {
        console.error('Error fetching entries:', fetchError);
        return;
    }
    
    if (!suspiciousEntries || suspiciousEntries.length === 0) {
        console.log('No suspicious entries found. Database looks good!');
        return;
    }
    
    console.log(`Found ${suspiciousEntries.length} potentially incorrect entries\n`);
    
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const entry of suspiciousEntries) {
        // Reconstruct full name
        const fullName = `${entry.brand} ${entry.model}`.trim();
        
        // Re-parse with improved function
        const { brand: newBrand, model: newModel, name: newName } = parseEquipmentName(fullName);
        
        // Check if parsing changed
        if (newBrand !== entry.brand || newModel !== entry.model) {
            // Generate new search tokens
            const searchTokens = generateSearchTokens(
                newBrand, 
                newModel, 
                newName, 
                entry.category, 
                entry.subcategory
            );
            
            // Update the entry
            const { error: updateError } = await supabase
                .from('equipment_database')
                .update({
                    brand: newBrand,
                    model: newModel,
                    name: newName,
                    search_tokens: searchTokens
                })
                .eq('id', entry.id);
            
            if (updateError) {
                // If update fails due to duplicate, delete old and insert new
                if (updateError.code === '23505' || updateError.message.includes('duplicate key')) {
                    // Check if correct entry already exists
                    const { data: existing } = await supabase
                        .from('equipment_database')
                        .select('id')
                        .eq('brand', newBrand)
                        .eq('model', newModel)
                        .eq('category', entry.category)
                        .maybeSingle();
                    
                    if (existing) {
                        // Correct entry exists, delete the incorrect one
                        await supabase
                            .from('equipment_database')
                            .delete()
                            .eq('id', entry.id);
                        console.log(`  Fixed: Deleted duplicate "${entry.brand} ${entry.model}" (correct entry exists)`);
                        fixed++;
                    } else {
                        // Delete old and insert new
                        await supabase
                            .from('equipment_database')
                            .delete()
                            .eq('id', entry.id);
                        
                        const { error: insertError } = await supabase
                            .from('equipment_database')
                            .insert({
                                ...entry,
                                brand: newBrand,
                                model: newModel,
                                name: newName,
                                search_tokens: searchTokens
                            });
                        
                        if (insertError) {
                            console.error(`  Error fixing "${fullName}":`, insertError.message);
                            errors++;
                        } else {
                            console.log(`  Fixed: "${entry.brand} ${entry.model}" → "${newBrand} ${newModel}"`);
                            fixed++;
                        }
                    }
                } else {
                    console.error(`  Error updating "${fullName}":`, updateError.message);
                    errors++;
                }
            } else {
                console.log(`  Fixed: "${entry.brand} ${entry.model}" → "${newBrand} ${newModel}"`);
                fixed++;
            }
        } else {
            skipped++;
        }
    }
    
    console.log(`\n\nFix complete!`);
    console.log(`Fixed: ${fixed} entries`);
    console.log(`Skipped: ${skipped} entries (already correct)`);
    console.log(`Errors: ${errors} entries`);
}

// Run the fix
fixIncorrectBrands().catch(console.error);


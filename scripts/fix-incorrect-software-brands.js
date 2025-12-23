/**
 * Fix Incorrect Brand Parsing in Software Database
 * 
 * This script identifies and fixes software entries where multi-word developers
 * were incorrectly split (e.g., "Native Instruments" became brand: "Native", model: "Instruments Kontakt")
 * 
 * Usage: node scripts/fix-incorrect-software-brands.js
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
        'TAL Software', 'TAL', 'UVI', 'SampleTank', 'IK Multimedia',
        'MakeMusic', 'BandLab', 'Steinberg', 'PreSonus', 'Notion',
        'Serato', 'Pioneer', 'Atomix', 'Mixvibes', 'Algoriddim',
        'Blackmagic', 'DaVinci', 'Adobe', 'Apple', 'Avid',
        'Sony', 'Magix', 'Steinberg', 'FFmpeg', 'SoX',
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
    const sortedDevelopers = [...knownDevelopers].sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length);
    
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
    console.log('Starting software brand fix process...\n');
    
    // Find entries that likely have incorrect brand parsing
    // Look for models that start with "&", "-", or contain developer-like words
    const { data: suspiciousEntries, error: fetchError } = await supabase
        .from('software_database')
        .select('*')
        .or('model.ilike.%&%,model.ilike.%-%,brand.ilike.%&%,model.ilike.%Instruments%,model.ilike.%Audio%,model.ilike.%Studio%')
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
        const { brand: newBrand, model: newModel, name: newName } = parseSoftwareName(fullName);
        
        // Check if parsing changed significantly
        // Only fix if the change is substantial (e.g., model starts with "&", "-", or common developer name)
        const needsFix = 
            entry.model.startsWith('&') ||
            entry.model.startsWith('-') ||
            entry.model.toLowerCase().startsWith('instruments ') ||
            entry.model.toLowerCase().startsWith('audio ') ||
            entry.model.toLowerCase().startsWith('studio ') ||
            newBrand !== entry.brand;
        
        if (needsFix && (newBrand !== entry.brand || newModel !== entry.model)) {
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
                .from('software_database')
                .update({
                    brand: newBrand,
                    model: newModel,
                    name: newName,
                    search_tokens: searchTokens
                })
                .eq('id', entry.id);
            
            if (updateError) {
                // If update fails due to duplicate, check if correct entry already exists
                if (updateError.code === '23505' || updateError.message.includes('duplicate key')) {
                    // Check if correct entry already exists
                    const { data: existing } = await supabase
                        .from('software_database')
                        .select('id')
                        .eq('brand', newBrand)
                        .eq('model', newModel)
                        .eq('category', entry.category)
                        .maybeSingle();
                    
                    if (existing) {
                        // Correct entry exists, delete the incorrect one
                        await supabase
                            .from('software_database')
                            .delete()
                            .eq('id', entry.id);
                        console.log(`  Fixed: Deleted duplicate "${entry.brand} ${entry.model}" (correct entry exists)`);
                        fixed++;
                    } else {
                        // Delete old and insert new
                        await supabase
                            .from('software_database')
                            .delete()
                            .eq('id', entry.id);
                        
                        const { error: insertError } = await supabase
                            .from('software_database')
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
    console.log(`Skipped: ${skipped} entries (already correct or no significant change)`);
    console.log(`Errors: ${errors} entries`);
}

// Run the fix
fixIncorrectBrands().catch(console.error);


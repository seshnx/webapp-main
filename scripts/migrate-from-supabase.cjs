#!/usr/bin/env node

/**
 * Migration Script: Remove Supabase Imports
 *
 * This script removes Supabase imports from all component files
 * as part of the Neon + Convex migration.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const COMPONENTS_DIR = path.join(__dirname, '../src/components');

// Files to skip (backups, etc)
const SKIP_PATTERNS = [
    '.backup.',
    '.supabase.backup.',
    '.map',
    'dist/',
    'node_modules/'
];

function shouldSkipFile(filePath) {
    return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

function removeSupabaseImports(content) {
    // Remove Supabase config imports
    content = content.replace(
        /import\s*{\s*supabase\s*}\s*from\s*['"](\.\.\/)+config\/supabase['"];?\s*\n?/g,
        ''
    );

    // Remove unused Supabase imports
    content = content.replace(
        /import\s*{\s*[^}]*supabase[^}]*\s*}\s*from\s*['"](\.\.\/)+config\/supabase['"];?\s*\n?/g,
        ''
    );

    return content;
}

function processFile(filePath) {
    if (shouldSkipFile(filePath)) {
        return { skipped: true, file: filePath };
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        const updatedContent = removeSupabaseImports(content);

        if (updatedContent !== originalContent) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            return { modified: true, file: filePath };
        }

        return { unchanged: true, file: filePath };
    } catch (error) {
        return { error: true, file: filePath, message: error.message };
    }
}

function main() {
    console.log('🔄 Removing Supabase imports from components...\n');

    // Find all JSX files
    const files = glob.sync('**/*.jsx', { cwd: COMPONENTS_DIR, absolute: false });

    let results = {
        total: files.length,
        modified: 0,
        unchanged: 0,
        skipped: 0,
        errors: 0
    };

    files.forEach(file => {
        const filePath = path.join(COMPONENTS_DIR, file);
        const result = processFile(filePath);

        if (result.skipped) results.skipped++;
        else if (result.modified) results.modified++;
        else if (result.unchanged) results.unchanged++;
        else if (result.error) {
            results.errors++;
            console.error(`  ❌ Error in ${file}: ${result.message}`);
        }
    });

    console.log('\n📊 Results:');
    console.log(`  Total files: ${results.total}`);
    console.log(`  ✅ Modified: ${results.modified}`);
    console.log(`  ⏭️  Unchanged: ${results.unchanged}`);
    console.log(`  ⏭️  Skipped: ${results.skipped}`);
    console.log(`  ❌ Errors: ${results.errors}`);

    if (results.modified > 0) {
        console.log('\n✨ Supabase imports removed successfully!');
        console.log('⚠️  Note: You will need to manually update component logic to use Neon API endpoints.');
    } else {
        console.log('\n✅ No changes needed - all files already clean!');
    }
}

main();

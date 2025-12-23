/**
 * Verification script for software database JSON files
 * Checks for duplicates, validates JSON, and counts entries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const softwareDir = path.join(__dirname, '../data/software');
const files = fs.readdirSync(softwareDir).filter(f => f.endsWith('.json'));

console.log('=== SOFTWARE DATABASE FINAL VERIFICATION ===\n');

let totalEntries = 0;
let totalDuplicates = 0;
let totalFiles = 0;
const issues = [];

files.forEach(file => {
    try {
        const filePath = path.join(softwareDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        console.log(`\n📁 ${file}`);
        console.log('─'.repeat(50));
        
        let fileEntries = 0;
        let fileDuplicates = 0;
        const allEntries = [];
        const duplicateList = [];
        
        Object.keys(data).forEach(category => {
            Object.keys(data[category]).forEach(subcategory => {
                const items = data[category][subcategory];
                if (Array.isArray(items)) {
                    fileEntries += items.length;
                    items.forEach(item => {
                        if (allEntries.includes(item)) {
                            fileDuplicates++;
                            duplicateList.push(item);
                        } else {
                            allEntries.push(item);
                        }
                    });
                }
            });
        });
        
        console.log(`  ✅ Valid JSON: Yes`);
        console.log(`  📊 Total Entries: ${fileEntries}`);
        console.log(`  🔄 Duplicates Found: ${fileDuplicates}`);
        
        if (fileDuplicates > 0) {
            console.log(`  ⚠️  Duplicate Entries:`);
            duplicateList.forEach(dup => {
                console.log(`     - ${dup}`);
            });
            issues.push({ file, duplicates: duplicateList });
        }
        
        totalEntries += fileEntries;
        totalDuplicates += fileDuplicates;
        totalFiles++;
        
    } catch(e) {
        console.log(`\n❌ ${file}: ${e.message}`);
        issues.push({ file, error: e.message });
    }
});

console.log(`\n\n=== SUMMARY ===`);
console.log(`Total Files: ${totalFiles}`);
console.log(`Total Entries: ${totalEntries}`);
console.log(`Total Duplicates: ${totalDuplicates}`);
console.log(`Status: ${totalDuplicates === 0 ? '✅ ALL CLEAN' : '⚠️  NEEDS ATTENTION'}`);

if (issues.length > 0) {
    console.log(`\n\n=== ISSUES FOUND ===`);
    issues.forEach(issue => {
        if (issue.duplicates) {
            console.log(`\n${issue.file}:`);
            issue.duplicates.forEach(dup => console.log(`  - ${dup}`));
        } else if (issue.error) {
            console.log(`\n${issue.file}: ${issue.error}`);
        }
    });
}

process.exit(totalDuplicates > 0 ? 1 : 0);


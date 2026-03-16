/**
 * Script to remove duplicate translation keys while keeping first occurrence
 * Usage: node scripts/fix-duplicate-translations.js
 */

const fs = require('fs');
const path = require('path');

const translationsFile = path.join(__dirname, '../src/i18n/translations.js');

console.log('🔍 Analyzing translations file for duplicate keys...\n');

// Read the file
const content = fs.readFileSync(translationsFile, 'utf8');
const lines = content.split('\n');

// Track keys and their line numbers
const keyInfo = {};
const duplicatesToRemove = new Set();

// Current language context
let currentLang = null;
let currentLangStart = 0;

// Parse the file
lines.forEach((line, index) => {
  const lineNum = index + 1;

  // Track language sections
  const langMatch = line.match(/^([ ]{2})([a-z]+): \{/);
  if (langMatch) {
    currentLang = langMatch[2];
    currentLangStart = lineNum;
    console.log(`Found ${currentLang} section at line ${lineNum}`);
    return;
  }

  // End of language section
  if (line.match(/^([ ]{2}\}),/) && currentLang) {
    currentLang = null;
    return;
  }

  // Track keys within language sections
  if (currentLang) {
    const keyMatch = line.match(/^([ ]{4})([a-zA-Z0-9]+):/);
    if (keyMatch) {
      const key = keyMatch[2];

      if (!keyInfo[currentLang]) {
        keyInfo[currentLang] = {};
      }

      if (!keyInfo[currentLang][key]) {
        // First occurrence - keep it
        keyInfo[currentLang][key] = {
          firstLine: lineNum,
          occurrences: [lineNum]
        };
      } else {
        // Duplicate - mark for removal
        keyInfo[currentLang][key].occurrences.push(lineNum);
        duplicatesToRemove.add(lineNum);
      }
    }
  }
});

// Report duplicates
console.log('\n📊 Duplicate Key Report:\n');

Object.entries(keyInfo).forEach(([lang, keys]) => {
  const dupes = Object.values(keys).filter(k => k.occurrences.length > 1);
  if (dupes.length > 0) {
    console.log(`${lang.toUpperCase()} - ${dupes.length} duplicate keys:`);
    dupes.forEach(({ firstLine, occurrences }) => {
      const key = lines[firstLine - 1].match(/^\s+([a-zA-Z0-9]+):/)[1];
      console.log(`  '${key}' first at line ${firstLine}, duplicated at lines ${occurrences.slice(1).join(', ')}`);
    });
  }
});

console.log(`\n✅ Found ${duplicatesToRemove.size} duplicate lines to remove\n`);

// Create backup
const backupFile = translationsFile + '.backup';
fs.writeFileSync(backupFile, content);
console.log(`💾 Backup created: ${backupFile}`);

// Remove duplicate lines (in reverse order to preserve line numbers)
const linesToKeep = lines.filter((line, index) => {
  const lineNum = index + 1;
  return !duplicatesToRemove.has(lineNum);
});

// Write fixed file
const fixedContent = linesToKeep.join('\n');
fs.writeFileSync(translationsFile, fixedContent);

console.log(`✅ Removed ${duplicatesToRemove.size} duplicate lines`);
console.log(`✅ Fixed file saved: ${translationsFile}`);
console.log(`\n📏 Before: ${lines.length} lines`);
console.log(`📏 After: ${linesToKeep.length} lines`);
console.log(`📉 Reduced by: ${lines.length - linesToKeep.length} lines\n`);

console.log('✨ Done! Run `npm run lint` to verify fixes.');

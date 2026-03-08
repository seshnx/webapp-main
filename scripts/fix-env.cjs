#!/usr/bin/env node

/**
 * Fix Environment Variables Script
 *
 * Automatically fixes common environment variable issues:
 * - Removes escaped newlines (\n)
 * - Removes empty double quote prefix ("")
 * - Removes extra quotes around values
 * - Removes trailing whitespace
 */

const fs = require('fs');
const path = require('path');

const envFile = process.argv[2] || '.env';

if (!fs.existsSync(envFile)) {
  console.error(`❌ File not found: ${envFile}`);
  console.log('\nUsage: node scripts/fix-env.cjs [env-file]\n');
  console.log('Example: node scripts/fix-env.cjs .env');
  process.exit(1);
}

console.log(`🔧 Fixing ${envFile}...\n`);

// Read the file
let content = fs.readFileSync(envFile, 'utf8');
const originalContent = content;

// Backup the original file
const backupFile = `${envFile}.backup`;
fs.writeFileSync(backupFile, content, 'utf8');
console.log(`✅ Backup created: ${backupFile}\n`);

// Split into lines
const lines = content.split('\n');
const fixedLines = [];

let fixedCount = 0;

for (let line of lines) {
  // Skip empty lines and comments
  if (!line.trim() || line.trim().startsWith('#')) {
    fixedLines.push(line);
    continue;
  }

  const [keyPart, ...valueParts] = line.split('=');
  const key = keyPart.trim();
  let value = valueParts.join('=');

  if (!key) {
    fixedLines.push(line);
    continue;
  }

  const originalValue = value;

  // Fix 1: Remove escaped newlines at the end
  value = value.replace(/\\n"$/g, '"');

  // Fix 2: Remove empty double quote prefix ("")
  value = value.replace(/^""/, '');

  // Fix 3: Remove trailing whitespace
  value = value.trim();

  // Fix 4: Remove extra quotes around value (but keep inner quotes if valid)
  // Only remove quotes if the entire value is wrapped in them
  if (value.startsWith('"') && value.endsWith('"') && !value.includes('"\n')) {
    const unquoted = value.slice(1, -1);
    // Only remove if the unquoted version doesn't contain unescaped quotes
    if (!unquoted.includes('\\"') && !unquoted.includes('=\\"')) {
      value = unquoted;
    }
  }

  // Reconstruct the line
  const fixedLine = `${key}=${value}`;
  fixedLines.push(fixedLine);

  if (fixedLine !== line) {
    fixedCount++;
    console.log(`  Line ${fixedLines.length}: ${key}`);
    console.log(`    Before: ${originalValue.substring(0, 60)}${originalValue.length > 60 ? '...' : ''}`);
    console.log(`    After:  ${value.substring(0, 60)}${value.length > 60 ? '...' : ''}`);
    console.log('');
  }
}

// Join back and write
const fixedContent = fixedLines.join('\n');
fs.writeFileSync(envFile, fixedContent, 'utf8');

console.log(`\n✅ Fixed ${fixedCount} variables in ${envFile}`);
console.log(`✅ Original backed up to ${backupFile}\n`);

// Verify by running validation
console.log('🔍 Running validation to verify fixes...\n');
const { spawn } = require('child_process');
const validate = spawn('node', ['scripts/validate-env.cjs', envFile], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

validate.on('close', (code) => {
  console.log(`\n✅ Fix complete! Exit code: ${code}\n`);
});

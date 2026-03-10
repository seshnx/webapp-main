#!/usr/bin/env node

/**
 * Fix escaped newlines in environment files
 * Removes \n and other escape sequences from environment variable values
 */

const fs = require('fs');
const path = require('path');

const envFile = '.env.local';
const backupFile = '.env.local.backup';

try {
  // Read the original file
  const content = fs.readFileSync(envFile, 'utf8');

  // Create backup
  fs.writeFileSync(backupFile, content, 'utf8');
  console.log('✅ Backup created: ' + backupFile);

  // Fix escaped newlines and other common issues
  let fixed = content
    // Remove literal \n at end of quoted strings
    .replace(/\\n"/g, '"')
    // Remove literal \r at end of quoted strings
    .replace(/\\r"/g, '"')
    // Remove literal \t at end of quoted strings
    .replace(/\\t"/g, '"')
    // Remove extra quotes around values (but keep the outer quotes)
    .replace(/^"(.+)"$/gm, '$1')
    // Restore proper quotes for environment variables
    .replace(/^([A-Z_]+)=(.+)$/gm, '$1="$2"');

  // Write the fixed content
  fs.writeFileSync(envFile, fixed, 'utf8');
  console.log('✅ Fixed file: ' + envFile);

  // Show what changed
  const lines = content.split('\n');
  const fixedLines = fixed.split('\n');

  console.log('\n🔍 Changes made:');
  for (let i = 0; i < Math.min(lines.length, fixedLines.length); i++) {
    if (lines[i] !== fixedLines[i]) {
      console.log(`  Line ${i + 1}:`);
      console.log(`    Before: ${lines[i].substring(0, 80)}${lines[i].length > 80 ? '...' : ''}`);
      console.log(`    After:  ${fixedLines[i].substring(0, 80)}${fixedLines[i].length > 80 ? '...' : ''}`);
    }
  }

  console.log('\n✅ Environment file fixed successfully!');
  console.log('🔧 To restore the backup, run: cp ' + backupFile + ' ' + envFile);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

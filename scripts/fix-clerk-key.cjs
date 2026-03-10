#!/usr/bin/env node

/**
 * Fix the specific Clerk key with newline issue
 */

const fs = require('fs');
const path = require('path');

const envFile = '.env.local';

try {
  // Read the file
  let content = fs.readFileSync(envFile, 'utf8');

  // Fix the specific Clerk key with \n at the end
  const original = 'VITE_CLERK_PUBLISHABLE_KEY="pk_test_cmVhbC1iYXJuYWNsZS0xNS5jbGVyay5hY2NvdW50cy5kZXYk\\n"';
  const fixed = 'VITE_CLERK_PUBLISHABLE_KEY="pk_test_cmVhbC1iYXJuYWNsZS0xNS5jbGVyay5hY2NvdW50cy5kZXYk"';

  if (content.includes(original)) {
    content = content.replace(original, fixed);
    fs.writeFileSync(envFile, content, 'utf8');
    console.log('✅ Fixed VITE_CLERK_PUBLISHABLE_KEY - removed \\n');
    console.log('✅ Authentication should now work properly!');
  } else if (content.includes(fixed)) {
    console.log('✅ Clerk key is already fixed');
  } else {
    console.log('❌ Could not find the Clerk key to fix');
    console.log('Looking for:', original);
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

#!/usr/bin/env node

/**
 * Update Convex URL to the correct deployment URL
 */

const fs = require('fs');

const envFile = '.env.local';

try {
  // Read the file
  let content = fs.readFileSync(envFile, 'utf8');

  // Update the Convex URL to the correct deployment
  const oldUrl = 'VITE_CONVEX_URL=https://dependable-badger-168.convex.cloud';
  const newUrl = 'VITE_CONVEX_URL=https://brainy-basilisk-921.convex.cloud';

  if (content.includes(oldUrl)) {
    content = content.replace(oldUrl, newUrl);
    fs.writeFileSync(envFile, content, 'utf8');
    console.log('✅ Updated VITE_CONVEX_URL to active deployment');
    console.log('✅ New URL: https://brainy-basilisk-921.convex.cloud');
    console.log('✅ Real-time features should now work properly!');
  } else if (content.includes(newUrl)) {
    console.log('✅ Convex URL is already correct');
  } else {
    console.log('❌ Could not find the Convex URL to update');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

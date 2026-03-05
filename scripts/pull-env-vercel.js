/**
 * Pull Environment Variables from Vercel for Local Development
 *
 * This script pulls environment variables from Vercel and updates the local .env file.
 *
 * Usage:
 *   node scripts/pull-env-vercel.js
 *   npm run pull-env
 *
 * Requirements:
 *   - Vercel CLI installed and logged in
 *   - Run: vercel login
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Environment variables to pull from Vercel
 */
const ENV_VARS = [
  // Database
  'VITE_MONGODB_CONNECTION_STRING',
  'VITE_MONGODB_DB_NAME',
  'VITE_NEON_CONNECTION_STRING',
  'DATABASE_URL',

  // Authentication
  'VITE_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'VITE_CLERK_SIGN_IN_URL',
  'VITE_CLERK_SIGN_UP_URL',
  'VITE_CLERK_SIGN_OUT_URL',
  'VITE_CLERK_AFTER_SIGN_IN_URL',
  'VITE_CLERK_AFTER_SIGN_UP_URL',

  // Convex
  'VITE_CONVEX_URL',
  'CONVEX_DEPLOY_KEY',

  // File Storage
  'BLOB_READ_WRITE_TOKEN',

  // Payments
  'VITE_STRIPE_TEST_KEY',

  // Error Tracking
  'VITE_SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',

  // Other
  'NODE_ENV',
];

/**
 * Get environment variables from Vercel
 */
function getVercelEnv() {
  try {
    console.log('🔍 Fetching environment variables from Vercel...\n');

    const env = {};

    for (const varName of ENV_VARS) {
      try {
        // Try to get the value from Vercel CLI
        const result = execSync(`vercel env get ${varName} local 2>&1 || echo "NOT_FOUND"`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();

        // Check if the value was found (Vercel CLI outputs the value)
        if (result && !result.includes('NOT_FOUND') && !result.includes('Error')) {
          // Remove any extra whitespace/newlines
          const value = result.replace(/\s+/g, ' ').trim();

          // Don't print sensitive values
          const isSensitive = varName.includes('SECRET') ||
                            varName.includes('KEY') ||
                            varName.includes('TOKEN') ||
                            varName.includes('CONNECTION_STRING') ||
                            varName.includes('DATABASE_URL');

          if (isSensitive) {
            console.log(`   ✅ ${varName}: ***`);
          } else {
            console.log(`   ✅ ${varName}: ${value}`);
          }

          env[varName] = value;
        } else {
          console.log(`   ⚠️  ${varName}: Not found in Vercel`);
        }
      } catch (error) {
        console.log(`   ❌ ${varName}: Failed to fetch`);
      }
    }

    return env;
  } catch (error) {
    console.error('❌ Error fetching Vercel environment variables:', error.message);
    return {};
  }
}

/**
 * Get existing local environment variables
 */
function getLocalEnv() {
  const envPath = resolve(process.cwd(), '.env');

  if (!existsSync(envPath)) {
    return {};
  }

  const content = readFileSync(envPath, 'utf-8');
  const env = {};

  for (const line of content.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2];
    }
  }

  return env;
}

/**
 * Write environment variables to .env file
 */
function writeEnvFile(env) {
  const envPath = resolve(process.cwd(), '.env');

  // Sort keys alphabetically
  const keys = Object.keys(env).sort();

  const content = keys
    .map((key) => {
      const value = env[key];
      // Quote values that contain spaces or special characters
      const needsQuotes = /[\s"']/.test(value);
      return needsQuotes ? `${key}="${value}"` : `${key}=${value}`;
    })
    .join('\n') + '\n';

  writeFileSync(envPath, content, 'utf-8');
  console.log(`\n✅ Environment variables written to .env`);
}

/**
 * Backup existing .env file
 */
function backupEnvFile() {
  const envPath = resolve(process.cwd(), '.env');

  if (existsSync(envPath)) {
    const backupPath = resolve(process.cwd(), `.env.backup-${Date.now()}`);
    const content = readFileSync(envPath, 'utf-8');
    writeFileSync(backupPath, content, 'utf-8');
    console.log(`📦 Backup created: ${backupPath}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Pulling Environment Variables from Vercel\n');
  console.log('=' .repeat(60));

  // Check if Vercel CLI is available
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Vercel CLI not found. Please install it first:');
    console.error('   npm install -g vercel');
    console.error('   vercel login');
    process.exit(1);
  }

  // Backup existing .env
  backupEnvFile();

  // Get Vercel environment variables
  const vercelEnv = getVercelEnv();

  if (Object.keys(vercelEnv).length === 0) {
    console.error('\n❌ No environment variables found in Vercel');
    console.error('Make sure you are logged in to Vercel:');
    console.error('   vercel login');
    console.error('   vercel link');
    process.exit(1);
  }

  // Merge with existing local env (preserve local overrides)
  const localEnv = getLocalEnv();
  const mergedEnv = { ...localEnv, ...vercelEnv };

  // Write to .env
  writeEnvFile(mergedEnv);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successfully pulled ${Object.keys(vercelEnv).length} environment variables`);
  console.log('='.repeat(60));

  console.log('\n💡 Tip: Add .env to your .gitignore if you haven\'t already');
  console.log('💡 Tip: Run this script whenever Vercel environment variables change');
}

// Run script
main();

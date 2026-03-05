/**
 * Fix Environment Variables for Vite
 *
 * Maps Next.js style environment variables (NEXT_PUBLIC_*)
 * to Vite style (VITE_*) and adds missing variables.
 *
 * Usage:
 *   node scripts/fix-env-vars.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Variable mappings
 */
const MAPPINGS = {
  // Clerk
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'VITE_CLERK_PUBLISHABLE_KEY',

  // Convex
  'NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL': 'VITE_CONVEX_URL',

  // Stripe
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'VITE_STRIPE_PUBLISHABLE_KEY',

  // Sentry
  'NEXT_PUBLIC_SENTRY_DSN': 'VITE_SENTRY_DSN',

  // Stack (if needed)
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY': 'VITE_STACK_PUBLISHABLE_CLIENT_KEY',
  'NEXT_PUBLIC_STACK_PROJECT_ID': 'VITE_STACK_PROJECT_ID',
};

/**
 * Additional variables to add
 */
const ADDITIONAL_VARS = {
  'VITE_CLERK_SIGN_IN_URL': '/sign-in',
  'VITE_CLERK_SIGN_UP_URL': '/sign-up',
  'VITE_CLERK_SIGN_OUT_URL': '/sign-out',
  'VITE_CLERK_AFTER_SIGN_IN_URL': '/',
  'VITE_CLERK_AFTER_SIGN_UP_URL': '/',
  'VITE_MONGODB_DB_NAME': 'seshnx',
  'VITE_MONGODB_CONNECTION_STRING': 'MONGODB_URI', // Reference to MONGODB_URI
  'VITE_NEON_DATABASE_URL': 'DATABASE_URL', // Reference to DATABASE_URL
};

/**
 * Process env file
 */
function fixEnvFile() {
  const envPath = resolve(process.cwd(), '.env');

  console.log('🔧 Fixing environment variables for Vite...\n');

  if (!envPath) {
    console.error('❌ .env file not found');
    process.exit(1);
  }

  // Backup existing .env
  const backupPath = resolve(process.cwd(), `.env.backup-${Date.now()}`);
  const originalContent = readFileSync(envPath, 'utf-8');
  writeFileSync(backupPath, originalContent, 'utf-8');
  console.log(`📦 Backup created: ${backupPath}\n`);

  // Parse existing variables
  const env = {};
  for (const line of originalContent.split('\n')) {
    const match = line.match(/^([^=#]+)=(.*)$/);
    if (match && !line.startsWith('#')) {
      env[match[1].trim()] = match[2].trim();
    }
  }

  // Apply mappings
  console.log('🔄 Applying variable mappings...\n');
  for (const [nextVar, viteVar] of Object.entries(MAPPINGS)) {
    if (env[nextVar] && !env[viteVar]) {
      env[viteVar] = env[nextVar];
      console.log(`   ✅ ${nextVar} → ${viteVar}`);
    }
  }

  // Add additional variables
  console.log('\n➕ Adding additional variables...\n');
  for (const [varName, defaultValue] of Object.entries(ADDITIONAL_VARS)) {
    if (!env[varName]) {
      // Check if it's a reference to another variable
      if (env[defaultValue]) {
        env[varName] = env[defaultValue];
        console.log(`   ✅ ${varName} = ${defaultValue} (referenced)`);
      } else {
        env[varName] = defaultValue;
        console.log(`   ✅ ${varName} = ${defaultValue}`);
      }
    }
  }

  // Write updated .env
  const keys = Object.keys(env).sort();
  const content = keys
    .map((key) => {
      const value = env[key];
      const needsQuotes = /[\s"']/.test(value);
      return needsQuotes ? `${key}="${value}"` : `${key}=${value}`;
    })
    .join('\n') + '\n';

  writeFileSync(envPath, content, 'utf-8');

  console.log('\n✅ Environment variables fixed!\n');
  console.log(`📝 Total variables: ${keys.length}`);
  console.log('\n💡 You can now run: npm run dev');
}

// Run
fixEnvFile();

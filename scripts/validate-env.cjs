#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 *
 * Checks for common environment variable issues:
 * - Extra quotes around values
 * - Escaped newlines at the end
 * - Trailing whitespace
 * - Missing required variables
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const REQUIRED_VARS = [];

// Variables that should NOT have quotes
const SHOULD_NOT_HAVE_QUOTES = [
  'VITE_CONVEX_URL',
  'VITE_API_ENDPOINT'
];

// Patterns to detect issues
const ISSUES = {
  EXTRA_QUOTES: /^"(.+)"$/,
  ESCAPED_NEWLINE: /\\n"$/,
  TRAILING_SPACE: /\s+$/,
  EMPTY_DOUBLE_QUOTE: /^""/
};

let hasErrors = false;
let hasWarnings = false;

function validateEnvFile(filePath) {
  console.log(`\n🔍 Validating ${filePath}...\n`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let lineNumber = 0;
  const errors = [];
  const warnings = [];

  for (let line of lines) {
    lineNumber++;

    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    // Parse variable
    const [keyPart, ...valueParts] = line.split('=');
    const key = keyPart.trim();
    const value = valueParts.join('=').trim();

    if (!key || !value) {
      continue;
    }

    // Check for escaped newlines
    if (ISSUES.ESCAPED_NEWLINE.test(value)) {
      errors.push({
        line: lineNumber,
        key,
        issue: 'Escaped newline (\\n) at end',
        value: value.substring(0, 50) + '...'
      });
      hasErrors = true;
    }

    // Check for trailing whitespace in value
    if (ISSUES.TRAILING_SPACE.test(value)) {
      warnings.push({
        line: lineNumber,
        key,
        issue: 'Trailing whitespace',
        value: value.substring(0, 50) + '...'
      });
      hasWarnings = true;
    }

    // Check for empty double quotes
    if (ISSUES.EMPTY_DOUBLE_QUOTE.test(value)) {
      warnings.push({
        line: lineNumber,
        key,
        issue: 'Empty double quote prefix ("")',
        value: value.substring(0, 50) + '...'
      });
      hasWarnings = true;
    }

    // Check for extra quotes
    if (SHOULD_NOT_HAVE_QUOTES.includes(key) && ISSUES.EXTRA_QUOTES.test(value)) {
      errors.push({
        line: lineNumber,
        key,
        issue: 'Extra quotes around value',
        value: value.substring(0, 50) + '...'
      });
      hasErrors = true;
    }

    // Check if value is empty
    if (value === '' && REQUIRED_VARS.includes(key)) {
      errors.push({
        line: lineNumber,
        key,
        issue: 'Empty value for required variable',
        value: ''
      });
      hasErrors = true;
    }
  }

  // Print errors
  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    errors.forEach(({ line, key, issue, value }) => {
      console.log(`  Line ${line}: ${key}`);
      console.log(`    Issue: ${issue}`);
      if (value) {
        console.log(`    Value: ${value}`);
      }
      console.log('');
    });
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach(({ line, key, issue, value }) => {
      console.log(`  Line ${line}: ${key}`);
      console.log(`    Issue: ${issue}`);
      if (value) {
        console.log(`    Value: ${value}`);
      }
      console.log('');
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No issues found!\n');
  }
}

function checkRequiredVars() {
  console.log('\n🔍 Checking required variables...\n');

  const missing = [];

  for (const key of REQUIRED_VARS) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
      hasErrors = true;
    }
  }

  if (missing.length > 0) {
    console.log('❌ Missing required variables:\n');
    missing.forEach(key => {
      console.log(`  - ${key}`);
    });
    console.log('');
  } else {
    console.log('✅ All required variables are set!\n');
  }
}

// Main execution
const envFile = process.argv[2] || '.env';

if (fs.existsSync(envFile)) {
  validateEnvFile(envFile);
} else {
  console.log(`\n⚠️  Environment file not found: ${envFile}\n`);
  console.log('Usage: node scripts/validate-env.js [env-file]\n');
  console.log('Example: node scripts/validate-env.js .env');
  console.log('         node scripts/validate-env.js .env.local\n');
  process.exit(1);
}

checkRequiredVars();

// Exit with error code if issues found
if (hasErrors) {
  console.log('❌ Validation failed! Please fix the errors above.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Validation completed with warnings.\n');
  process.exit(0);
} else {
  console.log('✅ Validation passed!\n');
  process.exit(0);
}

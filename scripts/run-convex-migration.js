/**
 * Convex Migration Runner
 * Executes the complete migration from Neon + MongoDB to Convex
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Logging utilities
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.cyan}${colors.bright}[${step}] ${message}${colors.reset}\n`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

// Execute command helper
async function executeCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

// Check if data files exist
function checkDataFile(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Data file not found: ${filename}`);
  }
  return filepath;
}

// Get file size
function getFileSize(filename) {
  const filepath = path.join(DATA_DIR, filename);
  const stats = fs.statSync(filepath);
  return (stats.size / 1024 / 1024).toFixed(2); // MB
}

// Migration steps
async function step1_ExportData() {
  logStep('1/6', 'Export data from Neon and MongoDB');

  const exportScript = path.join(__dirname, 'export-data.js');
  await executeCommand('node', [exportScript]);

  logSuccess('Data exported successfully');
}

async function step2_MigrateUsers() {
  logStep('2/6', 'Migrate users to Convex');

  const filepath = checkDataFile('users.json');
  log(`Data file: ${filepath} (${getFileSize('users.json')} MB)`);

  await executeCommand('npx', ['convex', 'run', 'migrate:migrateUsers', '--users', `@${filepath}`]);

  logSuccess('Users migrated successfully');
}

async function step3_MigrateSocialFeatures() {
  logStep('3/6', 'Migrate social features (posts, comments, reactions)');

  // Migrate posts
  log('Migrating posts...', 'blue');
  const postsPath = checkDataFile('posts.json');
  await executeCommand('npx', ['convex', 'run', 'migrate:migratePosts', '--posts', `@${postsPath}`]);
  logSuccess('Posts migrated');

  // Migrate comments
  log('Migrating comments...', 'blue');
  const commentsPath = checkDataFile('comments.json');
  await executeCommand('npx', ['convex', 'run', 'migrate:migrateComments', '--comments', `@${commentsPath}`]);
  logSuccess('Comments migrated');

  // Migrate reactions
  log('Migrating reactions...', 'blue');
  const reactionsPath = checkDataFile('reactions.json');
  await executeCommand('npx', ['convex', 'run', 'migrate:migrateReactions', '--reactions', `@${reactionsPath}`]);
  logSuccess('Reactions migrated');

  // Migrate follows
  log('Migrating follows...', 'blue');
  const followsPath = checkDataFile('follows.json');
  await executeCommand('npx', ['convex', 'run', 'migrate:migrateFollows', '--follows', `@${followsPath}`]);
  logSuccess('Follows migrated');
}

async function step4_MigrateBusinessData() {
  logStep('4/6', 'Migrate business data (bookings, schools)');

  // Migrate bookings
  log('Migrating bookings...', 'blue');
  try {
    const bookingsPath = checkDataFile('bookings.json');
    await executeCommand('npx', ['convex', 'run', 'migrate:migrateBookings', '--bookings', `@${bookingsPath}`]);
    logSuccess('Bookings migrated');
  } catch (error) {
    logWarning('Bookings migration skipped or failed');
  }

  // Migrate schools
  log('Migrating schools...', 'blue');
  try {
    const schoolsPath = checkDataFile('schools.json');
    await executeCommand('npx', ['convex', 'run', 'migrate:migrateSchools', '--schools', `@${schoolsPath}`]);
    logSuccess('Schools migrated');
  } catch (error) {
    logWarning('Schools migration skipped or failed');
  }

  // Migrate students
  log('Migrating students...', 'blue');
  try {
    const studentsPath = checkDataFile('students.json');
    await executeCommand('npx', ['convex', 'run', 'migrate:migrateStudents', '--students', `@${studentsPath}`]);
    logSuccess('Students migrated');
  } catch (error) {
    logWarning('Students migration skipped or failed');
  }
}

async function step5_MigrateBroadcasts() {
  logStep('5/6', 'Migrate broadcasts');

  try {
    const broadcastsPath = checkDataFile('broadcasts.json');
    log(`Data file: ${broadcastsPath} (${getFileSize('broadcasts.json')} MB)`);

    await executeCommand('npx', ['convex', 'run', 'migrate:migrateBroadcasts', '--broadcasts', `@${broadcastsPath}`]);

    logSuccess('Broadcasts migrated successfully');
  } catch (error) {
    logWarning('Broadcasts migration skipped or failed');
  }
}

async function step6_ValidateMigration() {
  logStep('6/6', 'Validate migration');

  log('Running validation query...', 'blue');
  const { execSync } = require('child_process');

  try {
    const result = execSync('npx convex run migrate:validateMigration', { encoding: 'utf8' });
    const data = JSON.parse(result);

    log('\n📊 Migration Statistics:', 'bright');
    log(`  Users:      ${data.users}`, 'cyan');
    log(`  Posts:      ${data.posts}`, 'cyan');
    log(`  Comments:   ${data.comments}`, 'cyan');
    log(`  Reactions:  ${data.reactions}`, 'cyan');
    log(`  Follows:    ${data.follows}`, 'cyan');

    logSuccess('Migration validation complete!');
  } catch (error) {
    logError('Validation failed');
    throw error;
  }
}

// Main migration function
async function runMigration(options = {}) {
  log('\n🚀 CONVEX MIGRATION', 'bright');
  log('=' .repeat(50), 'bright');

  const {
    skipExport = false,
    skipValidation = false,
    step = null, // Run specific step only
  } = options;

  try {
    // Run specific step
    if (step) {
      switch (step) {
        case 1: await step1_ExportData(); break;
        case 2: await step2_MigrateUsers(); break;
        case 3: await step3_MigrateSocialFeatures(); break;
        case 4: await step4_MigrateBusinessData(); break;
        case 5: await step5_MigrateBroadcasts(); break;
        case 6: await step6_ValidateMigration(); break;
        default: throw new Error(`Invalid step: ${step}`);
      }
      logSuccess(`Step ${step} completed!`);
      return;
    }

    // Run full migration
    if (!skipExport) {
      await step1_ExportData();
    }

    await step2_MigrateUsers();
    await step3_MigrateSocialFeatures();
    await step4_MigrateBusinessData();
    await step5_MigrateBroadcasts();

    if (!skipValidation) {
      await step6_ValidateMigration();
    }

    log('\n🎉 MIGRATION COMPLETE!', 'bright');
    log('\nNext steps:', 'bright');
    log('1. Test your application with Convex', 'blue');
    log('2. Update environment variables', 'blue');
    log('3. Deploy to production', 'blue');
    log('4. Monitor for issues', 'blue');

  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    log('\n📝 Troubleshooting:', 'bright');
    log('1. Check Convex dashboard for errors', 'yellow');
    log('2. Verify data files exist in /data directory', 'yellow');
    log('3. Run specific step with --step=N', 'yellow');
    log('4. Check logs for detailed error messages', 'yellow');
    process.exit(1);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  const options = {
    skipExport: args.includes('--skip-export'),
    skipValidation: args.includes('--skip-validation'),
    step: null,
  };

  // Parse step number
  const stepIndex = args.indexOf('--step');
  if (stepIndex !== -1 && args[stepIndex + 1]) {
    options.step = parseInt(args[stepIndex + 1]);
  }

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Convex Migration Runner

Usage:
  node run-convex-migration.js [options]

Options:
  --skip-export      Skip data export step
  --skip-validation  Skip validation step
  --step=N           Run specific step only (1-6)
  --help, -h         Show this help

Examples:
  node run-convex-migration.js              # Run full migration
  node run-convex-migration.js --skip-export # Skip export, run migration only
  node run-convex-migration.js --step=2     # Run step 2 only (users)
  node run-convex-migration.js --step=3     # Run step 3 only (social features)
`);
    process.exit(0);
  }

  await runMigration(options);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runMigration };

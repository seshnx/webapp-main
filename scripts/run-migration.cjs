/**
 * Migration Runner Script
 * Executes SQL migration files on the Neon database
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local file to get VITE_NEON_DATABASE_URL
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  for (const line of envContent.split('\n')) {
    const match = line.match(/^VITE_([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }

  return envVars;
}

/**
 * Split SQL into statements, handling PL/pgSQL blocks
 */
function splitSQL(sql) {
  const statements = [];
  let current = '';
  let depth = 0;
  let inDollarQuote = false;
  let dollarQuoteTag = null;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  const lines = sql.split('\n');

  for (let line of lines) {
    let i = 0;

    // Skip line if it's a pure comment line
    const trimmed = line.trim();
    if (trimmed.startsWith('--') && !inLineComment && !inBlockComment) {
      if (current.trim()) {
        current += '\n' + line;
      }
      continue;
    }

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1] || '';

      // Handle comments
      if (!inSingleQuote && !inDoubleQuote && !inDollarQuote) {
        if (char === '-' && nextChar === '-' && !inBlockComment) {
          inLineComment = true;
          i += 2;
          continue;
        }
        if (char === '/' && nextChar === '*' && !inLineComment) {
          inBlockComment = true;
          i += 2;
          continue;
        }
        if (char === '*' && nextChar === '/' && inBlockComment) {
          inBlockComment = false;
          i += 2;
          continue;
        }
      }

      if (inLineComment && char === '\n') {
        inLineComment = false;
      }

      // Skip comment content
      if (inLineComment || inBlockComment) {
        current += char;
        i++;
        continue;
      }

      // Handle quotes
      if (char === "'" && !inDoubleQuote && !inDollarQuote) {
        inSingleQuote = !inSingleQuote;
        current += char;
        i++;
        continue;
      }
      if (char === '"' && !inSingleQuote && !inDollarQuote) {
        inDoubleQuote = !inDoubleQuote;
        current += char;
        i++;
        continue;
      }

      // Handle dollar-quoted strings ($tag$...$tag$)
      if (char === '$' && !inSingleQuote && !inDoubleQuote) {
        // Check for dollar quote tag
        let tagEnd = i + 1;
        while (tagEnd < line.length && line[tagEnd] !== '$') {
          tagEnd++;
        }

        if (line[tagEnd] === '$') {
          const tag = line.substring(i, tagEnd + 1);

          if (inDollarQuote && tag === dollarQuoteTag) {
            // Closing dollar quote
            inDollarQuote = false;
            dollarQuoteTag = null;
            current += tag;
            i = tagEnd + 1;
            continue;
          } else if (!inDollarQuote) {
            // Opening dollar quote
            inDollarQuote = true;
            dollarQuoteTag = tag;
            current += tag;
            i = tagEnd + 1;
            continue;
          }
        }
      }

      // Track parentheses depth (outside of quotes/strings/comments)
      if (!inSingleQuote && !inDoubleQuote && !inDollarQuote) {
        if (char === '(') depth++;
        if (char === ')') depth--;

        // Statement terminator (semicolon at depth 0)
        if (char === ';' && depth === 0) {
          current += char;
          const stmt = current.trim();
          if (stmt && !stmt.startsWith('--')) {
            statements.push(stmt);
          }
          current = '';
          i++;
          continue;
        }
      }

      current += char;
      i++;
    }

    current += '\n';
  }

  // Add remaining content
  const lastStmt = current.trim();
  if (lastStmt && !lastStmt.startsWith('--')) {
    statements.push(lastStmt);
  }

  return statements;
}

async function runMigration(sqlFile) {
  console.log(`\n📝 Running migration: ${sqlFile}`);

  // Load environment variables
  const env = loadEnv();
  const neonUrl = env['NEON_DATABASE_URL'];

  if (!neonUrl) {
    console.error('❌ Error: VITE_NEON_DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log(`✅ Database URL found: ${neonUrl.substring(0, 30)}...`);

  // Read SQL file
  const sqlPath = path.join(__dirname, '..', 'sql', sqlFile);
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ Error: SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Create Neon client
  const sqlClient = neon(neonUrl);

  console.log('🔄 Executing migration...');

  try {
    // Split SQL into statements, handling PL/pgSQL blocks
    const statements = splitSQL(sql);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt || stmt.startsWith('--') || stmt.startsWith('/*')) continue;

      try {
        await sqlClient(stmt);
        successCount++;
        if (successCount % 5 === 0) {
          console.log(`   Progress: ${successCount}/${statements.length} statements executed...`);
        }
      } catch (err) {
        errorCount++;
        const preview = stmt.substring(0, 100).replace(/\n/g, ' ');
        console.error(`   ⚠️  Statement ${i + 1} failed: ${err.message}`);
        console.error(`      Preview: ${preview}...`);
        // Continue with next statement
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Total statements: ${statements.length}`);
    console.log(`   - Executed successfully: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   - Errors: ${errorCount} (some may be expected for IF EXISTS checks)`);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
const sqlFile = process.argv[2] || '29_fix_clerk_user_ids.sql';
runMigration(sqlFile).catch(console.error);

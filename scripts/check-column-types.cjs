const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  for (const line of envContent.split('\n')) {
    const match = line.match(/^VITE_([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2].replace(/^[\"']|[\"']$/g, '');
    }
  }

  return envVars;
}

(async () => {
  const env = loadEnv();
  const neonUrl = env['NEON_DATABASE_URL'];
  const sqlClient = neon(neonUrl);

  console.log('\n🔍 Checking clerk_users.account_types column type...\n');

  const result = await sqlClient(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_name = 'clerk_users'
    AND column_name = 'account_types'
  `);

  console.log('Result:', JSON.stringify(result, null, 2));
  console.log();
})().catch(console.error);

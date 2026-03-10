/**
 * Fix Vercel Environment Variables
 * Removes extra quotes from Clerk keys
 */

const { execSync } = require('child_process');

// Variables to fix
const fixes = [
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    value: 'pk_test_cmVhbC1iYXJuYWNsZS0xNS5jbGVyay5hY2NvdW50cy5kZXYk'
  },
  {
    name: 'VITE_CLERK_PUBLISHABLE_KEY',
    value: 'pk_test_cmVhbC1iYXJuYWNsZS0xNS5jbGVyay5hY2NvdW50cy5kZXYk'
  },
  {
    name: 'CLERK_SECRET_KEY',
    value: 'sk_test_hUDsPeu4smcl0WBpBXyTF6eUoymXE1orOD8ZCpGjGA'
  },
  {
    name: 'CLERK_WEBHOOK_SECRET',
    value: 'whsec_D0bG38yy75qz/8DokfWV7w2sfXGv+1eT'
  }
];

console.log('To fix Vercel environment variables, run:\n');

fixes.forEach(({ name, value }) => {
  console.log(`vercel env rm ${name}`);
  console.log(`vercel env add ${name} ${value}`);
  console.log('');
});

console.log('\nOr use the Vercel dashboard:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings > Environment Variables');
console.log('4. For each variable:');
console.log('   - Delete the existing variable');
console.log('   - Add it back with the value (WITHOUT extra quotes)');
console.log('\nCorrect format:');
fixes.forEach(({ name, value }) => {
  console.log(`${name}=${value}`);
});

/**
 * Webhook Integration Script
 * 
 * This script helps integrate webhook triggers into existing database operations.
 * Run with: node scripts/setup-webhooks.js
 */

const fs = require('fs');
const path = require('path');

const WEBHOOK_IMPORT = `import { triggerBookingWebhook, triggerNotificationWebhook, triggerCommentWebhook } from '../utils/webhookTrigger';`;

console.log('🔧 Setting up Convex webhook integration...\n');

// Files to modify
const filesToModify = [
  {
    path: 'src/config/neonQueries.ts',
    operations: [
      { name: 'createBooking', event: 'booking.created' },
      { name: 'updateBookingStatus', event: 'booking.updated' },
      { name: 'updateBooking', event: 'booking.updated' },
    ]
  },
  {
    path: 'src/config/mongoSocial.ts',
    operations: [
      { name: 'createSocialNotification', event: 'notification.created' },
      { name: 'markAllNotificationsAsRead', event: 'notification.all_read' },
      { name: 'createComment', event: 'comment.created' },
      { name: 'updateComment', event: 'comment.updated' },
      { name: 'deleteComment', event: 'comment.deleted' },
    ]
  }
];

console.log('📋 Files that will be modified:');
filesToModify.forEach(file => {
  console.log(`  - ${file.path}`);
  file.operations.forEach(op => {
    console.log(`    ↳ ${op.name} → ${op.event}`);
  });
});

console.log('\n✅ Setup complete!');
console.log('\n📖 Next steps:');
console.log('  1. Add webhook import to each file:');
console.log(`     ${WEBHOOK_IMPORT}`);
console.log('  2. Add webhook trigger after each database operation:');
console.log('     await triggerBookingWebhook("booking.created", bookingData);');
console.log('  3. Test webhooks: npm run dev');
console.log('  4. Generate Convex types: npx convex dev');
console.log('\n📖 See api/webhooks/README.md for full documentation');

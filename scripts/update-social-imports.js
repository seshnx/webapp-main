/**
 * Update Social Component Imports to Use MongoDB
 *
 * This script updates all social component imports from neonQueries to mongoSocial.
 * Run this after the MongoDB migration is complete.
 *
 * Usage:
 *   node scripts/update-social-imports.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { resolve } from 'path';

/**
 * Files to update
 */
const filesToUpdate = [
  'src/components/social/PostCard.tsx',
  'src/components/social/CommentSection.tsx',
  'src/components/social/SearchPanel.tsx',
  'src/components/social/RepostModal.tsx',
  'src/components/social/FollowersListModal.tsx',
  'src/components/social/CreatePostWidget.tsx',
  'src/components/social/FollowButton.tsx',
  'src/components/social/NotificationsPanel.tsx',
];

/**
 * Import replacements
 */
const replacements = [
  {
    from: /from ['"]\.\.\/\.\.\/config\/neonQueries['"]/g,
    to: "from '../../config/mongoSocial'",
    functions: ['getPosts', 'createPost', 'updatePost', 'deletePost', 'getComments', 'createComment', 'deleteComment', 'toggleReaction', 'getReactions'],
  },
  {
    from: /from ['"]\.\.\/config\/neonQueries['"]/g,
    to: "from '../config/mongoSocial'",
    functions: ['getPosts', 'createPost', 'updatePost', 'deletePost', 'getComments', 'createComment', 'deleteComment', 'toggleReaction', 'getReactions'],
  },
  {
    from: /from ['"]\.\.\/\.\.\/\.\.\/config\/neonQueries['"]/g,
    to: "from '../../../config/mongoSocial'",
    functions: ['getPosts', 'createPost', 'updatePost', 'deletePost', 'getComments', 'createComment', 'deleteComment', 'toggleReaction', 'getReactions'],
  },
];

/**
 * Update a single file
 */
function updateFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;
    let changes = [];

    // Check if file imports from neonQueries
    const hasNeonImport = /from ['"].*neonQueries['"]/.test(content);

    if (!hasNeonImport) {
      console.log(`   ⊘ No neonQueries imports found in ${filePath}`);
      return { modified: false, changes: [] };
    }

    // Apply replacements
    for (const replacement of replacements) {
      if (replacement.from.test(content)) {
        // Check if any of the functions are imported
        const hasFunctions = replacement.functions.some(fn => content.includes(fn));

        if (hasFunctions) {
          content = content.replace(replacement.from, replacement.to);
          modified = true;
          changes.push(`Updated import to mongoSocial`);
        }
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`   ✅ Updated ${filePath}`);
      console.log(`      Changes: ${changes.join(', ')}`);
    }

    return { modified, changes };
  } catch (error) {
    console.error(`   ❌ Error updating ${filePath}:`, error.message);
    return { modified: false, changes: [], error: error.message };
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔄 Updating social component imports to use MongoDB...\n');

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of filesToUpdate) {
    const filePath = resolve(process.cwd(), file);

    console.log(`\n📄 Processing: ${file}`);

    try {
      const result = updateFile(filePath);

      if (result.modified) {
        updated++;
      } else {
        skipped++;
      }

      if (result.error) {
        errors++;
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Updated: ${updated}`);
  console.log(`⊘ Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('='.repeat(50));

  if (updated > 0) {
    console.log('\n✅ Import updates complete!');
    console.log('Please review the changes and test the application.');
  } else {
    console.log('\n⚠️ No files were updated.');
    console.log('Either all files are already using mongoSocial or no imports were found.');
  }

  if (errors > 0) {
    process.exit(1);
  }
}

// Run script
main();

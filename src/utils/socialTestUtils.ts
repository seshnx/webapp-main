/**
 * Social Components Testing Utilities
 * 
 * Helper functions for testing social features in development
 */

import { getPosts, createPost, toggleReaction, followUser, unfollowUser } from '../config/mongoSocial';
import { debugLog, setDebugMode } from './socialDebug';

/**
 * Enable debug mode for testing
 */
export function enableTestMode() {
  setDebugMode(true);
  console.log('🧪 Test mode enabled');
}

/**
 * Create a test post
 */
export async function createTestPost(options: {
  authorId: string;
  content?: string;
  mediaUrls?: string[];
  category?: string;
}) {
  const {
    authorId,
    content = 'This is a test post created for debugging purposes.',
    mediaUrls = [],
    category = 'general'
  } = options;

  debugLog('TEST', 'Creating test post', { authorId, content, category });

  try {
    const post = await createPost({
      author_id: authorId,
      content,
      media_urls: mediaUrls,
      category,
      visibility: 'public'
    });

    console.log('✅ Test post created:', post.id);
    return post;
  } catch (error) {
    console.error('❌ Failed to create test post:', error);
    throw error;
  }
}

/**
 * Create multiple test posts
 */
export async function createTestPosts(authorId: string, count: number = 5) {
  debugLog('TEST', `Creating ${count} test posts`);

  const posts = [];
  for (let i = 0; i < count; i++) {
    const post = await createTestPost({
      authorId,
      content: `Test post #${i + 1} - Created at ${new Date().toISOString()}`
    });
    posts.push(post);
  }

  console.log(`✅ Created ${count} test posts`);
  return posts;
}

/**
 * Test reaction functionality
 */
export async function testReaction(postId: string, userId: string, emoji: string = '👍') {
  debugLog('TEST', `Testing reaction: ${emoji} on post ${postId}`);

  try {
    // Add reaction
    const added = await toggleReaction(postId, 'post', emoji, userId);
    console.log('✅ Reaction added:', added);

    // Remove reaction
    const removed = await toggleReaction(postId, 'post', emoji, userId);
    console.log('✅ Reaction removed:', removed);

    return { added, removed };
  } catch (error) {
    console.error('❌ Reaction test failed:', error);
    throw error;
  }
}

/**
 * Test follow functionality
 */
export async function testFollow(followerId: string, followingId: string) {
  debugLog('TEST', `Testing follow: ${followerId} -> ${followingId}`);

  try {
    // Follow
    await followUser(followerId, followingId);
    console.log('✅ Followed successfully');

    // Unfollow
    await unfollowUser(followerId, followingId);
    console.log('✅ Unfollowed successfully');

    return true;
  } catch (error) {
    console.error('❌ Follow test failed:', error);
    throw error;
  }
}

/**
 * Benchmark API performance
 */
export async function benchmarkApiCalls(authorId: string) {
  debugLog('TEST', 'Starting API benchmark');

  const operations = [
    { name: 'getPosts', fn: () => getPosts({ limit: 20 }) },
    { name: 'getPosts(limit=50)', fn: () => getPosts({ limit: 50 }) },
    { name: 'getPosts(limit=100)', fn: () => getPosts({ limit: 100 }) },
  ];

  const results = [];

  for (const op of operations) {
    const start = performance.now();
    try {
      await op.fn();
      const duration = performance.now() - start;
      results.push({ name: op.name, duration, success: true });
      console.log(`  ${op.name}: ${duration.toFixed(2)}ms`);
    } catch (error) {
      const duration = performance.now() - start;
      results.push({ name: op.name, duration, success: false, error });
      console.log(`  ${op.name}: FAILED (${duration.toFixed(2)}ms)`);
    }
  }

  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  console.log(`\n📊 Average: ${avgDuration.toFixed(2)}ms`);

  return results;
}

/**
 * Load test - create many posts rapidly
 */
export async function loadTestPosts(authorId: string, count: number = 10) {
  debugLog('TEST', `Starting load test: ${count} posts`);

  const start = performance.now();
  const posts = [];

  for (let i = 0; i < count; i++) {
    const postStart = performance.now();
    const post = await createTestPost({
      authorId,
      content: `Load test post #${i + 1}/${count}`
    });
    const postDuration = performance.now() - postStart;
    
    posts.push(post);
    console.log(`  Post ${i + 1}/${count}: ${postDuration.toFixed(2)}ms`);
  }

  const totalDuration = performance.now() - start;
  const avgDuration = totalDuration / count;

  console.log(`\n📊 Load Test Results:`);
  console.log(`  Total: ${totalDuration.toFixed(2)}ms`);
  console.log(`  Average: ${avgDuration.toFixed(2)}ms`);
  console.log(`  Throughput: ${(count / (totalDuration / 1000)).toFixed(2)} posts/sec`);

  return { posts, totalDuration, avgDuration };
}

/**
 * Test suite runner
 */
export async function runTestSuite(userId: string) {
  console.log('🧪 Starting Social Test Suite...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [] as any[]
  };

  const tests = [
    {
      name: 'Create Test Post',
      fn: async () => {
        const post = await createTestPost({ authorId: userId });
        if (!post.id) throw new Error('Post ID missing');
        return post;
      }
    },
    {
      name: 'Load Posts',
      fn: async () => {
        const posts = await getPosts({ limit: 10 });
        if (!Array.isArray(posts)) throw new Error('Posts not an array');
        return posts;
      }
    },
    {
      name: 'API Benchmark',
      fn: async () => {
        const results = await benchmarkApiCalls(userId);
        if (results.some(r => !r.success)) throw new Error('Some benchmarks failed');
        return results;
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🔬 Testing: ${test.name}`);
      const result = await test.fn();
      console.log(`✅ PASSED: ${test.name}`);
      results.passed++;
      results.tests.push({ name: test.name, status: 'passed', result });
    } catch (error) {
      console.error(`❌ FAILED: ${test.name}`, error);
      results.failed++;
      results.tests.push({ name: test.name, status: 'failed', error });
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Test Suite Results:`);
  console.log(`  Passed: ${results.passed}`);
  console.log(`  Failed: ${results.failed}`);
  console.log(`  Total: ${results.passed + results.failed}`);
  console.log(`${'='.repeat(50)}\n`);

  return results;
}

/**
 * Make test utilities available globally
 */
if (typeof window !== 'undefined') {
  (window as any).SocialTest = {
    enableTestMode,
    createTestPost,
    createTestPosts,
    testReaction,
    testFollow,
    benchmarkApiCalls,
    loadTestPosts,
    runTestSuite
  };

  console.log('🧪 Social Test utilities loaded');
  console.log('💡 Available via window.SocialTest');
  console.log('   - SocialTest.runTestSuite(userId) - Run all tests');
  console.log('   - SocialTest.createTestPost({ authorId }) - Create test post');
  console.log('   - SocialTest.benchmarkApiCalls(authorId) - Benchmark APIs');
}

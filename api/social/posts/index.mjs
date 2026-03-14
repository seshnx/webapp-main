/**
 * Social Posts API
 * Server-side MongoDB operations for social posts
 */

import { initMongoDB, isMongoDbAvailable } from '../../../src/config/mongodb.js';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
  hasUserReposted
} from '../../../src/config/mongoSocial.js';

// Initialize MongoDB on first call
let mongoInitialized = false;
let initPromise = null;

async function ensureMongo() {
  if (!mongoInitialized) {
    if (!initPromise) {
      initPromise = initMongoDB().then(() => {
        mongoInitialized = true;
        console.log('✅ MongoDB initialized for posts API');
      }).catch((error) => {
        console.error('❌ Failed to initialize MongoDB:', error);
        throw error;
      });
    }
    await initPromise;
  }
}

/**
 * GET /api/social/posts
 * Get posts with optional filtering
 */
export async function GET(request) {
  try {
    await ensureMongo();

    if (!isMongoDbAvailable()) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const authorId = url.searchParams.get('author_id');
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const checkRepost = url.searchParams.get('check-repost');
    const userId = url.searchParams.get('user_id');
    const postId = url.searchParams.get('post_id');

    // Get single post by ID
    if (postId) {
      const post = await getPostById(postId);
      if (!post) {
        return new Response(JSON.stringify({ error: 'Post not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check if user has reposted
      if (checkRepost === 'true' && userId) {
        const hasReposted = await hasUserReposted(userId, postId);
        return new Response(JSON.stringify({ post, hasReposted }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(post), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get posts with filters
    const posts = await getPosts({
      authorId,
      category,
      limit,
      skip,
    });

    // Check repost status if requested
    if (checkRepost === 'true' && userId) {
      const postsWithRepostStatus = await Promise.all(
        posts.map(async (post) => ({
          ...post,
          hasReposted: await hasUserReposted(userId, post.id),
        }))
      );

      return new Response(JSON.stringify(postsWithRepostStatus), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`✅ Successfully fetched ${posts.length} posts`);
    return new Response(JSON.stringify(posts), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in posts GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to get posts', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /api/social/posts
 * Create a new post
 */
export async function POST(request) {
  try {
    await ensureMongo();

    if (!isMongoDbAvailable()) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { author_id, text, media_urls, category, parent_id, repost_of_post_id } = body;

    // Validate required fields - text is optional if media is provided
    if (!author_id) {
      return new Response(JSON.stringify({ error: 'Missing required field: author_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!text && !media_urls && !repost_of_post_id) {
      return new Response(JSON.stringify({ error: 'Post must have text, media, or be a repost' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newPost = await createPost({
      author_id,
      content: text,
      media_urls,
      category,
      parent_id,
      repost_of: repost_of_post_id,
    });

    // Broadcast real-time update if Socket.io server is available
    if (global.broadcastNewPost) {
      global.broadcastNewPost(newPost).catch(err =>
        console.error('Failed to broadcast new post:', err)
      );
    }

    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in posts POST:', error);
    return new Response(JSON.stringify({ error: 'Failed to create post', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * PUT /api/social/posts
 * Update a post
 */
export async function PUT(request) {
  try {
    await ensureMongo();

    if (!isMongoDbAvailable()) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { post_id, author_id, text, media_urls, category } = body;

    if (!post_id) {
      return new Response(JSON.stringify({ error: 'Missing required field: post_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedPost = await updatePost(post_id, {
      content: text,
      media_urls,
      category,
    });

    return new Response(JSON.stringify(updatedPost), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in posts PUT:', error);
    return new Response(JSON.stringify({ error: 'Failed to update post', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * DELETE /api/social/posts
 * Delete a post
 */
export async function DELETE(request) {
  try {
    await ensureMongo();

    if (!isMongoDbAvailable()) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const post_id = url.searchParams.get('post_id');
    const author_id = url.searchParams.get('author_id');

    if (!post_id) {
      return new Response(JSON.stringify({ error: 'Missing required field: post_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deletePost(post_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in posts DELETE:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete post', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

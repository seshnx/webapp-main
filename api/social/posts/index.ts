/**
 * Social Posts API
 * Server-side MongoDB operations for social posts
 */

import { initMongoDB } from '../../../src/config/mongodb';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getPostById,
} from '../../../src/config/mongoSocial';

// Initialize MongoDB on first call
let mongoInitialized = false;

async function ensureMongo() {
  if (!mongoInitialized) {
    await initMongoDB();
    mongoInitialized = true;
  }
}

/**
 * GET /api/social/posts
 * Get posts with optional filtering
 */
export async function GET(request) {
  try {
    await ensureMongo();

    const url = new URL(request.url);
    const authorId = url.searchParams.get('author_id');
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = parseInt(url.searchParams.get('skip') || '0');
    const checkRepost = url.searchParams.get('check-repost');
    const userId = url.searchParams.get('user_id');
    const postId = url.searchParams.get('post_id');

    // Check if user has reposted a post
    if (checkRepost === 'true' && userId && postId) {
      const { hasUserReposted } = await import('../../../src/config/mongoSocial');
      const reposted = await hasUserReposted(userId, postId);
      return new Response(JSON.stringify({ reposted }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }


    const filter = {};
    if (authorId) filter.author_id = authorId;
    if (category) filter.category = category;
    filter.limit = limit;
    filter.skip = skip;

    const posts = await getPosts(filter);

    return new Response(JSON.stringify({ success: true, posts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /api/social/posts
 * Create a new post
 */
export async function POST(request) {
  try {
    await ensureMongo();

    const body = await request.json();
    const { author_id, content, media_urls, category, visibility, parent_id, repost_of, equipment, software, custom_fields } = body;

    if (!author_id || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'author_id and content are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const post = await createPost({
      author_id,
      content,
      media_urls,
      category,
      visibility,
      parent_id,
      repost_of,
      equipment,
      software,
      custom_fields,
    });

    return new Response(JSON.stringify({ success: true, post }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * PATCH /api/social/posts
 * Update a post
 */
export async function PUT(request) {
  try {
    await ensureMongo();

    const body = await request.json();
    const { id, content, media_urls, category, visibility } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'id is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const post = await updatePost(id, { content, media_urls, category, visibility });

    if (!post) {
      return new Response(
        JSON.stringify({ success: false, error: 'Post not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, post }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * DELETE /api/social/posts
 * Delete a post
 */
export async function DELETE(request) {
  try {
    await ensureMongo();

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'id is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const deleted = await deletePost(id);

    return new Response(JSON.stringify({ success: true, deleted }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

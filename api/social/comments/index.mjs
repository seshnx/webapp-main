/**
 * Comments API Endpoint
 * MongoDB post comments
 */

import { initMongoDB, isMongoDbAvailable } from '../../../../src/config/mongodbApi.js';
import {
  getComments as getCommentsFromDb,
  createComment as createCommentInDb,
  updateComment as updateCommentInDb,
  deleteComment as deleteCommentInDb,
} from '../../../../src/config/mongoSocialApi.js';
import {
  syncCommentToConvex,
  updatePostCommentCountConvex
} from '../../../../src/config/convexSync.js';

let mongoInitialized = false;
let initPromise = null;

async function ensureMongo() {
  if (!mongoInitialized) {
    if (!initPromise) {
      initPromise = initMongoDB().then(() => {
        mongoInitialized = true;
        console.log('✅ MongoDB initialized for comments API');
      }).catch((error) => {
        console.error('❌ Failed to initialize MongoDB:', error);
        throw error;
      });
    }
    await initPromise;
  }
}

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
    const post_id = url.searchParams.get('post_id');
    const parent_id = url.searchParams.get('parent_id');
    const author_id = url.searchParams.get('author_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    const comments = await getCommentsFromDb(post_id);

    return new Response(JSON.stringify(comments), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in comments GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to get comments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

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
    const { post_id, author_id, text, content, parent_id, display_name, author_photo } = body;

    // Accept both 'text' and 'content' for compatibility
    const commentContent = text || content;

    if (!post_id || !author_id || !commentContent) {
      console.error('Missing required fields for comment:', { post_id, author_id, commentContent });
      return new Response(JSON.stringify({ error: 'Missing required fields: post_id, author_id, and text/content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newComment = await createCommentInDb({
      post_id,
      author_id,
      content: commentContent,
      parent_id,
      display_name,
      author_photo,
    });

    // Sync to Convex for real-time updates (replaces Socket.IO)
    syncCommentToConvex(newComment);

    // Update post comment count in Convex
    updatePostCommentCountConvex(post_id, -1); // Will be updated by client

    return new Response(JSON.stringify(newComment), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in comments POST:', error);
    return new Response(JSON.stringify({ error: 'Failed to create comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

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
    const { comment_id, author_id, text, content } = body;

    // Accept both 'text' and 'content' for compatibility
    const commentContent = text || content;

    if (!comment_id || !author_id || !commentContent) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedComment = await updateCommentInDb(comment_id, commentContent);

    return new Response(JSON.stringify(updatedComment), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in comments PUT:', error);
    return new Response(JSON.stringify({ error: 'Failed to update comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

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
    const comment_id = url.searchParams.get('comment_id');
    const author_id = url.searchParams.get('author_id');

    if (!comment_id || !author_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await deleteCommentInDb(comment_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in comments DELETE:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

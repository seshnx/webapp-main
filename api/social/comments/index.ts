/**
 * Social Comments API
 */

import { initMongoDB } from '../../../src/config/mongodb';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentReplies,
} from '../../../src/config/mongoSocial';

let mongoInitialized = false;

async function ensureMongo() {
  if (!mongoInitialized) {
    await initMongoDB();
    mongoInitialized = true;
  }
}

/**
 * GET /api/social/comments
 * Get comments for a post
 */
export async function GET(request) {
  try {
    await ensureMongo();

    const url = new URL(request.url);
    const postId = url.searchParams.get('post_id');

    if (!postId) {
      return new Response(
        JSON.stringify({ success: false, error: 'post_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const comments = await getComments(postId);

    return new Response(
      JSON.stringify({ success: true, comments }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/social/comments
 * Create a new comment
 */
export async function POST(request) {
  try {
    await ensureMongo();

    const body = await request.json();
    const { post_id, author_id, content, parent_id } = body;

    if (!post_id || !author_id || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'post_id, author_id, and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const comment = await createComment({
      post_id,
      author_id,
      content,
      parent_id,
    });

    return new Response(
      JSON.stringify({ success: true, comment }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * PATCH /api/social/comments
 * Update a comment (deprecated - use PUT)
 */
export async function PATCH(request) {
  try {
    await ensureMongo();

    const body = await request.json();
    const { id, content } = body;

    if (!id || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'id and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const comment = await updateComment(id, content);

    return new Response(
      JSON.stringify({ success: true, comment }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating comment:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * PUT /api/social/comments
 * Update a comment
 */
export async function PUT(request) {
  try {
    await ensureMongo();

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const { content } = body;

    if (!id || !content) {
      return new Response(
        JSON.stringify({ success: false, error: 'id and content are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const comment = await updateComment(id, content);

    return new Response(
      JSON.stringify({ success: true, comment }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating comment:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * DELETE /api/social/comments
 * Delete a comment
 */
export async function DELETE(request) {
  try {
    await ensureMongo();

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deleted = await deleteComment(id);

    return new Response(
      JSON.stringify({ success: true, deleted }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting comment:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

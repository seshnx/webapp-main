/**
 * Saved Posts API Endpoint
 * MongoDB saved posts (bookmarks)
 */

import { initMongoDB } from '../../../../src/config/mongodb';
import {
  savePost as savePostToDb,
  unsavePost as unsavePostFromDb,
  getSavedPosts as getSavedPostsFromDb,
  isPostSaved,
} from '../../../../src/config/mongoSocial';

export async function GET(request: Request) {
  try {
    await initMongoDB();

    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const postId = url.searchParams.get('post_id');
    const check = url.searchParams.get('check');

    // Check if post is saved
    if (check === 'true' && userId && postId) {
      const saved = await isPostSaved(userId, postId);
      return new Response(JSON.stringify({ saved }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get all saved posts for user
    if (userId) {
      const savedPosts = await getSavedPostsFromDb(userId);
      return new Response(JSON.stringify(savedPosts), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Missing user_id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in saved GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to get saved posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    await initMongoDB();

    const body = await request.json();
    const { user_id, post_id } = body;

    if (!user_id || !post_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await savePostToDb(user_id, post_id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in saved POST:', error);
    return new Response(JSON.stringify({ error: 'Failed to save post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request) {
  try {
    await initMongoDB();

    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const postId = url.searchParams.get('post_id');

    if (!userId || !postId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await unsavePostFromDb(userId, postId);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in saved DELETE:', error);
    return new Response(JSON.stringify({ error: 'Failed to unsave post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

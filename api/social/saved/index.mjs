/**
 * Saved Posts API Endpoint
 * MongoDB saved posts (bookmarks)
 */

import { initMongoDB, isMongoDbAvailable } from '../../../../src/config/mongodbApi.js';
import {
  savePost as savePostToDb,
  unsavePost as unsavePostFromDb,
  getSavedPosts as getSavedPostsFromDb,
  isPostSaved,
} from '../../../../src/config/mongoSocialApi.js';

let mongoInitialized = false;
let initPromise = null;

async function ensureMongo() {
  if (!mongoInitialized) {
    if (!initPromise) {
      initPromise = initMongoDB().then(() => {
        mongoInitialized = true;
        console.log('✅ MongoDB initialized for saved posts API');
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
      console.warn('MongoDB not available for saved posts GET');
      return new Response(JSON.stringify({ error: 'Database not available', saved: false }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const postId = url.searchParams.get('post_id');
    const check = url.searchParams.get('check');

    if (!userId) {
      console.warn('Missing user_id in saved posts GET');
      return new Response(JSON.stringify({ error: 'Missing user_id', saved: false }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if post is saved
    if (check === 'true' && postId) {
      try {
        const saved = await isPostSaved(userId, postId);
        return new Response(JSON.stringify({ saved }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (dbError) {
        console.error('Database error checking saved post:', dbError);
        return new Response(JSON.stringify({ saved: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Get all saved posts for user
    try {
      const savedPosts = await getSavedPostsFromDb(userId);
      return new Response(JSON.stringify(savedPosts || []), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (dbError) {
      console.error('Database error getting saved posts:', dbError);
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in saved GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to get saved posts', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    await ensureMongo();

    if (!isMongoDbAvailable()) {
      console.warn('MongoDB not available for saved posts POST');
      return new Response(JSON.stringify({ error: 'Database not available', success: false }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { user_id, post_id } = body;

    if (!user_id || !post_id) {
      console.warn('Missing required fields in saved posts POST');
      return new Response(JSON.stringify({ error: 'Missing required fields: user_id and post_id', success: false }), {
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
    return new Response(JSON.stringify({ error: 'Failed to save post', details: error.message, success: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request) {
  try {
    await ensureMongo();

    if (!isMongoDbAvailable()) {
      console.warn('MongoDB not available for saved posts DELETE');
      return new Response(JSON.stringify({ error: 'Database not available', success: false }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const postId = url.searchParams.get('post_id');

    if (!userId || !postId) {
      console.warn('Missing required fields in saved posts DELETE');
      return new Response(JSON.stringify({ error: 'Missing required fields: user_id and post_id', success: false }), {
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
    return new Response(JSON.stringify({ error: 'Failed to unsave post', details: error.message, success: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

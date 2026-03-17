/**
 * User Search API Endpoint
 * MongoDB-based user search for chat and other features
 */

import { initMongoDB, isMongoDbAvailable } from '../../../src/config/mongodbApi.js';
import { searchMongoUsers } from '../../../src/config/mongoProfiles.js';

let mongoInitialized = false;
let initPromise = null;

async function ensureMongo() {
  if (!mongoInitialized) {
    if (!initPromise) {
      initPromise = initMongoDB().then(() => {
        mongoInitialized = true;
        console.log('✅ MongoDB initialized for user search API');
      }).catch((error) => {
        console.error('❌ Failed to initialize MongoDB:', error);
        throw error;
      });
    }
    await initPromise;
  }
}

/**
 * GET /api/user/search
 * Search for users by name, username, or bio
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
    const query = url.searchParams.get('q');
    const excludeUserId = url.searchParams.get('exclude_user_id');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const activeProfile = url.searchParams.get('active_profile');

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Search users
    let results = await searchMongoUsers(query, {
      active_profile: activeProfile || undefined,
      limit,
    });

    // Filter out the searching user
    if (excludeUserId) {
      results = results.filter(user => user._id !== excludeUserId);
    }

    // Transform to match expected format
    const transformed = results.map(user => ({
      id: user._id,
      firstName: user.first_name || user.display_name?.split(' ')[0] || '',
      lastName: user.last_name || user.display_name?.split(' ').slice(1).join(' ') || '',
      photoURL: user.primary_photo || user.photos?.[0] || '',
      role: user.active_profile || 'User',
      displayName: user.display_name,
      username: user.username,
    }));

    return new Response(JSON.stringify(transformed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in user search GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to search users', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

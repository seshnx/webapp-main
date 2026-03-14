/**
 * Reactions API Endpoint
 * MongoDB likes and emoji reactions
 */

import { initMongoDB, isMongoDbAvailable } from '../../../../src/config/mongodbApi.js';
import {
  toggleReaction as toggleReactionInDb,
  getReactions as getReactionsFromDb,
  getUserReaction,
} from '../../../../src/config/mongoSocialApi.js';

let mongoInitialized = false;
let initPromise = null;

async function ensureMongo() {
  if (!mongoInitialized) {
    if (!initPromise) {
      initPromise = initMongoDB().then(() => {
        mongoInitialized = true;
        console.log('✅ MongoDB initialized for reactions API');
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
    const target_id = url.searchParams.get('target_id');
    const target_type = url.searchParams.get('target_type');
    const user_id = url.searchParams.get('user_id');

    if (target_id && target_type) {
      if (user_id) {
        // Get specific user's reaction
        const reaction = await getUserReaction(target_id, target_type, user_id);
        return new Response(JSON.stringify({ reaction }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        // Get all reactions for target
        const reactions = await getReactionsFromDb(target_id, target_type);
        return new Response(JSON.stringify(reactions), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Missing target_id or target_type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reactions GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to get reactions' }), {
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
    const { user_id, target_id, target_type, emoji } = body;

    if (!user_id || !target_id || !target_type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await toggleReactionInDb(target_id, target_type, emoji, user_id);

    // Broadcast real-time update if Socket.io server is available
    if (global.broadcastReactionUpdate) {
      global.broadcastReactionUpdate(target_id, target_type, {
        id: `${target_id}_${user_id}`,
        target_id,
        target_type,
        emoji,
        user_id,
        created_at: new Date(),
        action: result.action
      }).catch(err =>
        console.error('Failed to broadcast reaction update:', err)
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reactions POST:', error);
    return new Response(JSON.stringify({ error: 'Failed to toggle reaction' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

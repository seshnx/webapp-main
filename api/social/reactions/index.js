/**
 * Reactions API Endpoint
 * MongoDB social reactions
 */

const { initMongoDB, isMongoDbAvailable } = require('../../../src/config/mongodb');
const {
  toggleReaction as toggleReactionInDb,
  getReactions as getReactionsFromDb,
  getReactionSummary,
  getUserReaction
} = require('../../../src/config/mongoSocial');

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

/**
 * GET /api/social/reactions
 * Get reactions for a target (post or comment)
 */
export async function GET(request) {
  try {
    await ensureMongo();

    const url = new URL(request.url);
    const targetId = url.searchParams.get('target_id');
    const targetType = url.searchParams.get('target_type') as 'post' | 'comment';

    if (!targetId || !targetType) {
      return new Response(
        JSON.stringify({ success: false, error: 'target_id and target_type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reactions = await getReactionsFromDb(targetId, targetType);
    const summary = await getReactionSummary(targetId, targetType);

    return new Response(
      JSON.stringify({ success: true, reactions, summary }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        mongoAvailable: isMongoDbAvailable()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/social/reactions
 * Toggle a reaction (add/remove)
 */
export async function POST(request) {
  try {
    await ensureMongo();

    const body = await request.json();
    const { target_id, target_type, emoji, user_id } = body;

    if (!target_id || !target_type || !emoji || !user_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'target_id, target_type, emoji, and user_id are required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await toggleReactionInDb(target_id, targetType, emoji, user_id);

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        mongoAvailable: isMongoDbAvailable()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

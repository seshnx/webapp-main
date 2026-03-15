/**
 * User Settings API Endpoint
 * MongoDB-based user settings storage
 */

import { initMongoDB, isMongoDbAvailable, getMongoDb } from '../../../../src/config/mongodbApi.js';

let mongoInitialized = false;
let initPromise = null;

async function ensureMongo() {
  if (!mongoInitialized) {
    if (!initPromise) {
      initPromise = initMongoDB().then(() => {
        mongoInitialized = true;
        console.log('✅ MongoDB initialized for settings API');
      }).catch((error) => {
        console.error('❌ Failed to initialize MongoDB:', error);
        throw error;
      });
    }
    await initPromise;
  }
}

/**
 * GET /api/user/settings
 * Get user settings
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
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getMongoDb();
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const collection = db.collection('user_settings');
    const settings = await collection.findOne({ user_id: userId });

    if (!settings) {
      // Return default settings if none exist
      return new Response(JSON.stringify({
        theme: 'system',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'auto',
        currency: 'USD',
        accessibility: {
          fontSize: 'medium',
          reducedMotion: false,
          highContrast: false
        }
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(settings), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in settings GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to get settings', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /api/user/settings
 * Save user settings
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
    const { user_id, settings } = body;

    if (!user_id || !settings) {
      return new Response(JSON.stringify({ error: 'Missing required fields: user_id and settings' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getMongoDb();
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const collection = db.collection('user_settings');

    // Upsert settings (update if exists, insert if not)
    const result = await collection.findOneAndUpdate(
      { user_id: user_id },
      {
        $set: {
          ...settings,
          user_id: user_id,
          updated_at: new Date()
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    return new Response(JSON.stringify(result.value), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in settings POST:', error);
    return new Response(JSON.stringify({ error: 'Failed to save settings', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
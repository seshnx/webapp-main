/**
 * User Profiles API Endpoint
 * MongoDB-based user profiles and subprofiles
 */

import { initMongoDB, isMongoDbAvailable, getMongoDb } from '../../../../src/config/mongodbApi.js';

let mongoInitialized = false;
let initPromise = null;

async function ensureMongo() {
  if (!mongoInitialized) {
    if (!initPromise) {
      initPromise = initMongoDB().then(() => {
        mongoInitialized = true;
        console.log('✅ MongoDB initialized for user profiles API');
      }).catch((error) => {
        console.error('❌ Failed to initialize MongoDB:', error);
        throw error;
      });
    }
    await initPromise;
  }
}

/**
 * GET /api/user/profile
 * Get user profile and subprofiles
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

    // Get main user profile
    const profileCollection = db.collection('user_profiles');
    let profile = await profileCollection.findOne({ user_id: userId });

    if (!profile) {
      // Create default profile if none exists
      const defaultProfile = {
        user_id: userId,
        display_name: '',
        bio: '',
        photo_url: null,
        banner_url: null,
        website: '',
        location: '',
        created_at: new Date(),
        updated_at: new Date()
      };

      await profileCollection.insertOne(defaultProfile);
      profile = defaultProfile;
    }

    // Get subprofiles
    const subprofilesCollection = db.collection('user_subprofiles');
    const subprofiles = await subprofilesCollection.find({ user_id: userId }).toArray();

    return new Response(JSON.stringify({
      profile,
      subprofiles: subprofiles.reduce((acc, sub) => {
        acc[sub.role] = sub;
        return acc;
      }, {})
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in user profile GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to get user profile', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * POST /api/user/profile
 * Save user profile and subprofiles
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
    const { user_id, profile, subprofiles } = body;

    if (!user_id) {
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

    const results = {};

    // Update main profile
    if (profile) {
      const profileCollection = db.collection('user_profiles');
      const profileResult = await profileCollection.findOneAndUpdate(
        { user_id: user_id },
        {
          $set: {
            ...profile,
            user_id: user_id,
            updated_at: new Date()
          }
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      );
      results.profile = profileResult.value;
    }

    // Update subprofiles
    if (subprofiles && Array.isArray(subprofiles)) {
      const subprofilesCollection = db.collection('user_subprofiles');

      for (const subprofile of subprofiles) {
        if (subprofile) {
          const { role, ...subData } = subprofile;
          await subprofilesCollection.findOneAndUpdate(
            { user_id: user_id, role: role },
            {
              $set: {
                ...subData,
                user_id: user_id,
                role: role,
                updated_at: new Date()
              }
            },
            {
              upsert: true,
              returnDocument: 'after'
            }
          );
        }
      }

      // Get updated subprofiles
      const updatedSubprofiles = await subprofilesCollection.find({ user_id: user_id }).toArray();
      results.subprofiles = updatedSubprofiles.reduce((acc, sub) => {
        acc[sub.role] = sub;
        return acc;
      }, {});
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in user profile POST:', error);
    return new Response(JSON.stringify({ error: 'Failed to save user profile', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
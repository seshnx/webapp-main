/**
 * Reactions API Endpoint
 * MongoDB social reactions
 */

import { initMongoDB } from '../../../../src/config/mongodb';
import {
  toggleReaction as toggleReactionInDb,
  getReactions as getReactionsFromDb,
} from '../../../../src/config/mongoSocial';

export async function GET(request: Request) {
  try {
    await initMongoDB();

    const url = new URL(request.url);
    const targetId = url.searchParams.get('target_id');
    const targetType = url.searchParams.get('target_type') as 'post' | 'comment';

    if (!targetId || !targetType) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const reactions = await getReactionsFromDb(targetId, targetType);
    return new Response(JSON.stringify(reactions), {
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

export async function POST(request: Request) {
  try {
    await initMongoDB();

    const body = await request.json();
    const { target_id, target_type, emoji, user_id } = body;

    if (!target_id || !target_type || !emoji || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await toggleReactionInDb(target_id, target_type, emoji, user_id);
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

/**
 * Follows API Endpoint
 * MongoDB social follows
 */

import { initMongoDB } from '../../../../src/config/mongodb';
import {
  followUser as followUserInDb,
  unfollowUser as unfollowUserInDb,
  getFollowers as getFollowersFromDb,
  getFollowing as getFollowingFromDb,
} from '../../../../src/config/mongoSocial';

export async function GET(request: Request) {
  try {
    await initMongoDB();

    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const type = url.searchParams.get('type');

    if (type === 'followers' && userId) {
      const followers = await getFollowersFromDb(userId);
      return new Response(JSON.stringify(followers), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (type === 'following' && userId) {
      const following = await getFollowingFromDb(userId);
      return new Response(JSON.stringify(following), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in follows GET:', error);
    return new Response(JSON.stringify({ error: 'Failed to get follows' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    await initMongoDB();

    const body = await request.json();
    const { follower_id, following_id } = body;

    if (!follower_id || !following_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await followUserInDb(follower_id, following_id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in follows POST:', error);
    return new Response(JSON.stringify({ error: 'Failed to follow user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request) {
  try {
    await initMongoDB();

    const url = new URL(request.url);
    const follower_id = url.searchParams.get('follower_id');
    const following_id = url.searchParams.get('following_id');

    if (!follower_id || !following_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await unfollowUserInDb(follower_id, following_id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in follows DELETE:', error);
    return new Response(JSON.stringify({ error: 'Failed to unfollow user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

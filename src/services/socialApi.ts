/**
 * Social API Service
 *
 * All social features now use MongoDB via API endpoints
 */

const API_BASE = '/api/social';

// ============================================================================
// Helper function for API calls
// ============================================================================

async function apiCall(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ============================================================================
// Posts
// ============================================================================

export async function getPosts(filters?: any, limit = 20, skip = 0) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    skip: skip.toString(),
  });

  if (filters?.user_id) params.append('author_id', filters.user_id);
  if (filters?.category) params.append('category', filters.category);

  return apiCall(`/posts?${params}`);
}

export async function createPost(postData: any) {
  return apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

export async function updatePost(postId: string, updates: any) {
  return apiCall(`/posts?id=${postId}`, {
    method: 'PUT',
    body: JSON.stringify({ ...updates, id: postId }),
  });
}

export async function deletePost(postId: string) {
  return apiCall(`/posts?id=${postId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Comments
// ============================================================================

export async function getComments(postId: string) {
  return apiCall(`/comments?post_id=${postId}`);
}

export async function createComment(commentData: any) {
  return apiCall('/comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
}

export async function deleteComment(commentId: string) {
  return apiCall(`/comments?id=${commentId}`, {
    method: 'DELETE',
  });
}

export async function updateComment(commentId: string, content: string) {
  return apiCall(`/comments?id=${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content, id: commentId }),
  });
}

// ============================================================================
// Reactions (via MongoDB API)
// ============================================================================

export async function toggleReaction(
  targetId: string,
  targetType: 'post' | 'comment',
  emoji: string,
  userId: string
) {
  return apiCall('/reactions', {
    method: 'POST',
    body: JSON.stringify({ target_id: targetId, target_type: targetType, emoji, user_id: userId }),
  });
}

export async function getReactions(targetId: string, targetType: 'post' | 'comment') {
  return apiCall(`/reactions?target_id=${targetId}&target_type=${targetType}`);
}

// ============================================================================
// Follows (via MongoDB API)
// ============================================================================

export async function followUser(followerId: string, followingId: string) {
  return apiCall('/follows', {
    method: 'POST',
    body: JSON.stringify({ follower_id: followerId, following_id: followingId }),
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  return apiCall(`/follows?follower_id=${followerId}&following_id=${followingId}`, {
    method: 'DELETE',
  });
}

export async function getFollowers(userId: string) {
  return apiCall(`/follows?user_id=${userId}&type=followers`);
}

export async function getFollowing(userId: string) {
  return apiCall(`/follows?user_id=${userId}&type=following`);
}

// ============================================================================
// Saved Posts (via MongoDB API)
// ============================================================================

export async function savePost(userId: string, postId: string) {
  return apiCall('/saved', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, post_id: postId }),
  });
}

export async function unsavePost(userId: string, postId: string) {
  return apiCall(`/saved?user_id=${userId}&post_id=${postId}`, {
    method: 'DELETE',
  });
}

export async function checkIsSaved(userId: string, postId: string): Promise<boolean> {
  const result = await apiCall(`/saved?user_id=${userId}&post_id=${postId}&check=true`);
  return result.saved;
}

export async function getSavedPosts(userId: string) {
  return apiCall(`/saved?user_id=${userId}`);
}

export async function updatePostSaveCount(postId: string) {
  // Handled internally by API endpoints
}

// ============================================================================
// Reposts (via MongoDB API)
// ============================================================================

export async function repostPost(userId: string, originalPostId: string, comment?: string) {
  return apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify({
      author_id: userId,
      repost_of: originalPostId,
      content: comment || '',
    }),
  });
}

export async function hasUserReposted(userId: string, postId: string): Promise<boolean> {
  const result = await apiCall(`/posts?user_id=${userId}&post_id=${postId}&check-repost=true`);
  return result.reposted;
}

// ============================================================================
// Comments Count Update
// ============================================================================

export async function updatePostCommentCount(postId: string) {
  // Handled internally by API endpoints
}

// ============================================================================
// Helper
// ============================================================================

export async function isSocialApiAvailable(): Promise<boolean> {
  try {
    await apiCall('/health');
    return true;
  } catch {
    return false;
  }
}

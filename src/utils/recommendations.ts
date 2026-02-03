// src/utils/recommendations.ts

interface User {
  id?: string;
  userId?: string;
  genres?: string[];
  zip?: string;
  activeProfileRole?: string;
  accountTypes?: string[];
  [key: string]: any;
}

interface Content {
  id?: string;
  userId?: string;
  timestamp?: number | { toMillis(): number };
  createdAt?: number | { toMillis(): number };
  reactionCount?: number;
  commentCount?: number;
  saveCount?: number;
  [key: string]: any;
}

type TimeRange = '24h' | '7d' | '30d';

/**
 * Calculate similarity between two users based on:
 * - Genre preferences
 * - Location proximity
 * - Role similarity
 * - Account type overlap
 */
export function calculateUserSimilarity(user1: User, user2: User): number {
  if (!user1 || !user2) return 0;

  let similarity = 0;
  let factors = 0;

  // Genre overlap
  if (user1.genres && user2.genres) {
    const genres1 = Array.isArray(user1.genres) ? user1.genres : [];
    const genres2 = Array.isArray(user2.genres) ? user2.genres : [];
    const commonGenres = genres1.filter((g: string) => genres2.includes(g));
    if (genres1.length > 0 || genres2.length > 0) {
      similarity += (commonGenres.length / Math.max(genres1.length, genres2.length)) * 0.3;
      factors += 0.3;
    }
  }

  // Location proximity
  if (user1.zip && user2.zip) {
    if (user1.zip === user2.zip) {
      similarity += 0.2;
    } else if (user1.zip.substring(0, 3) === user2.zip.substring(0, 3)) {
      similarity += 0.1;
    }
    factors += 0.2;
  }

  // Role similarity
  if (user1.activeProfileRole && user2.activeProfileRole) {
    if (user1.activeProfileRole === user2.activeProfileRole) {
      similarity += 0.2;
    }
    factors += 0.2;
  }

  // Account type overlap
  if (user1.accountTypes && user2.accountTypes) {
    const types1 = Array.isArray(user1.accountTypes) ? user1.accountTypes : [];
    const types2 = Array.isArray(user2.accountTypes) ? user2.accountTypes : [];
    const commonTypes = types1.filter((t: string) => types2.includes(t));
    if (types1.length > 0 || types2.length > 0) {
      similarity += (commonTypes.length / Math.max(types1.length, types2.length)) * 0.3;
      factors += 0.3;
    }
  }

  return factors > 0 ? similarity / factors : 0;
}

/**
 * Calculate engagement score for content
 */
export function calculateEngagementScore(content: Content): number {
  const likes = content.reactionCount || 0;
  const comments = content.commentCount || 0;
  const saves = content.saveCount || 0;
  const shares = 0;

  return (likes * 1) + (comments * 2) + (shares * 3) + (saves * 1.5);
}

/**
 * Calculate trending score with time decay
 */
export function calculateTrendingScore(content: Content, timeRange: TimeRange = '7d'): number {
  const engagementScore = calculateEngagementScore(content);

  if (!content.timestamp) return engagementScore;

  const now = Date.now();
  const contentTime = typeof content.timestamp === 'object' && 'toMillis' in content.timestamp
    ? content.timestamp.toMillis()
    : (content.timestamp as number);
  const ageInHours = (now - contentTime) / (1000 * 60 * 60);

  let decayFactor = 1;
  if (timeRange === '24h') {
    decayFactor = Math.exp(-ageInHours / 24);
  } else if (timeRange === '7d') {
    decayFactor = Math.exp(-ageInHours / 168);
  } else if (timeRange === '30d') {
    decayFactor = Math.exp(-ageInHours / 720);
  }

  return engagementScore * decayFactor;
}

/**
 * Get trending content by type
 */
export function getTrendingContent(
  type: string,
  timeRange: TimeRange,
  contentList: Content[],
  limit: number = 10
): Content[] {
  if (!contentList || contentList.length === 0) return [];

  const scored = contentList.map(item => ({
    ...item,
    trendingScore: calculateTrendingScore(item, timeRange)
  }));

  scored.sort((a, b) => (b as any).trendingScore - (a as any).trendingScore);

  return scored.slice(0, limit);
}

/**
 * Get personalized recommendations for a user
 */
export function getPersonalizedRecommendations(
  userId: string,
  type: string,
  allContent: Content[],
  userData: User,
  similarUsers: User[] = [],
  limit: number = 10
): Content[] {
  if (!allContent || allContent.length === 0) return [];

  const filtered = allContent.filter((item: Content) => {
    if (item.userId === userId) return false;
    return true;
  });

  if (similarUsers.length > 0) {
    const similarUserIds = similarUsers.map(u => u.id || u.userId);
    const fromSimilar = filtered.filter(item =>
      similarUserIds.includes(item.userId || item.id || '')
    );
    const others = filtered.filter(item =>
      !similarUserIds.includes(item.userId || item.id || '')
    );

    return [...fromSimilar, ...others].slice(0, limit);
  }

  const scored = filtered.map(item => ({
    ...item,
    engagementScore: calculateEngagementScore(item)
  }));

  (scored as any).sort((a: Content, b: Content) => (b as any).engagementScore - (a as any).engagementScore);

  return scored.slice(0, limit);
}

/**
 * Get recently created content
 */
export function getRecentContent(contentList: Content[], limit: number = 10): Content[] {
  if (!contentList || contentList.length === 0) return [];

  const sorted = [...contentList].sort((a, b) => {
    const timeA = getTimeValue(a);
    const timeB = getTimeValue(b);
    return timeB - timeA;
  });

  return sorted.slice(0, limit);
}

/**
 * Helper to get timestamp from content
 */
function getTimeValue(content: Content): number {
  if (content.timestamp) {
    return typeof content.timestamp === 'object' && 'toMillis' in content.timestamp
      ? content.timestamp.toMillis()
      : (content.timestamp as number);
  }
  if (content.createdAt) {
    return typeof content.createdAt === 'object' && 'toMillis' in content.createdAt
      ? content.createdAt.toMillis()
      : (content.createdAt as number);
  }
  return 0;
}

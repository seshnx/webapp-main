// src/utils/recommendations.js

/**
 * Calculate similarity between two users based on:
 * - Followed users overlap
 * - Liked posts overlap
 * - Genre preferences
 * - Location proximity
 */
export function calculateUserSimilarity(user1, user2) {
    if (!user1 || !user2) return 0;

    let similarity = 0;
    let factors = 0;

    // Genre overlap (if available)
    if (user1.genres && user2.genres) {
        const genres1 = Array.isArray(user1.genres) ? user1.genres : [];
        const genres2 = Array.isArray(user2.genres) ? user2.genres : [];
        const commonGenres = genres1.filter(g => genres2.includes(g));
        if (genres1.length > 0 || genres2.length > 0) {
            similarity += (commonGenres.length / Math.max(genres1.length, genres2.length)) * 0.3;
            factors += 0.3;
        }
    }

    // Location proximity (simple string matching for now)
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
        const commonTypes = types1.filter(t => types2.includes(t));
        if (types1.length > 0 || types2.length > 0) {
            similarity += (commonTypes.length / Math.max(types1.length, types2.length)) * 0.3;
            factors += 0.3;
        }
    }

    // Normalize by factors used
    return factors > 0 ? similarity / factors : 0;
}

/**
 * Calculate engagement score for content
 * Formula: (likes * 1) + (comments * 2) + (shares * 3) + (saves * 1.5)
 */
export function calculateEngagementScore(content) {
    const likes = content.reactionCount || 0;
    const comments = content.commentCount || 0;
    const saves = content.saveCount || 0;
    // Shares not tracked yet, but structure is ready
    const shares = 0;

    return (likes * 1) + (comments * 2) + (shares * 3) + (saves * 1.5);
}

/**
 * Calculate trending score with time decay
 * Recent activity is weighted more heavily
 */
export function calculateTrendingScore(content, timeRange = '7d') {
    const engagementScore = calculateEngagementScore(content);
    
    if (!content.timestamp) return engagementScore;

    const now = Date.now();
    const contentTime = content.timestamp?.toMillis?.() || content.timestamp || now;
    const ageInHours = (now - contentTime) / (1000 * 60 * 60);

    // Time decay factor (exponential decay)
    let decayFactor = 1;
    if (timeRange === '24h') {
        decayFactor = Math.exp(-ageInHours / 24);
    } else if (timeRange === '7d') {
        decayFactor = Math.exp(-ageInHours / 168); // 7 days = 168 hours
    } else if (timeRange === '30d') {
        decayFactor = Math.exp(-ageInHours / 720); // 30 days = 720 hours
    }

    return engagementScore * decayFactor;
}

/**
 * Get trending content by type
 * @param {string} type - Content type ('sounds', 'artists', 'producers', 'studios', 'schools')
 * @param {string} timeRange - Time range ('24h', '7d', '30d')
 * @param {Array} contentList - List of content items
 * @param {number} limit - Maximum number of items to return
 */
export function getTrendingContent(type, timeRange, contentList, limit = 10) {
    if (!contentList || contentList.length === 0) return [];

    // Calculate trending scores
    const scored = contentList.map(item => ({
        ...item,
        trendingScore: calculateTrendingScore(item, timeRange)
    }));

    // Sort by trending score (descending)
    scored.sort((a, b) => b.trendingScore - a.trendingScore);

    return scored.slice(0, limit);
}

/**
 * Get personalized recommendations for a user
 * @param {string} userId - User ID
 * @param {string} type - Content type
 * @param {Array} allContent - All available content
 * @param {Object} userData - Current user's data
 * @param {Array} similarUsers - List of similar users
 * @param {number} limit - Maximum number of recommendations
 */
export function getPersonalizedRecommendations(userId, type, allContent, userData, similarUsers = [], limit = 10) {
    if (!allContent || allContent.length === 0) return [];

    // Filter out content user already follows/likes
    const filtered = allContent.filter(item => {
        // Skip if user is the creator
        if (item.userId === userId) return false;
        
        // Skip if already following (would need following list)
        // This is a simplified version
        
        return true;
    });

    // If we have similar users, prioritize content from them
    if (similarUsers.length > 0) {
        const similarUserIds = similarUsers.map(u => u.id || u.userId);
        const fromSimilar = filtered.filter(item => 
            similarUserIds.includes(item.userId || item.id)
        );
        const others = filtered.filter(item => 
            !similarUserIds.includes(item.userId || item.id)
        );
        
        // Combine: similar users first, then others
        return [...fromSimilar, ...others].slice(0, limit);
    }

    // Otherwise, return by engagement score
    const scored = filtered.map(item => ({
        ...item,
        engagementScore: calculateEngagementScore(item)
    }));

    scored.sort((a, b) => b.engagementScore - a.engagementScore);

    return scored.slice(0, limit);
}

/**
 * Get recently created content
 * @param {Array} contentList - List of content items
 * @param {number} limit - Maximum number of items
 */
export function getRecentContent(contentList, limit = 10) {
    if (!contentList || contentList.length === 0) return [];

    // Sort by timestamp (most recent first)
    const sorted = [...contentList].sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || a.timestamp || a.createdAt?.toMillis?.() || a.createdAt || 0;
        const timeB = b.timestamp?.toMillis?.() || b.timestamp || b.createdAt?.toMillis?.() || b.createdAt || 0;
        return timeB - timeA;
    });

    return sorted.slice(0, limit);
}


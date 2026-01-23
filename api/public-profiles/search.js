import { query as neonQuery } from '../../src/config/neon.js';

/**
 * Search Public Profiles API
 * GET /api/public-profiles/search
 *
 * Searches public profiles by name, email, or username
 * Note: This endpoint does not require authentication (public search)
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, excludeUserIds = '', excludeRosterIds = '' } = req.query;

    if (!query || query.length < 3) {
      return res.status(400).json({ error: 'Query must be at least 3 characters long' });
    }

    const searchLower = `%${query.toLowerCase()}%`;
    const excludeIdsArray = excludeUserIds ? excludeUserIds.split(',') : [];
    const excludeRosterIdsArray = excludeRosterIds ? excludeRosterIds.split(',') : [];

    // Build exclusion parameters
    const allExcludeIds = [...excludeIdsArray, ...excludeRosterIdsArray];
    const excludeParams = allExcludeIds.length > 0 ? allExcludeIds : null;

    // Search public profiles using Neon
    let sql = `
      SELECT DISTINCT
        cu.id,
        cu.first_name,
        cu.last_name,
        cu.email,
        cu.username,
        p.photo_url as avatar_url,
        p.display_name
      FROM clerk_users cu
      LEFT JOIN profiles p ON p.user_id = cu.id
      WHERE (
        cu.username ILIKE $1
        OR cu.email ILIKE $1
        OR p.display_name ILIKE $1
        OR CONCAT(cu.first_name, ' ', cu.last_name) ILIKE $1
      )
    `;

    const queryParams = [searchLower];

    // Add exclusions if provided
    if (excludeParams && excludeParams.length > 0) {
      const placeholders = excludeParams.map((_, i) => `$${i + 2}`).join(', ');
      sql += ` AND cu.id NOT IN (${placeholders})`;
      queryParams.push(...excludeParams);
    }

    sql += ` LIMIT 20`;

    const data = await neonQuery(sql, queryParams);

    // Format results
    const results = (data || []).map(profile => ({
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      photoURL: profile.avatar_url,
      displayName: profile.display_name || profile.username
    }));

    return res.status(200).json({
      success: true,
      data: results,
      message: 'Search completed successfully'
    });
  } catch (error) {
    console.error('Search profiles error:', error);
    return res.status(500).json({ error: error.message });
  }
}
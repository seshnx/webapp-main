import { query } from '../../../../src/config/neon.js';

/**
 * Wallet Balance API
 * GET /api/user/wallets/[userId] - Get user's wallet balance
 */

export default async function handler(req, res) {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Missing user ID' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return getWalletBalance(req, res, userId);
}

async function getWalletBalance(req, res, userId) {
    try {
        const sql = `
            SELECT balance FROM wallets
            WHERE user_id = $1
            LIMIT 1
        `;

        const result = await query(sql, [userId]);

        if (result.length === 0) {
            return res.status(200).json({
                success: true,
                data: { balance: 0 }
            });
        }

        return res.status(200).json({
            success: true,
            data: { balance: result[0].balance || 0 }
        });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return res.status(500).json({
            error: 'Failed to fetch wallet balance',
            message: error.message
        });
    }
}

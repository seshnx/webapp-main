/**
 * POST /api/public/kiosk/:studioId/unlock
 *
 * Verifies unlock code for kiosk mode
 * Allows manual override of network-based locking
 */
import { query } from '../../../../_config/neon.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studioId } = req.query;
  const { code } = req.body;

  if (!studioId) {
    return res.status(400).json({ error: 'Studio ID is required' });
  }

  if (!code) {
    return res.status(400).json({ error: 'Unlock code is required' });
  }

  try {
    // Get studio's unlock code hash
    const studioResult = await query(
      `
      SELECT kiosk_unlock_code
      FROM profiles
      WHERE id = $1 AND is_studio = true
    `,
      [studioId]
    );

    if (studioResult.length === 0) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const { kiosk_unlock_code } = studioResult[0];

    // If no unlock code is set, generate one and return it
    if (!kiosk_unlock_code) {
      // Generate a random 6-character code
      const newCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      // Hash the code
      const hash = crypto
        .createHash('sha256')
        .update(newCode)
        .digest('hex');

      // Save the hash to database
      await query(
        `
        UPDATE profiles
        SET kiosk_unlock_code = $1
        WHERE id = $2
      `,
        [hash, studioId]
      );

      return res.status(200).json({
        unlocked: true,
        newCode, // Return the new code for the user to save
        message: 'New unlock code generated',
      });
    }

    // Verify the code
    const hash = crypto.createHash('sha256').update(code).digest('hex');

    if (hash === kiosk_unlock_code) {
      return res.status(200).json({
        unlocked: true,
      });
    } else {
      return res.status(200).json({
        unlocked: false,
        error: 'Invalid unlock code',
      });
    }
  } catch (error) {
    console.error('Unlock verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}

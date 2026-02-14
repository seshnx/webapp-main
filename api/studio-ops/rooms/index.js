import { query } from '../../../src/config/neon.ts';

/**
 * Studio Rooms API
 * GET /api/studio-ops/rooms - List rooms for a studio
 * POST /api/studio-ops/rooms - Create a room
 */

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getRooms(req, res);
    } else if (req.method === 'POST') {
        return createRoom(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/rooms
 * Get rooms for a studio
 */
async function getRooms(req, res) {
    try {
        const { studioId } = req.query;

        if (!studioId) {
            return res.status(400).json({
                error: 'Missing required parameter: studioId'
            });
        }

        const sql = `
            SELECT
                id,
                name,
                room_type,
                hourly_rate,
                daily_rate,
                capacity,
                equipment,
                amenities,
                description,
                images,
                is_active,
                created_at,
                updated_at
            FROM venues
            WHERE studio_id = $1
            ORDER BY name ASC
        `;

        const result = await query(sql, [studioId]);

        return res.status(200).json({
            success: true,
            data: result.map(room => ({
                ...room,
                equipment: room.equipment || [],
                amenities: room.amenities || [],
                images: room.images || [],
                created_at: room.created_at ? new Date(room.created_at) : null,
                updated_at: room.updated_at ? new Date(room.updated_at) : null
            }))
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return res.status(500).json({
            error: 'Failed to fetch rooms',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/rooms
 * Create a new room
 */
async function createRoom(req, res) {
    try {
        const {
            studioId,
            name,
            roomType,
            hourlyRate,
            dailyRate,
            capacity,
            equipment,
            amenities,
            description,
            images
        } = req.body;

        // Validation
        if (!studioId || !name) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studioId', 'name']
            });
        }

        const sql = `
            INSERT INTO venues (
                studio_id,
                name,
                room_type,
                hourly_rate,
                daily_rate,
                capacity,
                equipment,
                amenities,
                description,
                images,
                is_active,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW(), NOW())
            RETURNING *
        `;

        const params = [
            studioId,
            name,
            roomType || 'studio',
            hourlyRate || null,
            dailyRate || null,
            capacity || null,
            equipment ? JSON.stringify(equipment) : '[]',
            amenities ? JSON.stringify(amenities) : '[]',
            description || null,
            images ? JSON.stringify(images) : '[]'
        ];

        const result = await query(sql, params);

        return res.status(201).json({
            success: true,
            data: {
                ...result[0],
                equipment: result[0].equipment || [],
                amenities: result[0].amenities || [],
                images: result[0].images || []
            },
            message: 'Room created successfully'
        });
    } catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({
            error: 'Failed to create room',
            message: error.message
        });
    }
}

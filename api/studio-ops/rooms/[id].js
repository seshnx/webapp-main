import { query } from '../../../../src/config/neon.js';

/**
 * Individual Room API
 * GET /api/studio-ops/rooms/[id] - Get room by ID
 * PUT /api/studio-ops/rooms/[id] - Update room
 * DELETE /api/studio-ops/rooms/[id] - Delete room
 */

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing room ID' });
    }

    if (req.method === 'GET') {
        return getRoom(req, res, id);
    } else if (req.method === 'PUT') {
        return updateRoom(req, res, id);
    } else if (req.method === 'DELETE') {
        return deleteRoom(req, res, id);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

async function getRoom(req, res, roomId) {
    try {
        const sql = `
            SELECT * FROM venues WHERE id = $1
        `;

        const result = await query(sql, [roomId]);

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Room not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                ...result[0],
                equipment: result[0].equipment || [],
                amenities: result[0].amenities || [],
                images: result[0].images || []
            }
        });
    } catch (error) {
        console.error('Error fetching room:', error);
        return res.status(500).json({
            error: 'Failed to fetch room',
            message: error.message
        });
    }
}

async function updateRoom(req, res, roomId) {
    try {
        const { name, roomType, hourlyRate, dailyRate, capacity, equipment, amenities, description, images, isActive } = req.body;

        // Check if room exists
        const existing = await query('SELECT id FROM venues WHERE id = $1', [roomId]);

        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Room not found'
            });
        }

        // Build dynamic update query
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            params.push(name);
        }
        if (roomType !== undefined) {
            updates.push(`room_type = $${paramIndex++}`);
            params.push(roomType);
        }
        if (hourlyRate !== undefined) {
            updates.push(`hourly_rate = $${paramIndex++}`);
            params.push(hourlyRate);
        }
        if (dailyRate !== undefined) {
            updates.push(`daily_rate = $${paramIndex++}`);
            params.push(dailyRate);
        }
        if (capacity !== undefined) {
            updates.push(`capacity = $${paramIndex++}`);
            params.push(capacity);
        }
        if (equipment !== undefined) {
            updates.push(`equipment = $${paramIndex++}`);
            params.push(JSON.stringify(equipment));
        }
        if (amenities !== undefined) {
            updates.push(`amenities = $${paramIndex++}`);
            params.push(JSON.stringify(amenities));
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            params.push(description);
        }
        if (images !== undefined) {
            updates.push(`images = $${paramIndex++}`);
            params.push(JSON.stringify(images));
        }
        if (isActive !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            params.push(isActive);
        }

        updates.push(`updated_at = NOW()`);
        params.push(roomId);

        const sql = `
            UPDATE venues
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: {
                ...result[0],
                equipment: result[0].equipment || [],
                amenities: result[0].amenities || [],
                images: result[0].images || []
            },
            message: 'Room updated successfully'
        });
    } catch (error) {
        console.error('Error updating room:', error);
        return res.status(500).json({
            error: 'Failed to update room',
            message: error.message
        });
    }
}

async function deleteRoom(req, res, roomId) {
    try {
        // Check if room exists
        const existing = await query('SELECT id FROM venues WHERE id = $1', [roomId]);

        if (existing.length === 0) {
            return res.status(404).json({
                error: 'Room not found'
            });
        }

        await query('DELETE FROM venues WHERE id = $1', [roomId]);

        return res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting room:', error);
        return res.status(500).json({
            error: 'Failed to delete room',
            message: error.message
        });
    }
}

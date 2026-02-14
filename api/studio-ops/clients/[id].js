import { query } from '../../../src/config/neon.ts';

/**
 * Individual Client API
 * GET /api/studio-ops/clients/[id] - Get client by ID
 * PUT /api/studio-ops/clients/[id] - Update client
 * DELETE /api/studio-ops/clients/[id] - Delete client
 */

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing client ID' });
    }

    if (req.method === 'GET') {
        return getClient(req, res, id);
    } else if (req.method === 'PUT') {
        return updateClient(req, res, id);
    } else if (req.method === 'DELETE') {
        return deleteClient(req, res, id);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/clients/[id]
 * Get a single client by ID with full details
 */
async function getClient(req, res, clientId) {
    try {
        const sql = `
            SELECT
                sc.*,
                -- Get booking history count
                (
                    SELECT COUNT(*)
                    FROM bookings b
                    WHERE b.sender_id = sc.client_id
                        OR b.studio_owner_id = sc.studio_id
                ) as booking_count,
                -- Get communication count
                (
                    SELECT COUNT(*)
                    FROM client_communications cc
                    WHERE cc.client_id = sc.id
                ) as communication_count
            FROM studio_clients sc
            WHERE sc.id = $1
        `;

        const result = await query(sql, [clientId]);

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Client not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        return res.status(500).json({
            error: 'Failed to fetch client',
            message: error.message
        });
    }
}

/**
 * PUT /api/studio-ops/clients/[id]
 * Update client information
 *
 * Body:
 * - name: Client name (optional)
 * - email: Client email (optional)
 * - phone: Client phone (optional)
 * - company: Client company (optional)
 * - clientType: Client type (optional)
 * - notes: Client notes (optional)
 * - tags: Array of tags (optional)
 */
async function updateClient(req, res, clientId) {
    try {
        const { name, email, phone, company, clientType, notes, tags } = req.body;

        // Check if client exists
        const existingClient = await query(
            'SELECT id FROM studio_clients WHERE id = $1',
            [clientId]
        );

        if (existingClient.length === 0) {
            return res.status(404).json({
                error: 'Client not found'
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
        if (email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            params.push(email);
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramIndex++}`);
            params.push(phone);
        }
        if (company !== undefined) {
            updates.push(`company = $${paramIndex++}`);
            params.push(company);
        }
        if (clientType !== undefined) {
            updates.push(`client_type = $${paramIndex++}`);
            params.push(clientType);
        }
        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex++}`);
            params.push(notes);
        }
        if (tags !== undefined) {
            updates.push(`tags = $${paramIndex++}`);
            params.push(tags);
        }

        // Add updated_at timestamp
        updates.push(`updated_at = NOW()`);

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }

        params.push(clientId);

        const sql = `
            UPDATE studio_clients
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result[0],
            message: 'Client updated successfully'
        });
    } catch (error) {
        console.error('Error updating client:', error);
        return res.status(500).json({
            error: 'Failed to update client',
            message: error.message
        });
    }
}

/**
 * DELETE /api/studio-ops/clients/[id]
 * Delete a client
 */
async function deleteClient(req, res, clientId) {
    try {
        // Check if client exists
        const existingClient = await query(
            'SELECT id, name FROM studio_clients WHERE id = $1',
            [clientId]
        );

        if (existingClient.length === 0) {
            return res.status(404).json({
                error: 'Client not found'
            });
        }

        // Delete client (cascade will handle related records)
        await query('DELETE FROM studio_clients WHERE id = $1', [clientId]);

        return res.status(200).json({
            success: true,
            message: `Client "${existingClient[0].name}" deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        return res.status(500).json({
            error: 'Failed to delete client',
            message: error.message
        });
    }
}

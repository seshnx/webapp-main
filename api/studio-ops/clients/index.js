import { query } from '../../src/config/neon.js';

/**
 * Studio Clients API
 * GET /api/studio-ops/clients - List all clients for a studio
 * POST /api/studio-ops/clients - Create a new client
 */

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getClients(req, res);
    } else if (req.method === 'POST') {
        return createClient(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/clients
 * Get all clients for a studio
 *
 * Query params:
 * - studioId: Studio UUID (required)
 * - clientType: Filter by client type (optional)
 * - search: Search term for name/email/company (optional)
 */
async function getClients(req, res) {
    try {
        const { studioId, clientType, search } = req.query;

        if (!studioId) {
            return res.status(400).json({ error: 'Missing required parameter: studioId' });
        }

        let sql = `
            SELECT
                id,
                studio_id,
                client_id,
                name,
                email,
                phone,
                company,
                tags,
                client_type,
                notes,
                total_bookings,
                total_spent,
                first_booking_date,
                last_booking_date,
                created_at,
                updated_at
            FROM studio_clients
            WHERE studio_id = $1
        `;
        const params = [studioId];

        // Filter by client type
        if (clientType) {
            sql += ` AND client_type = $2`;
            params.push(clientType);
        }

        // Search functionality
        if (search) {
            const searchParam = clientType ? `$3` : `$2`;
            sql += ` AND (
                name ILIKE ${searchParam} OR
                email ILIKE ${searchParam} OR
                company ILIKE ${searchParam}
            )`;
            params.push(`%${search}%`);
        }

        // Order by last booking date (most recent first), then created date
        sql += ` ORDER BY
            CASE WHEN last_booking_date IS NULL THEN 1 ELSE 0 END,
            last_booking_date DESC NULLS LAST,
            created_at DESC
        `;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return res.status(500).json({
            error: 'Failed to fetch clients',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/clients
 * Create a new client
 *
 * Body:
 * - studioId: Studio UUID (required)
 * - clientId: Platform user UUID (optional, for platform users)
 * - name: Client name (required)
 * - email: Client email (optional)
 * - phone: Client phone (optional)
 * - company: Client company (optional)
 * - clientType: Client type (vip, regular, prospect, inactive) (required)
 * - notes: Client notes (optional)
 */
async function createClient(req, res) {
    try {
        const {
            studioId,
            clientId,
            name,
            email,
            phone,
            company,
            clientType,
            notes
        } = req.body;

        // Validation
        if (!studioId || !name || !clientType) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studioId', 'name', 'clientType']
            });
        }

        // Validate client type
        const validClientTypes = ['vip', 'regular', 'prospect', 'inactive'];
        if (!validClientTypes.includes(clientType)) {
            return res.status(400).json({
                error: 'Invalid client type',
                validTypes: validClientTypes
            });
        }

        // Check if client already exists (for platform users)
        if (clientId) {
            const existingClient = await query(
                `SELECT id FROM studio_clients WHERE studio_id = $1 AND client_id = $2`,
                [studioId, clientId]
            );

            if (existingClient.length > 0) {
                return res.status(409).json({
                    error: 'Client already exists',
                    clientId: existingClient[0].id
                });
            }
        }

        // Insert new client
        const sql = `
            INSERT INTO studio_clients (
                studio_id,
                client_id,
                name,
                email,
                phone,
                company,
                client_type,
                notes,
                tags,
                total_bookings,
                total_spent,
                first_booking_date,
                last_booking_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const params = [
            studioId,
            clientId || null,
            name,
            email || null,
            phone || null,
            company || null,
            clientType,
            notes || null,
            '{}', // Empty tags array
            0,    // total_bookings
            0,    // total_spent
            null, // first_booking_date
            null  // last_booking_date
        ];

        const result = await query(sql, params);

        return res.status(201).json({
            success: true,
            data: result[0],
            message: 'Client created successfully'
        });
    } catch (error) {
        console.error('Error creating client:', error);

        // Handle unique constraint violations
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Client already exists',
                message: 'A client with this information already exists'
            });
        }

        return res.status(500).json({
            error: 'Failed to create client',
            message: error.message
        });
    }
}

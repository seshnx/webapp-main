import { query } from '../../src/config/neon.js';

/**
 * Booking Templates API
 * GET /api/studio-ops/booking-templates - List all templates for a studio
 * POST /api/studio-ops/booking-templates - Create a new template
 */

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getTemplates(req, res);
    } else if (req.method === 'POST') {
        return createTemplate(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/booking-templates
 * Get all booking templates for a studio
 *
 * Query params:
 * - studioId: Studio UUID (required)
 * - isActive: Filter by active status (optional)
 */
async function getTemplates(req, res) {
    try {
        const { studioId, isActive } = req.query;

        if (!studioId) {
            return res.status(400).json({ error: 'Missing required parameter: studioId' });
        }

        let sql = `
            SELECT
                id,
                studio_id,
                name,
                description,
                duration_hours,
                base_price,
                rooms,
                equipment_packages,
                add_on_services,
                is_active,
                created_at,
                updated_at,
                -- Count how many times this template has been used
                (
                    SELECT COUNT(*)
                    FROM bookings b
                    WHERE b.template_id::text = booking_templates.id::text
                ) as usage_count
            FROM booking_templates
            WHERE studio_id = $1
        `;
        const params = [studioId];

        // Filter by active status
        if (isActive !== undefined) {
            sql += ` AND is_active = $2`;
            params.push(isActive === 'true');
        }

        // Order by usage count, then name
        sql += ` ORDER BY usage_count DESC, name ASC`;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error('Error fetching booking templates:', error);
        return res.status(500).json({
            error: 'Failed to fetch booking templates',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/booking-templates
 * Create a new booking template
 *
 * Body:
 * - studioId: Studio UUID (required)
 * - name: Template name (required)
 * - description: Template description (optional)
 * - durationHours: Duration in hours (required)
 * - basePrice: Base price (required)
 * - rooms: Array of room objects (optional)
 * - equipmentPackages: Array of equipment packages (optional)
 * - addOnServices: Array of add-on services (optional)
 * - isActive: Active status (optional, default: true)
 */
async function createTemplate(req, res) {
    try {
        const {
            studioId,
            name,
            description,
            durationHours,
            basePrice,
            rooms,
            equipmentPackages,
            addOnServices,
            isActive
        } = req.body;

        // Validation
        if (!studioId || !name || !durationHours || basePrice === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studioId', 'name', 'durationHours', 'basePrice']
            });
        }

        // Insert new template
        const sql = `
            INSERT INTO booking_templates (
                studio_id,
                name,
                description,
                duration_hours,
                base_price,
                rooms,
                equipment_packages,
                add_on_services,
                is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const params = [
            studioId,
            name,
            description || null,
            parseFloat(durationHours),
            parseFloat(basePrice),
            rooms && rooms.length > 0 ? JSON.stringify(rooms) : '[]',
            equipmentPackages && equipmentPackages.length > 0 ? JSON.stringify(equipmentPackages) : '[]',
            addOnServices && addOnServices.length > 0 ? JSON.stringify(addOnServices) : '[]',
            isActive !== undefined ? isActive : true
        ];

        const result = await query(sql, params);

        return res.status(201).json({
            success: true,
            data: result[0],
            message: 'Booking template created successfully'
        });
    } catch (error) {
        console.error('Error creating booking template:', error);
        return res.status(500).json({
            error: 'Failed to create booking template',
            message: error.message
        });
    }
}

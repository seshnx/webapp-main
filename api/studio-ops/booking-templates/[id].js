import { query } from '../../../src/config/neon.ts';

/**
 * Individual Booking Template API
 * GET /api/studio-ops/booking-templates/[id] - Get template by ID
 * PUT /api/studio-ops/booking-templates/[id] - Update template
 * DELETE /api/studio-ops/booking-templates/[id] - Delete template
 * POST /api/studio-ops/booking-templates/[id]/use - Create booking from template
 */

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing template ID' });
    }

    if (req.method === 'GET') {
        return getTemplate(req, res, id);
    } else if (req.method === 'PUT') {
        return updateTemplate(req, res, id);
    } else if (req.method === 'DELETE') {
        return deleteTemplate(req, res, id);
    } else if (req.method === 'POST' && req.url.endsWith('/use')) {
        return useTemplate(req, res, id);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/booking-templates/[id]
 * Get a single template by ID
 */
async function getTemplate(req, res, templateId) {
    try {
        const sql = `
            SELECT
                bt.*,
                -- Count how many times this template has been used
                (
                    SELECT COUNT(*)
                    FROM bookings b
                    WHERE b.template_id::text = bt.id::text
                ) as usage_count
            FROM booking_templates bt
            WHERE bt.id = $1
        `;

        const result = await query(sql, [templateId]);

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Booking template not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('Error fetching booking template:', error);
        return res.status(500).json({
            error: 'Failed to fetch booking template',
            message: error.message
        });
    }
}

/**
 * PUT /api/studio-ops/booking-templates/[id]
 * Update booking template
 */
async function updateTemplate(req, res, templateId) {
    try {
        const {
            name,
            description,
            durationHours,
            basePrice,
            rooms,
            equipmentPackages,
            addOnServices,
            isActive
        } = req.body;

        // Check if template exists
        const existingTemplate = await query(
            'SELECT id FROM booking_templates WHERE id = $1',
            [templateId]
        );

        if (existingTemplate.length === 0) {
            return res.status(404).json({
                error: 'Booking template not found'
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
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            params.push(description);
        }
        if (durationHours !== undefined) {
            updates.push(`duration_hours = $${paramIndex++}`);
            params.push(parseFloat(durationHours));
        }
        if (basePrice !== undefined) {
            updates.push(`base_price = $${paramIndex++}`);
            params.push(parseFloat(basePrice));
        }
        if (rooms !== undefined) {
            updates.push(`rooms = $${paramIndex++}`);
            params.push(JSON.stringify(rooms));
        }
        if (equipmentPackages !== undefined) {
            updates.push(`equipment_packages = $${paramIndex++}`);
            params.push(JSON.stringify(equipmentPackages));
        }
        if (addOnServices !== undefined) {
            updates.push(`add_on_services = $${paramIndex++}`);
            params.push(JSON.stringify(addOnServices));
        }
        if (isActive !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            params.push(isActive);
        }

        // Add updated_at timestamp
        updates.push(`updated_at = NOW()`);

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }

        params.push(templateId);

        const sql = `
            UPDATE booking_templates
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result[0],
            message: 'Booking template updated successfully'
        });
    } catch (error) {
        console.error('Error updating booking template:', error);
        return res.status(500).json({
            error: 'Failed to update booking template',
            message: error.message
        });
    }
}

/**
 * DELETE /api/studio-ops/booking-templates/[id]
 * Delete booking template
 */
async function deleteTemplate(req, res, templateId) {
    try {
        // Check if template exists
        const existingTemplate = await query(
            'SELECT id, name FROM booking_templates WHERE id = $1',
            [templateId]
        );

        if (existingTemplate.length === 0) {
            return res.status(404).json({
                error: 'Booking template not found'
            });
        }

        // Check if template is in use
        const usageCheck = await query(
            'SELECT COUNT(*) as count FROM bookings WHERE template_id::text = $1',
            [templateId]
        );

        if (parseInt(usageCheck[0].count) > 0) {
            return res.status(409).json({
                error: 'Cannot delete template',
                message: `This template is used in ${usageCheck[0].count} booking(s). Please deactivate it instead.`
            });
        }

        // Delete template
        await query('DELETE FROM booking_templates WHERE id = $1', [templateId]);

        return res.status(200).json({
            success: true,
            message: `Booking template "${existingTemplate[0].name}" deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting booking template:', error);
        return res.status(500).json({
            error: 'Failed to delete booking template',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/booking-templates/[id]/use
 * Create a booking from a template
 */
async function useTemplate(req, res, templateId) {
    try {
        const { studioId, clientId, date, startTime, notes } = req.body;

        if (!studioId || !clientId || !date || !startTime) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studioId', 'clientId', 'date', 'startTime']
            });
        }

        // Get template details
        const templateResult = await query(
            'SELECT * FROM booking_templates WHERE id = $1 AND is_active = true',
            [templateId]
        );

        if (templateResult.length === 0) {
            return res.status(404).json({
                error: 'Active booking template not found'
            });
        }

        const template = templateResult[0];

        // Create booking from template
        const endTime = new Date(`${date} ${startTime}`);
        endTime.setHours(endTime.getHours() + template.duration_hours);

        const bookingSql = `
            INSERT INTO bookings (
                sender_id,
                studio_owner_id,
                type,
                date,
                start_time,
                end_time,
                duration_hours,
                offer_amount,
                template_id,
                status,
                internal_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const bookingParams = [
            clientId,
            studioId,
            'session',
            date,
            startTime,
            endTime.toTimeString().slice(0, 5),
            template.duration_hours,
            template.base_price,
            templateId,
            'Pending',
            notes || null
        ];

        const bookingResult = await query(bookingSql, bookingParams);

        return res.status(201).json({
            success: true,
            data: {
                booking: bookingResult[0],
                template: template
            },
            message: 'Booking created from template successfully'
        });
    } catch (error) {
        console.error('Error creating booking from template:', error);
        return res.status(500).json({
            error: 'Failed to create booking from template',
            message: error.message
        });
    }
}

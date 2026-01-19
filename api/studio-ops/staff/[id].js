import { query } from '../../../src/config/neon.js';

/**
 * Individual Staff API
 * GET /api/studio-ops/staff/[id] - Get staff member by ID
 * PUT /api/studio-ops/staff/[id] - Update staff member
 * DELETE /api/studio-ops/staff/[id] - Delete staff member
 */

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing staff ID' });
    }

    if (req.method === 'GET') {
        return getStaff(req, res, id);
    } else if (req.method === 'PUT') {
        return updateStaff(req, res, id);
    } else if (req.method === 'DELETE') {
        return deleteStaff(req, res, id);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/staff/[id]
 * Get a single staff member by ID with full details
 */
async function getStaff(req, res, staffId) {
    try {
        const sql = `
            SELECT
                ss.*,
                -- Get shift details
                (
                    SELECT COUNT(*)
                    FROM staff_shifts sshift
                    WHERE sshift.staff_id = ss.id
                ) as total_shifts,
                (
                    SELECT COALESCE(SUM(hours_worked), 0)
                    FROM staff_shifts sshift
                    WHERE sshift.staff_id = ss.id
                ) as hours_worked,
                (
                    SELECT COALESCE(SUM(pay_amount), 0)
                    FROM staff_shifts sshift
                    WHERE sshift.staff_id = ss.id
                ) as total_earnings
            FROM studio_staff ss
            WHERE ss.id = $1
        `;

        const result = await query(sql, [staffId]);

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Staff member not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('Error fetching staff:', error);
        return res.status(500).json({
            error: 'Failed to fetch staff member',
            message: error.message
        });
    }
}

/**
 * PUT /api/studio-ops/staff/[id]
 * Update staff member information
 *
 * Body:
 * - name: Staff name (optional)
 * - email: Staff email (optional)
 * - phone: Staff phone (optional)
 * - role: Staff role (optional)
 * - payRateType: Pay rate type (optional)
 * - payRate: Pay rate amount (optional)
 * - skills: Array of skills (optional)
 * - status: Staff status (optional)
 * - hireDate: Hire date (optional)
 * - availability: JSON object for availability (optional)
 */
async function updateStaff(req, res, staffId) {
    try {
        const {
            name,
            email,
            phone,
            role,
            payRateType,
            payRate,
            skills,
            status,
            hireDate,
            availability
        } = req.body;

        // Check if staff member exists
        const existingStaff = await query(
            'SELECT id FROM studio_staff WHERE id = $1',
            [staffId]
        );

        if (existingStaff.length === 0) {
            return res.status(404).json({
                error: 'Staff member not found'
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
        if (role !== undefined) {
            updates.push(`role = $${paramIndex++}`);
            params.push(role);
        }
        if (payRateType !== undefined) {
            updates.push(`pay_rate_type = $${paramIndex++}`);
            params.push(payRateType);
        }
        if (payRate !== undefined) {
            updates.push(`pay_rate = $${paramIndex++}`);
            params.push(parseFloat(payRate));
        }
        if (skills !== undefined) {
            updates.push(`skills = $${paramIndex++}`);
            params.push(skills);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            params.push(status);
        }
        if (hireDate !== undefined) {
            updates.push(`hire_date = $${paramIndex++}`);
            params.push(hireDate);
        }
        if (availability !== undefined) {
            updates.push(`availability = $${paramIndex++}`);
            params.push(availability);
        }

        // Add updated_at timestamp
        updates.push(`updated_at = NOW()`);

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }

        params.push(staffId);

        const sql = `
            UPDATE studio_staff
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result[0],
            message: 'Staff member updated successfully'
        });
    } catch (error) {
        console.error('Error updating staff:', error);
        return res.status(500).json({
            error: 'Failed to update staff member',
            message: error.message
        });
    }
}

/**
 * DELETE /api/studio-ops/staff/[id]
 * Delete a staff member
 */
async function deleteStaff(req, res, staffId) {
    try {
        // Check if staff member exists
        const existingStaff = await query(
            'SELECT id, name FROM studio_staff WHERE id = $1',
            [staffId]
        );

        if (existingStaff.length === 0) {
            return res.status(404).json({
                error: 'Staff member not found'
            });
        }

        // Delete staff member (cascade will handle related records)
        await query('DELETE FROM studio_staff WHERE id = $1', [staffId]);

        return res.status(200).json({
            success: true,
            message: `Staff member "${existingStaff[0].name}" deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting staff:', error);
        return res.status(500).json({
            error: 'Failed to delete staff member',
            message: error.message
        });
    }
}

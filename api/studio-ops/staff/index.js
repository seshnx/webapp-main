import { query } from '../../src/config/neon.js';

/**
 * Studio Staff API
 * GET /api/studio-ops/staff - List all staff for a studio
 * POST /api/studio-ops/staff - Create a new staff member
 */

export default async function handler(req, res) {
    if (req.method === 'GET') {
        return getStaff(req, res);
    } else if (req.method === 'POST') {
        return createStaff(req, res);
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

/**
 * GET /api/studio-ops/staff
 * Get all staff for a studio
 *
 * Query params:
 * - studioId: Studio UUID (required)
 * - role: Filter by role (optional)
 * - status: Filter by status (optional)
 * - search: Search term for name/email (optional)
 */
async function getStaff(req, res) {
    try {
        const { studioId, role, status, search } = req.query;

        if (!studioId) {
            return res.status(400).json({ error: 'Missing required parameter: studioId' });
        }

        let sql = `
            SELECT
                id,
                studio_id,
                staff_user_id,
                name,
                role,
                pay_rate_type,
                pay_rate,
                skills,
                availability,
                status,
                hire_date,
                created_at,
                updated_at,
                -- Get shift counts and hours from staff_shifts table
                (
                    SELECT COUNT(*)
                    FROM staff_shifts ss
                    WHERE ss.staff_id = studio_staff.id
                ) as total_shifts,
                (
                    SELECT COALESCE(SUM(hours_worked), 0)
                    FROM staff_shifts ss
                    WHERE ss.staff_id = studio_staff.id
                ) as hours_worked,
                (
                    SELECT COALESCE(SUM(pay_amount), 0)
                    FROM staff_shifts ss
                    WHERE ss.staff_id = studio_staff.id
                ) as total_earnings
            FROM studio_staff
            WHERE studio_id = $1
        `;
        const params = [studioId];

        // Filter by role
        if (role) {
            sql += ` AND role = $2`;
            params.push(role);
        }

        // Filter by status
        if (status) {
            const statusParam = role ? `$3` : `$2`;
            sql += ` AND status = ${statusParam}`;
            params.push(status);
        }

        // Search functionality
        if (search) {
            const searchParam = `$${params.length + 1}`;
            sql += ` AND (
                name ILIKE ${searchParam} OR
                staff_user_id::text ILIKE ${searchParam}
            )`;
            params.push(`%${search}%`);
        }

        // Order by hire date (most recent first)
        sql += ` ORDER BY hire_date DESC NULLS LAST, created_at DESC`;

        const result = await query(sql, params);

        return res.status(200).json({
            success: true,
            data: result,
            count: result.length
        });
    } catch (error) {
        console.error('Error fetching staff:', error);
        return res.status(500).json({
            error: 'Failed to fetch staff',
            message: error.message
        });
    }
}

/**
 * POST /api/studio-ops/staff
 * Create a new staff member
 *
 * Body:
 * - studioId: Studio UUID (required)
 * - staffUserId: Platform user UUID (optional, for platform users)
 * - name: Staff member name (required)
 * - email: Staff email (optional)
 * - phone: Staff phone (optional)
 * - role: Staff role (required)
 * - payRateType: Pay rate type (hourly, per_session, percentage, salary) (required)
 * - payRate: Pay rate amount (required)
 * - skills: Array of skills (optional)
 * - status: Staff status (active, inactive, on_leave) (optional, default: active)
 * - hireDate: Hire date (optional)
 * - availability: JSON object for availability (optional)
 */
async function createStaff(req, res) {
    try {
        const {
            studioId,
            staffUserId,
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

        // Validation
        if (!studioId || !name || !role || !payRateType || payRate === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studioId', 'name', 'role', 'payRateType', 'payRate']
            });
        }

        // Validate role
        const validRoles = ['engineer', 'assistant', 'manager', 'intern', 'technician', 'producer', 'other'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                error: 'Invalid role',
                validRoles
            });
        }

        // Validate pay rate type
        const validPayRateTypes = ['hourly', 'per_session', 'percentage', 'salary'];
        if (!validPayRateTypes.includes(payRateType)) {
            return res.status(400).json({
                error: 'Invalid pay rate type',
                validTypes: validPayRateTypes
            });
        }

        // Validate status
        const validStatuses = ['active', 'inactive', 'on_leave'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                validStatuses
            });
        }

        // Insert new staff member
        const sql = `
            INSERT INTO studio_staff (
                studio_id,
                staff_user_id,
                name,
                role,
                pay_rate_type,
                pay_rate,
                skills,
                availability,
                status,
                hire_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const params = [
            studioId,
            staffUserId || null,
            name,
            role,
            payRateType,
            parseFloat(payRate),
            skills && skills.length > 0 ? skills : '{}',
            availability || '{}',
            status || 'active',
            hireDate || null
        ];

        const result = await query(sql, params);

        return res.status(201).json({
            success: true,
            data: result[0],
            message: 'Staff member created successfully'
        });
    } catch (error) {
        console.error('Error creating staff:', error);

        // Handle unique constraint violations
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'Staff member already exists',
                message: 'A staff member with this information already exists'
            });
        }

        return res.status(500).json({
            error: 'Failed to create staff member',
            message: error.message
        });
    }
}

import { authenticateUser } from '../../src/utils/apiAuth.js';
import { query } from '../../src/config/neon.js';

/**
 * Import Students API
 * POST /api/students/import
 *
 * Imports multiple students into the system for a school
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user with Clerk
    const user = await authenticateUser(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { schoolId, students } = req.body;

    if (!schoolId) {
      return res.status(400).json({ error: 'School ID is required' });
    }

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Students data is required and must be an array' });
    }

    // Validate each student has required fields
    const validStudents = students.filter(student =>
      student.email &&
      student.first_name &&
      student.last_name &&
      student.cohort
    );

    if (validStudents.length === 0) {
      return res.status(400).json({ error: 'No valid students found in import data' });
    }

    // Insert students using Neon
    const data = await Promise.all(
      validStudents.map(student =>
        query(
          `INSERT INTO students (
            school_id, email, display_name, first_name, last_name,
            cohort, student_id, status, hours_logged, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          RETURNING *`,
          [
            schoolId,
            student.email,
            `${student.first_name} ${student.last_name}`.trim(),
            student.first_name,
            student.last_name,
            student.cohort,
            null,
            'Enrolled',
            0
          ]
        )
      )
    );

    return res.status(200).json({
      success: true,
      data: data.flat(),
      message: `Successfully imported ${validStudents.length} students`
    });
  } catch (error) {
    console.error('Import students error:', error);
    return res.status(500).json({ error: error.message });
  }
}
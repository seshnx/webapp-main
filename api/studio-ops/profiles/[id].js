import { query } from '../../../../src/config/neon.js';

/**
 * Profile Update API
 * PUT /api/studio-ops/profiles/[id] - Update profile data (rooms, floorplan, etc)
 */

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing profile ID' });
    }

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return updateProfile(req, res, id);
}

async function updateProfile(req, res, profileId) {
    try {
        const {
            rooms, floorplanWalls, floorplanStructures, studioEquipment,
            studioName, profileName, address, city, state, zip, lat, lng,
            studioDescription, email, phoneCell, phoneLand, website, hours,
            amenities, hideAddress, policies, studioPhotos, operatingHours, blackoutDates
        } = req.body;

        // Build dynamic update query
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (rooms !== undefined) {
            updates.push(`rooms = $${paramIndex++}`);
            params.push(JSON.stringify(rooms));
        }
        if (floorplanWalls !== undefined) {
            updates.push(`floorplan_walls = $${paramIndex++}`);
            params.push(JSON.stringify(floorplanWalls));
        }
        if (floorplanStructures !== undefined) {
            updates.push(`floorplan_structures = $${paramIndex++}`);
            params.push(JSON.stringify(floorplanStructures));
        }
        if (studioEquipment !== undefined) {
            updates.push(`studio_equipment = $${paramIndex++}`);
            params.push(JSON.stringify(studioEquipment));
        }
        if (studioName !== undefined) {
            updates.push(`studio_name = $${paramIndex++}`);
            params.push(studioName);
        }
        if (profileName !== undefined) {
            updates.push(`profile_name = $${paramIndex++}`);
            params.push(profileName);
        }
        if (address !== undefined) {
            updates.push(`address = $${paramIndex++}`);
            params.push(address);
        }
        if (city !== undefined) {
            updates.push(`city = $${paramIndex++}`);
            params.push(city);
        }
        if (state !== undefined) {
            updates.push(`state = $${paramIndex++}`);
            params.push(state);
        }
        if (zip !== undefined) {
            updates.push(`zip = $${paramIndex++}`);
            params.push(zip);
        }
        if (lat !== undefined) {
            updates.push(`lat = $${paramIndex++}`);
            params.push(lat);
        }
        if (lng !== undefined) {
            updates.push(`lng = $${paramIndex++}`);
            params.push(lng);
        }
        if (studioDescription !== undefined) {
            updates.push(`studio_description = $${paramIndex++}`);
            params.push(studioDescription);
        }
        if (email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            params.push(email);
        }
        if (phoneCell !== undefined) {
            updates.push(`phone_cell = $${paramIndex++}`);
            params.push(phoneCell);
        }
        if (phoneLand !== undefined) {
            updates.push(`phone_land = $${paramIndex++}`);
            params.push(phoneLand);
        }
        if (website !== undefined) {
            updates.push(`website = $${paramIndex++}`);
            params.push(website);
        }
        if (hours !== undefined) {
            updates.push(`hours = $${paramIndex++}`);
            params.push(hours);
        }
        if (amenities !== undefined) {
            updates.push(`amenities = $${paramIndex++}`);
            params.push(amenities);
        }
        if (hideAddress !== undefined) {
            updates.push(`hide_address = $${paramIndex++}`);
            params.push(hideAddress);
        }
        if (policies !== undefined) {
            updates.push(`policies = $${paramIndex++}`);
            params.push(JSON.stringify(policies));
        }
        if (studioPhotos !== undefined) {
            updates.push(`studio_photos = $${paramIndex++}`);
            params.push(JSON.stringify(studioPhotos));
        }
        if (operatingHours !== undefined) {
            updates.push(`operating_hours = $${paramIndex++}`);
            params.push(JSON.stringify(operatingHours));
        }
        if (blackoutDates !== undefined) {
            updates.push(`blackout_dates = $${paramIndex++}`);
            params.push(JSON.stringify(blackoutDates));
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = NOW(), is_studio = true`);
        params.push(profileId);

        const sql = `
            UPDATE profiles
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await query(sql, params);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        return res.status(200).json({
            success: true,
            data: result[0],
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({
            error: 'Failed to update profile',
            message: error.message
        });
    }
}

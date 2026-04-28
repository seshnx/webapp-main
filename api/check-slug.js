/**
 * Slug Availability Check Endpoint
 *
 * Checks if a slug is available for a given organization type.
 * Works with both normal authentication and development bypass.
 */

import { ConvexHttpClient } from 'convex/browser';
import pkg from '../convex/_generated/api.js';
const { api } = pkg;

const convexUrl = process.env.VITE_CONVEX_URL;
const httpClient = new ConvexHttpClient(convexUrl);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { slug, type } = req.query;

    if (!slug || !type) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['slug', 'type'],
      });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        error: 'Invalid slug format',
        message: 'Slug must only contain lowercase letters, numbers, and hyphens',
      });
    }

    // Validate slug length
    if (slug.length < 3 || slug.length > 50) {
      return res.status(400).json({
        error: 'Invalid slug length',
        message: 'Slug must be between 3 and 50 characters',
      });
    }

    let isAvailable = false;
    let existingRecord = null;

    // Check slug availability based on type
    switch (type.toLowerCase()) {
      case 'studio':
        existingRecord = await httpClient.query(api.studios.getBySlug, { slug });
        isAvailable = !existingRecord;
        break;

      case 'tech':
        // Check tech shops
        const techShops = await httpClient.query(api.techShops.getBySlug, { slug });
        isAvailable = !techShops;
        break;

      case 'label':
        existingRecord = await httpClient.query(api.labels.getBySlug, { slug });
        isAvailable = !existingRecord;
        break;

      case 'edu':
      case 'school':
        existingRecord = await httpClient.query(api.schools.getBySlug, { slug });
        isAvailable = !existingRecord;
        break;

      default:
        return res.status(400).json({
          error: 'Invalid type',
          validTypes: ['studio', 'tech', 'label', 'edu', 'school'],
        });
    }

    // Return availability status
    return res.status(200).json({
      available: isAvailable,
      slug: slug,
      type: type.toLowerCase(),
      existing: existingRecord ? {
        name: existingRecord.name,
        id: existingRecord._id,
      } : null,
    });

  } catch (error) {
    console.error('Slug check error:', error);

    // In development with bypass, default to available if Convex check fails
    if (process.env.NODE_ENV === 'development' && process.env.VITE_CLERK_BYPASS === 'true') {
      console.warn('[DEV BYPASS] Slug check failed, defaulting to available');
      return res.status(200).json({
        available: true,
        slug: req.query.slug,
        type: req.query.type?.toLowerCase(),
        bypassed: true,
      });
    }

    return res.status(500).json({
      error: 'Failed to check slug availability',
      message: error.message,
    });
  }
}

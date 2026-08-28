/**
 * Create Clerk Organization for Studio
 *
 * Called when a studio owner sets up or links a Clerk Organization
 * for billing, role-based access, and membership management.
 *
 * Uses @clerk/backend to create the org server-side.
 */

import { createClerkClient } from '@clerk/backend';
import { fetchQuery, fetchMutation } from 'convex/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studioId, slug, ownerClerkId, studioName } = req.body;

    if (!studioId || !ownerClerkId || !studioName) {
      return res.status(400).json({ error: 'Missing required fields: studioId, ownerClerkId, studioName' });
    }

    const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
    if (!convexUrl) {
      console.error('❌ CONVEX_URL is not configured');
      return res.status(500).json({ error: 'Server configuration error: Convex URL missing' });
    }

    // Verify the caller is authenticated and owns this studio
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret) {
      console.error('❌ CLERK_SECRET_KEY is not configured');
      return res.status(500).json({ error: 'Server configuration error: Clerk secret key missing' });
    }

    const clerkClient = createClerkClient({
      secretKey: clerkSecret,
    });

    // Verify the caller's identity via JWT token or session ID
    let verifiedUserId = null;
    try {
      const verifiedToken = await clerkClient.verifyToken(sessionToken);
      verifiedUserId = verifiedToken?.sub;
    } catch (jwtErr) {
      try {
        const session = await clerkClient.sessions.getSession(sessionToken);
        verifiedUserId = session?.userId;
      } catch (sessErr) {
        console.error('❌ Token verification error:', jwtErr.message);
        return res.status(401).json({ error: 'Invalid or expired session' });
      }
    }

    if (!verifiedUserId || verifiedUserId !== ownerClerkId) {
      return res.status(403).json({ error: 'Not authorized to create org for this studio' });
    }

    const { api } = await import('../../convex/_generated/api.js');

    // Verify studio exists
    const studio = await fetchQuery(convexUrl, api.studios.getStudioById, { studioId });
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    // Resolve caller's Convex user
    const caller = await fetchQuery(convexUrl, api.users.getUserByClerkId, { clerkId: ownerClerkId });
    if (!caller || caller._id !== studio.ownerId) {
      return res.status(403).json({ error: 'Only the studio owner can create an organization' });
    }

    // If studio already has an org, return it
    if (studio.clerkOrgId) {
      return res.status(200).json({
        organizationId: studio.clerkOrgId,
        message: 'Organization already exists',
      });
    }

    const { generateSlug } = await import('../../convex/utils/slugs.js');

    // Clean and compact slug for Clerk requirements (lowercase, letters, numbers, hyphens, min 2 chars)
    const cleanSlug = generateSlug(slug || studio.slug || studioName);

    // Create Clerk Organization
    const org = await clerkClient.organizations.createOrganization({
      name: studioName,
      slug: cleanSlug,
      createdBy: ownerClerkId,
      privateMetadata: {
        studioId: studioId,
        type: 'studio',
      },
    });

    console.log(`✅ Created Clerk org ${org.id} for studio ${studioId} (${cleanSlug})`);

    // Link org back to Convex studio record
    await fetchMutation(convexUrl, api.studios.linkClerkOrg, {
      clerkId: ownerClerkId,
      studioId: studioId,
      clerkOrgId: org.id,
    });

    return res.status(200).json({
      organizationId: org.id,
      name: org.name,
      slug: org.slug,
    });

  } catch (error) {
    console.error('❌ Create org error:', error);

    // Handle slug-already-taken specifically
    if (error.errors?.[0]?.code === 'form_identifier_exists') {
      return res.status(409).json({ error: 'Organization slug already taken', details: error.errors });
    }

    return res.status(500).json({
      error: 'Failed to create organization',
      message: error.message || 'Internal server error',
    });
  }
}

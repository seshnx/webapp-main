/**
 * Create Clerk Organization for Studio
 *
 * Called when a studio owner claims a slug and needs a Clerk Organization
 * for billing and membership management.
 *
 * Uses @clerk/backend to create the org server-side.
 */

import { createClerkClient } from '@clerk/backend';
import { ConvexHttpClient } from 'convex/browser';
import pkg from '../../convex/_generated/api.js';
const { api } = pkg;

const convexUrl = process.env.VITE_CONVEX_URL;
const httpClient = new ConvexHttpClient(convexUrl);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studioId, slug, ownerClerkId, studioName } = req.body;

    if (!studioId || !slug || !ownerClerkId || !studioName) {
      return res.status(400).json({ error: 'Missing required fields: studioId, slug, ownerClerkId, studioName' });
    }

    // Verify the caller is authenticated and owns this studio
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Verify the caller's identity matches ownerClerkId
    const session = await clerkClient.sessions.getSession(sessionToken);
    if (!session || session.userId !== ownerClerkId) {
      return res.status(403).json({ error: 'Not authorized to create org for this studio' });
    }

    // Verify studio exists and belongs to this user
    const studio = await httpClient.query(api.studios.getStudioById, { studioId });
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    // Resolve the caller's Convex user by Clerk ID, then verify they own the studio
    const caller = await httpClient.query(api.users.getUserByClerkId, { clerkId: ownerClerkId });
    if (!caller || caller._id !== studio.ownerId) {
      return res.status(403).json({ error: 'Not the studio owner' });
    }

    // Check if studio already has an org
    if (studio.clerkOrgId) {
      return res.status(200).json({
        organizationId: studio.clerkOrgId,
        message: 'Organization already exists',
      });
    }

    // Create Clerk Organization with tag
    // Org names are tagged with {[STUDIO]} to identify org type on the frontend
    const orgNameWithTag = `${studioName} {[STUDIO]}`;

    const org = await clerkClient.organizations.createOrganization({
      name: orgNameWithTag,
      slug: slug,
      createdBy: ownerClerkId,
      privateMetadata: {
        studioId: studioId,
        type: 'studio',
        tagged: true,  // Flag to indicate this org uses the new tagging system
      },
    });

    console.log(`✅ Created Clerk org ${org.id} for studio ${studioId} (${slug})`);

    // Link org back to Convex studio record
    await httpClient.mutation(api.studios.linkClerkOrg, {
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
      message: error.message,
    });
  }
}

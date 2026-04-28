/**
 * Create Clerk Organization for Label
 *
 * Called when a user wants to register a platform label (record label).
 * Creates a tagged Clerk organization and corresponding Convex record.
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
    const { labelName, slug, ownerClerkId, description, genres } = req.body;

    if (!labelName || !slug || !ownerClerkId) {
      return res.status(400).json({ error: 'Missing required fields: labelName, slug, ownerClerkId' });
    }

    // Verify authentication
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Verify caller identity
    const session = await clerkClient.sessions.getSession(sessionToken);
    if (!session || session.userId !== ownerClerkId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if user already has a label
    const existingLabel = await httpClient.query(api.labels.getByOwner, { ownerClerkId });
    if (existingLabel) {
      return res.status(400).json({ error: 'User already has a label' });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
    }

    // Create Clerk Organization with tag
    const orgNameWithTag = `${labelName} {[LABEL]}`;

    const org = await clerkClient.organizations.createOrganization({
      name: orgNameWithTag,
      slug: slug,
      createdBy: ownerClerkId,
      privateMetadata: {
        type: 'label',
        tagged: true,
      },
    });

    console.log(`✅ Created Clerk org ${org.id} for label (${slug})`);

    // Create label record in Convex
    const labelId = await httpClient.mutation(api.labels.create, {
      clerkId: ownerClerkId,
      name: labelName,
      slug: slug,
      description: description || '',
      genres: genres || [],
      clerkOrgId: org.id,
    });

    // Add Label account type to user
    const user = await clerkClient.users.getUser(ownerClerkId);
    const currentAccountTypes = user.publicMetadata?.accountTypes || [];

    // Add Label if not already present
    if (!currentAccountTypes.includes('Label')) {
      await clerkClient.users.updateUser(ownerClerkId, {
        publicMetadata: {
          accountTypes: [...currentAccountTypes, 'Label'],
        },
      });
    }

    console.log(`✅ Created label ${labelId} and assigned Label role to user`);

    return res.status(200).json({
      organizationId: org.id,
      labelId: labelId,
      name: org.name,
      slug: org.slug,
    });

  } catch (error) {
    console.error('❌ Create label org error:', error);

    // Handle slug-already-taken specifically
    if (error.errors?.[0]?.code === 'form_identifier_exists') {
      return res.status(409).json({ error: 'Organization slug already taken', details: error.errors });
    }

    return res.status(500).json({
      error: 'Failed to create label organization',
      message: error.message,
    });
  }
}

/**
 * Create Clerk Organization for EDU Institution
 *
 * Called when a user wants to launch an educational institution.
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
    const { schoolName, slug, ownerClerkId, description, address } = req.body;

    if (!schoolName || !slug || !ownerClerkId) {
      return res.status(400).json({ error: 'Missing required fields: schoolName, slug, ownerClerkId' });
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

    // Check if user already has a school
    const existingSchool = await httpClient.query(api.schools.getByOwner, { ownerClerkId });
    if (existingSchool) {
      return res.status(400).json({ error: 'User already has a school' });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
    }

    // Create Clerk Organization with tag
    const orgNameWithTag = `${schoolName} {[EDU]}`;

    const org = await clerkClient.organizations.createOrganization({
      name: orgNameWithTag,
      slug: slug,
      createdBy: ownerClerkId,
      privateMetadata: {
        type: 'edu',
        tagged: true,
      },
    });

    console.log(`✅ Created Clerk org ${org.id} for school (${slug})`);

    // Create school record in Convex
    const schoolId = await httpClient.mutation(api.schools.create, {
      clerkId: ownerClerkId,
      name: schoolName,
      slug: slug,
      description: description || '',
      address: address || '',
      clerkOrgId: org.id,
    });

    // Add EDUAdmin account type to user
    const user = await clerkClient.users.getUser(ownerClerkId);
    const currentAccountTypes = user.publicMetadata?.accountTypes || [];

    // Add EDUAdmin if not already present
    if (!currentAccountTypes.includes('EDUAdmin')) {
      await clerkClient.users.updateUser(ownerClerkId, {
        publicMetadata: {
          accountTypes: [...currentAccountTypes, 'EDUAdmin'],
        },
      });
    }

    console.log(`✅ Created school ${schoolId} and assigned EDUAdmin role to user`);

    return res.status(200).json({
      organizationId: org.id,
      schoolId: schoolId,
      name: org.name,
      slug: org.slug,
    });

  } catch (error) {
    console.error('❌ Create edu org error:', error);

    // Handle slug-already-taken specifically
    if (error.errors?.[0]?.code === 'form_identifier_exists') {
      return res.status(409).json({ error: 'Organization slug already taken', details: error.errors });
    }

    return res.status(500).json({
      error: 'Failed to create edu organization',
      message: error.message,
    });
  }
}

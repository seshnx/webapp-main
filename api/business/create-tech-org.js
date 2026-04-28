/**
 * Create Clerk Organization for Tech Shop
 *
 * Called when a user wants to start a tech shop (technical services business).
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
    const { shopName, slug, ownerClerkId, description, services } = req.body;

    if (!shopName || !slug || !ownerClerkId) {
      return res.status(400).json({ error: 'Missing required fields: shopName, slug, ownerClerkId' });
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

    // Check if user already has a tech shop
    const existingShop = await httpClient.query(api.techShops.getByOwner, { ownerClerkId });
    if (existingShop) {
      return res.status(400).json({ error: 'User already has a tech shop' });
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' });
    }

    // Create Clerk Organization with tag
    const orgNameWithTag = `${shopName} {[TECH]}`;

    const org = await clerkClient.organizations.createOrganization({
      name: orgNameWithTag,
      slug: slug,
      createdBy: ownerClerkId,
      privateMetadata: {
        type: 'tech',
        tagged: true,
      },
    });

    console.log(`✅ Created Clerk org ${org.id} for tech shop (${slug})`);

    // Create tech shop record in Convex
    const shopId = await httpClient.mutation(api.techShops.create, {
      clerkId: ownerClerkId,
      name: shopName,
      slug: slug,
      description: description || '',
      services: services || [],
      clerkOrgId: org.id,
    });

    // Add Technician account type to user
    const user = await clerkClient.users.getUser(ownerClerkId);
    const currentAccountTypes = user.publicMetadata?.accountTypes || [];

    // Add Technician if not already present
    if (!currentAccountTypes.includes('Technician')) {
      await clerkClient.users.updateUser(ownerClerkId, {
        publicMetadata: {
          accountTypes: [...currentAccountTypes, 'Technician'],
        },
      });
    }

    console.log(`✅ Created tech shop ${shopId} and assigned Technician role to user`);

    return res.status(200).json({
      organizationId: org.id,
      shopId: shopId,
      name: org.name,
      slug: org.slug,
    });

  } catch (error) {
    console.error('❌ Create tech org error:', error);

    // Handle slug-already-taken specifically
    if (error.errors?.[0]?.code === 'form_identifier_exists') {
      return res.status(409).json({ error: 'Organization slug already taken', details: error.errors });
    }

    return res.status(500).json({
      error: 'Failed to create tech organization',
      message: error.message,
    });
  }
}

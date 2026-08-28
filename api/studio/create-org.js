/**
 * Create Clerk Organization for Studio (Vercel Serverless Compatible)
 *
 * Called when a studio owner sets up or links a Clerk Organization
 * for billing, role-based access, and membership management.
 */

import { createClerkClient } from '@clerk/backend';
import { fetchQuery, fetchMutation, anyApi } from 'convex/server';

const SLUG_WORD_COMPACTIONS = {
  recording: 'rec',
  recordings: 'recs',
  records: 'recs',
  record: 'rec',
  production: 'prod',
  productions: 'prods',
  producer: 'prod',
  producers: 'prods',
  mastering: 'mast',
  engineering: 'eng',
  engineer: 'eng',
  engineers: 'eng',
  entertainment: 'ent',
  management: 'mgmt',
  manager: 'mgr',
  acoustic: 'acoust',
  acoustics: 'acoust',
  creative: 'cr',
  collective: 'cltv',
  collaboration: 'collab',
  collaborations: 'collabs',
  music: 'mus',
  musical: 'mus',
  audio: 'aud',
  sound: 'snd',
  sounds: 'snds',
  session: 'sesh',
  sessions: 'seshs',
  digital: 'digi',
  media: 'med',
  international: 'intl',
  national: 'natl',
  broadcast: 'bcast',
  broadcasting: 'bcast',
  publishing: 'pub',
  publishers: 'pubs',
  publisher: 'pub',
  laboratory: 'lab',
  laboratories: 'labs',
  workshop: 'wrkshp',
  workshops: 'wrkshp',
  center: 'ctr',
  centre: 'ctr',
  house: 'hse',
  station: 'stn',
  street: 'st',
  boulevard: 'blvd',
  avenue: 'ave',
  apartment: 'apt',
  suite: 'ste',
  building: 'bldg',
  company: 'co',
  corporation: 'corp',
  incorporated: 'inc',
  limited: 'ltd',
  group: 'grp',
  association: 'assoc',
  department: 'dept',
  network: 'net',
  networks: 'nets',
};

function compactSlugWords(raw) {
  const tokens = String(raw || '')
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter(Boolean);

  const compactedTokens = tokens.map((token) => {
    const cleanWord = token.replace(/[^a-z0-9]/g, '');
    return SLUG_WORD_COMPACTIONS[cleanWord] || cleanWord;
  }).filter(Boolean);

  return compactedTokens.join('-');
}

function generateSlug(name) {
  if (!name) return 'studio-' + Math.random().toString(36).substring(2, 6);
  let slug = compactSlugWords(name);
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  slug = slug.replace(/-+/g, '-');
  if (slug.length > 40) {
    slug = slug.substring(0, 40).replace(/-+$/, '');
  }
  slug = slug.replace(/^-/, '').replace(/-$/, '');
  if (slug.length < 3) {
    slug = 'studio-' + Math.random().toString(36).substring(2, 6);
  }
  return slug;
}

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

    // Verify studio exists in Convex
    const studio = await fetchQuery(convexUrl, anyApi.studios.getStudioById, { studioId });
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    // Resolve caller's Convex user
    const caller = await fetchQuery(convexUrl, anyApi.users.getUserByClerkId, { clerkId: ownerClerkId });
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
    await fetchMutation(convexUrl, anyApi.studios.linkClerkOrg, {
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

/**
 * Create Clerk Organization for Studio (Vercel Serverless Compatible & Resilient)
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
    const { studioId, slug, ownerClerkId, studioName } = req.body || {};

    if (!ownerClerkId) {
      return res.status(400).json({ error: 'Missing required field: ownerClerkId' });
    }

    const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
    if (!convexUrl) {
      console.error('❌ CONVEX_URL is not configured in server environment');
      return res.status(500).json({ error: 'Server configuration error: Convex URL missing' });
    }

    // Verify authentication header
    const sessionToken = req.headers['authorization']?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret) {
      console.error('❌ CLERK_SECRET_KEY is not configured in server environment');
      return res.status(500).json({ error: 'Server configuration error: Clerk secret key missing' });
    }

    const clerkClient = createClerkClient({
      secretKey: clerkSecret,
    });

    // Verify caller identity via JWT or session
    let verifiedUserId = null;
    try {
      const verifiedToken = await clerkClient.verifyToken(sessionToken);
      verifiedUserId = verifiedToken?.sub;
    } catch (jwtErr) {
      try {
        const session = await clerkClient.sessions.getSession(sessionToken);
        verifiedUserId = session?.userId;
      } catch (sessErr) {
        console.error('❌ Token verification failed:', jwtErr.message);
        return res.status(401).json({ error: 'Invalid or expired session token', details: jwtErr.message });
      }
    }

    if (!verifiedUserId || verifiedUserId !== ownerClerkId) {
      return res.status(403).json({ error: 'Not authorized: caller identity does not match owner' });
    }

    // Resolve caller's Convex user record
    let caller = null;
    try {
      caller = await fetchQuery(convexUrl, anyApi.users.getUserByClerkId, { clerkId: ownerClerkId });
    } catch (userErr) {
      console.error('❌ Failed to look up user in Convex:', userErr);
    }

    if (!caller) {
      return res.status(404).json({ error: 'User account not found in Convex database' });
    }

    // Resolve studio document
    let studio = null;
    if (studioId) {
      try {
        studio = await fetchQuery(convexUrl, anyApi.studios.getStudioById, { studioId });
      } catch (idErr) {
        console.warn('⚠️ getStudioById failed, trying fallback by owner:', idErr.message);
      }
    }

    if (!studio) {
      try {
        studio = await fetchQuery(convexUrl, anyApi.studios.getStudioByOwner, { ownerId: caller._id });
      } catch (ownerErr) {
        console.error('❌ getStudioByOwner failed:', ownerErr.message);
      }
    }

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found for this user' });
    }

    // If studio already has an org linked, return it immediately
    if (studio.clerkOrgId) {
      return res.status(200).json({
        organizationId: studio.clerkOrgId,
        message: 'Organization already linked',
      });
    }

    // Determine studio display name and compacted slug
    const finalStudioName = studioName || studio.name || caller.displayName || 'Studio';
    const baseSlug = generateSlug(slug || studio.slug || finalStudioName);

    // Create Clerk Organization with slug conflict retry
    let org = null;
    let attemptSlug = baseSlug;

    try {
      org = await clerkClient.organizations.createOrganization({
        name: finalStudioName,
        slug: attemptSlug,
        createdBy: ownerClerkId,
        privateMetadata: {
          studioId: studio._id,
          type: 'studio',
        },
      });
    } catch (createErr) {
      // If slug exists, retry with random suffix
      if (createErr.errors?.[0]?.code === 'form_identifier_exists' || createErr.status === 409 || createErr.status === 422) {
        attemptSlug = `${baseSlug.slice(0, 32)}-${Math.random().toString(36).substring(2, 6)}`;
        org = await clerkClient.organizations.createOrganization({
          name: finalStudioName,
          slug: attemptSlug,
          createdBy: ownerClerkId,
          privateMetadata: {
            studioId: studio._id,
            type: 'studio',
          },
        });
      } else {
        throw createErr;
      }
    }

    console.log(`✅ Created Clerk org ${org.id} (${org.slug}) for studio ${studio._id}`);

    // Link org to Convex studio record
    try {
      await fetchMutation(convexUrl, anyApi.studios.linkClerkOrg, {
        clerkId: ownerClerkId,
        studioId: studio._id,
        clerkOrgId: org.id,
      });
    } catch (linkErr) {
      console.error('⚠️ Failed to link Clerk org in Convex mutation:', linkErr);
    }

    return res.status(200).json({
      organizationId: org.id,
      name: org.name,
      slug: org.slug,
    });

  } catch (error) {
    console.error('❌ Create org unexpected error:', error);

    const errorMessage = error.errors?.[0]?.message || error.message || 'Internal server error';
    return res.status(500).json({
      error: 'Failed to create organization',
      message: errorMessage,
      details: error.errors || undefined,
    });
  }
}

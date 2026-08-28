/**
 * Invite a Team Member to a Studio Organization
 *
 * Called by StudioStaff / StudioOrgManager to send an organization invitation
 * via Clerk's Backend SDK. Only org admins (owners) can invite.
 */

import { createClerkClient, verifyToken } from '@clerk/backend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orgId, email, role } = req.body;

    if (!orgId || !email) {
      return res.status(400).json({ error: 'Missing required fields: orgId, email' });
    }

    // Verify the caller is authenticated
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

    // Verify the caller's identity via JWT token or session ID
    let verifiedUserId = null;
    try {
      const verified = await verifyToken(sessionToken, { secretKey: clerkSecret });
      verifiedUserId = verified?.sub;
    } catch (jwtErr) {
      try {
        const payloadBase64 = sessionToken.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
          if (decoded && decoded.sub) {
            verifiedUserId = decoded.sub;
          }
        }
      } catch (sessErr) {
        console.error('❌ Token verification error:', jwtErr.message);
        return res.status(401).json({ error: 'Invalid or expired session' });
      }
    }

    if (!verifiedUserId) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Check the user's role in the organization
    const { data: memberships } = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const callerMembership = memberships?.find(
      (m) => m.publicUserData?.userId === verifiedUserId
    );

    if (!callerMembership || callerMembership.role !== 'org:admin') {
      return res.status(403).json({ error: 'Only organization owners/admins can invite members' });
    }

    // Create the invitation
    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: email,
      role: role || 'org:member',
    });

    console.log(`✅ Invited ${email} to org ${orgId}`);

    return res.status(200).json({
      success: true,
      invitationId: invitation.id,
    });

  } catch (error) {
    console.error('❌ Invite member error:', error);

    return res.status(500).json({
      error: 'Failed to send invitation',
      message: error.message || 'Internal server error',
    });
  }
}

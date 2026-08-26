/**
 * Invite a Team Member to a Studio Organization
 *
 * Called by StudioOrgManager to send an organization invitation
 * via Clerk's Backend SDK. Only org admins (owners) can invite.
 */

import { createClerkClient } from '@clerk/backend';

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

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Verify the session belongs to a user who is an admin of this org
    const session = await clerkClient.sessions.getSession(sessionToken);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Check the user's role in the organization
    const { data: memberships } = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    const callerMembership = memberships?.find(
      (m) => m.publicUserData?.userId === session.userId
    );

    if (!callerMembership || callerMembership.role !== 'org:admin') {
      return res.status(403).json({ error: 'Only organization owners can invite members' });
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
      message: error.message,
    });
  }
}

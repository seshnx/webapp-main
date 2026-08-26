import { useMemo } from 'react';
import { useAuth, useOrganization } from '@clerk/react';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import type { Id } from 'convex/_generated/dataModel';

/**
 * useStudioAuth — Feature-gated auth for studio subdomains
 *
 * Resolves a slug to a studio, then checks whether the current user
 * is the owner, staff member, or a guest. Uses Clerk Organization
 * membership and plan/feature checks for gating.
 *
 * Returns:
 * - studioId: Convex ID of the studio (null if not found)
 * - isOwner: Whether the current user owns this studio
 * - isStaff: Whether the current user is staff of this studio's org
 * - hasPlan: Whether the studio's org has a paid plan
 * - hasFeature: Function to check specific features via Clerk has()
 * - role: The user's role (e.g., "Manager", "Assistant", null)
 * - loading: Whether auth state is still resolving
 */
export function useStudioAuth(slug: string) {
  const { isLoaded: authLoaded, isSignedIn, userId: clerkUserId } = useAuth();
  const { organization, isLoaded: orgLoaded, membership } = useOrganization();

  // Resolve slug → studio auth info (owner ID, org ID)
  const studioAuth = useQuery(
    api.studios.getStudioAuthInfo,
    slug ? { slug } : 'skip'
  );

  return useMemo(() => {
    const loading = !authLoaded || studioAuth === undefined;

    if (loading) {
      return {
        studioId: null,
        isOwner: false,
        isStaff: false,
        hasPlan: false,
        hasFeature: (_f: string) => false,
        role: null,
        loading: true,
      };
    }

    // Studio not found
    if (!studioAuth) {
      return {
        studioId: null,
        isOwner: false,
        isStaff: false,
        hasPlan: false,
        hasFeature: (_f: string) => false,
        role: null,
        loading: false,
      };
    }

    const studioId = studioAuth._id as Id<"studios">;

    // Not signed in → guest
    if (!isSignedIn || !clerkUserId) {
      return {
        studioId,
        isOwner: false,
        isStaff: false,
        hasPlan: false,
        hasFeature: (_f: string) => false,
        role: null,
        loading: false,
      };
    }

    // Check ownership: does the studio's owner match current user?
    const isOwner = studioAuth.ownerClerkId === clerkUserId;

    // Check org membership: is the user a member of the studio's Clerk org?
    const studioOrgId = studioAuth.clerkOrgId;
    const isOrgMember = !!(
      organization &&
      studioOrgId &&
      organization.id === studioOrgId &&
      membership
    );
    const isStaff = isOrgMember && !isOwner;

    // Feature/plan checks via Clerk organization
    const hasPlan = isOrgMember;
    const hasFeature = (feature: string): boolean => {
      if (!isOrgMember || !organization) return false;
      // Clerk's Organization resource exposes has() at runtime for plan/feature checks
      // Cast to any since the type definitions may not include billing methods
      try {
        const org = organization as any;
        return typeof org.has === 'function'
          ? org.has({ feature })
          : false;
      } catch {
        return false;
      }
    };

    // Determine role
    let role: string | null = null;
    if (isOwner) {
      role = 'Owner';
    } else if (membership) {
      // Map Clerk org role to display role
      // @ts-ignore
      const clerkRole = membership.role;
      if (clerkRole === 'org:admin') role = 'Manager';
      else if (clerkRole === 'org:member') role = 'Assistant';
      else role = clerkRole || 'Member';
    }

    return {
      studioId,
      isOwner,
      isStaff,
      hasPlan,
      hasFeature,
      role,
      loading: false,
    };
  }, [authLoaded, isSignedIn, clerkUserId, studioAuth, organization, membership, orgLoaded]);
}

import React from 'react';
import StudioPublicProfile from './studio/StudioPublicProfile';

interface SubdomainRouterProps {
  slug: string;
}

/**
 * SubdomainRouter — Entry point for studio subdomains.
 *
 * Phase 2: Always renders StudioPublicProfile (public studio page).
 * Phase 4: Will add auth-aware dashboard switching:
 *   - Unauthenticated → StudioPublicProfile
 *   - Authenticated (non-member) → StudioPublicProfile (guest)
 *   - Authenticated (member, no plan) → StudioPublicProfile + upgrade banner
 *   - Authenticated (member, paid plan) → StudioSubdomainDashboard
 */
const SubdomainRouter: React.FC<SubdomainRouterProps> = ({ slug }) => {
  return <StudioPublicProfile slug={slug} />;
};

export default SubdomainRouter;

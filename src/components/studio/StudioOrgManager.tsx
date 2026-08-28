import React, { useState } from 'react';
import { useClerk, useOrganizationList, useAuth } from '@clerk/react';
import {
  Building2, Check, ChevronDown, Loader2, Users, Shield,
  AlertTriangle, RefreshCw, Mail, UserPlus
} from 'lucide-react';

/**
 * StudioOrgManager - Custom organization management UI
 *
 * Replaces Clerk's OrganizationSwitcher with a custom component
 * that matches the SeshNx design system. Shows org info and
 * allows switching between studios the user belongs to.
 *
 * Users NEVER create organizations manually — orgs are created
 * silently by StudioSetupWizard via /api/studio/create-org.
 */
export default function StudioOrgManager({ studioId }: { studioId?: string }) {
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  });
  const { orgRole } = useAuth();
  const clerk = useClerk();
  const [expanded, setExpanded] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  // Current active org
  const activeOrg = clerk.organization;
  const memberships = userMemberships?.data;

  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700">
        <div className="flex items-center justify-center py-4">
          <Loader2 size={24} className="animate-spin text-brand-blue" />
        </div>
      </div>
    );
  }

  const [creatingOrg, setCreatingOrg] = useState(false);

  const handleCreateOrg = async () => {
    if (!studioId) return;
    setCreatingOrg(true);
    try {
      const token = await clerk.session?.getToken();
      const res = await fetch('/api/studio/create-org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studioId,
          slug: clerk.user?.username || 'studio-' + Date.now().toString().slice(-6),
          ownerClerkId: clerk.user?.id,
          studioName: clerk.user?.fullName || 'Studio Org',
        })
      });
      const data = await res.json();
      if (res.ok && data.organizationId) {
        await setActive?.({ organization: data.organizationId });
      }
    } catch (e) {
      console.error('Failed to create org:', e);
    } finally {
      setCreatingOrg(false);
    }
  };

  // No org memberships at all
  if (!memberships || memberships.length === 0) {
    return (
      <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700">
        <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-brand-blue" />
          Studio Organization
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                No organization linked
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                Link or create a Clerk Organization for automated staff rosters, role-based access, and client billing.
              </p>
            </div>
          </div>
          {studioId && (
            <button
              onClick={handleCreateOrg}
              disabled={creatingOrg}
              className="px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {creatingOrg ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />}
              Create Clerk Org
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleSwitch = async (orgId: string) => {
    try {
      await setActive?.({ organization: orgId });
      setExpanded(false);
    } catch (err) {
      console.error('Failed to switch organization:', err);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !activeOrg) return;

    setInviting(true);
    try {
      // Use Clerk's Backend API via our endpoint to invite member
      const response = await fetch('/api/studio/invite-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: activeOrg.id,
          email: inviteEmail.trim(),
          role: 'org:member',
        }),
      });

      if (response.ok) {
        setInviteEmail('');
        setInviteSent(true);
        setTimeout(() => setInviteSent(false), 3000);
      } else {
        const data = await response.json().catch(() => ({}));
        console.error('Invite failed:', data.error);
      }
    } catch (err) {
      console.error('Invite error:', err);
    } finally {
      setInviting(false);
    }
  };

  const isOwner = orgRole === 'org:admin' || orgRole === 'admin';

  return (
    <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700">
      <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
        <Building2 size={18} className="text-brand-blue" />
        Studio Organization
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Your studio is backed by an organization for team management and billing.
      </p>

      {/* Active org display */}
      {activeOrg && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              {activeOrg.name?.charAt(0)?.toUpperCase() || <Building2 size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white truncate">
                {activeOrg.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Shield size={12} />
                <span>{isOwner ? 'Owner' : orgRole?.replace('org:', '') || 'Member'}</span>
                {activeOrg.slug && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span>{activeOrg.slug}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Check size={14} />
              <span className="text-xs font-medium">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Org switcher dropdown (only when multiple studios) */}
      {memberships.length > 1 && (
        <div className="relative mb-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1f2128] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Switch Studio ({memberships.length})
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          {expanded && (
            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-[#1f2128] rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg overflow-hidden">
              {memberships.map((membership) => {
                const org = membership.organization;
                const isActive = org.id === activeOrg?.id;

                return (
                  <button
                    key={membership.id}
                    onClick={() => {
                      if (!isActive) handleSwitch(org.id);
                      else setExpanded(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 cursor-default'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gray-400 dark:bg-gray-600'
                    }`}>
                      {org.name?.charAt(0)?.toUpperCase() || <Building2 size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {org.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {membership.role === 'org:admin' ? 'Owner' : membership.role?.replace('org:', '') || 'Member'}
                      </p>
                    </div>
                    {isActive && (
                      <Check size={16} className="text-brand-blue shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Invite team member (only for owners) */}
      {isOwner && activeOrg && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus size={14} className="text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Invite Team Member
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                inviteEmail.trim() && !inviting
                  ? 'bg-brand-blue text-white hover:opacity-90'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {inviting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : inviteSent ? (
                <Check size={14} />
              ) : (
                <Mail size={14} />
              )}
              {inviteSent ? 'Sent!' : 'Invite'}
            </button>
          </div>
        </div>
      )}

      {/* Team info */}
      {activeOrg && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Users size={14} />
              <span>{memberships.length} team member{memberships.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

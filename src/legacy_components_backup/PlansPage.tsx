import React, { useMemo } from 'react';
import { useUser, useAuth, useOrganizationList } from '@clerk/react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Music, GraduationCap, Building2, Star, Check, ArrowRight,
  Zap, Users, ShieldCheck, Crown
} from 'lucide-react';

// =====================================================
// PLAN DEFINITIONS
// =====================================================

interface OrgPlanTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  clerkPlanKey: string;
  targetRole: string[];
  badge?: string;
  highlight?: boolean;
}

const ORG_PLANS: OrgPlanTier[] = [
  {
    id: 'solo-suite',
    name: 'Solo Suite',
    price: '$29',
    period: '/mo',
    description: 'Single room or home studio',
    features: [
      'Studio Management dashboard',
      '1 room',
      'Up to 6 staff (interns excluded)',
      'Basic analytics',
      'Public studio profile page',
      'Booking management',
    ],
    clerkPlanKey: 'org_solo_suite',
    targetRole: ['Studio'],
    badge: 'Starter',
  },
  {
    id: 'pro-studio',
    name: 'Pro Studio',
    price: '$79',
    period: '/mo',
    description: 'Multi-room, single facility',
    features: [
      'Everything in Solo Suite',
      'Unlimited rooms',
      'Unlimited staff',
      'Advanced analytics & reports',
      'Client CRM',
      'Multi-room floorplan builder',
      'Priority support',
    ],
    clerkPlanKey: 'org_pro_studio',
    targetRole: ['Studio'],
    highlight: true,
    badge: 'Popular',
  },
  {
    id: 'studio-network',
    name: 'Studio Network',
    price: '$199',
    period: '/mo',
    description: 'Multi-location studios',
    features: [
      'Everything in Pro Studio',
      'Multiple locations',
      'Per-location admins',
      'Cross-location analytics',
      'Network-wide scheduling',
      'Dedicated account manager',
    ],
    clerkPlanKey: 'org_studio_network',
    targetRole: ['Studio'],
    badge: 'Enterprise',
  },
  {
    id: 'academy',
    name: 'Academy',
    price: '$49',
    period: '/mo',
    description: 'Small local music schools',
    features: [
      'Student management',
      'Student booking',
      'Partial EDU modules',
      '1 location',
      'Up to 6 staff',
      'Kiosk campus mode',
    ],
    clerkPlanKey: 'org_academy',
    targetRole: ['Studio', 'EDUStaff', 'EDUAdmin'],
    badge: 'Education',
  },
  {
    id: 'department',
    name: 'Department',
    price: '$149',
    period: '/mo',
    description: 'University programs',
    features: [
      'Everything in Academy',
      'All EDU modules',
      'Full course management',
      'Cohort scheduling',
      'Evaluations & grading',
      '1 location',
    ],
    clerkPlanKey: 'org_department',
    targetRole: ['EDUStaff', 'EDUAdmin'],
  },
];

interface RoleInfo {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const ROLE_MAP: Record<string, RoleInfo> = {
  Studio: {
    id: 'studio',
    label: 'Studio',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  Agent: {
    id: 'agent',
    label: 'Agent',
    icon: Briefcase,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  Label: {
    id: 'label',
    label: 'Label',
    icon: Music,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
  },
  EDUStaff: {
    id: 'edu',
    label: 'Education',
    icon: GraduationCap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
  },
  EDUAdmin: {
    id: 'edu',
    label: 'Education',
    icon: GraduationCap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
  },
};

// =====================================================
// COMPONENT
// =====================================================

interface PlansPageProps {
  /** Restrict to a specific role. If omitted, auto-detects from user metadata. */
  role?: string;
}

/**
 * PlansPage — Role-aware paywall shown when a user has a role
 * but no paid org plan.
 *
 * - Detects active role from Clerk user metadata
 * - Shows relevant org tiers for that role
 * - CTA links to Clerk billing / Stripe checkout
 */
export default function PlansPage({ role: forcedRole }: PlansPageProps) {
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  // Get user's roles from Clerk metadata
  const userRoles = useMemo(() => {
    const types = (user?.publicMetadata?.account_types as string[]) || [];
    return types;
  }, [user]);

  // Determine which role to show plans for
  const activeRole = forcedRole || userRoles[0] || 'Studio';
  const roleInfo = ROLE_MAP[activeRole] || ROLE_MAP.Studio;
  const RoleIcon = roleInfo.icon;

  // Filter plans for the active role
  const relevantPlans = useMemo(() => {
    return ORG_PLANS.filter(plan =>
      plan.targetRole.some(r => userRoles.includes(r) || r === activeRole)
    );
  }, [activeRole, userRoles]);

  // Check if user already has an active org
  const { isLoaded: orgsLoaded, userMemberships } = useOrganizationList();
  const hasOrg = orgsLoaded && Array.isArray(userMemberships) && userMemberships.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-[#111318] text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${roleInfo.bgColor}`}>
              <RoleIcon size={20} className={roleInfo.color} />
            </div>
            <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">
              {roleInfo.label} Plans
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Unlock Your {roleInfo.label} Dashboard
          </h1>
          <p className="text-gray-400 max-w-xl">
            Choose a plan to access your {roleInfo.label.toLowerCase()} management tools,
            booking system, staff management, and more.
          </p>
        </div>
      </div>

      {/* Active Org Notice */}
      {hasOrg && (
        <div className="max-w-5xl mx-auto px-6 -mt-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
            <ShieldCheck size={20} className="text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                You already have an active organization
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {Array.isArray(userMemberships) ? userMemberships.length : 0} organization{Array.isArray(userMemberships) && userMemberships.length !== 1 ? 's' : ''} linked to your account.
                You can manage billing from your <Link to="/settings" className="underline">Settings</Link>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {relevantPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} isSignedIn={isSignedIn} />
          ))}
        </div>

        {/* Custom / Case-by-case notice */}
        <div className="mt-8 bg-white dark:bg-[#2c2e36] rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          <Crown size={24} className="mx-auto mb-3 text-amber-500" />
          <h3 className="text-lg font-semibold dark:text-white mb-1">
            Need a custom plan?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Agent, Label, and large EDU plans are available on a case-by-case basis.
          </p>
          <a
            href="mailto:plans@seshnx.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Contact Us <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PLAN CARD SUB-COMPONENT
// =====================================================

function PlanCard({ plan, isSignedIn }: { plan: OrgPlanTier; isSignedIn: boolean }) {
  return (
    <div
      className={`relative bg-white dark:bg-[#2c2e36] rounded-xl border-2 overflow-hidden flex flex-col transition-shadow hover:shadow-lg ${
        plan.highlight
          ? 'border-brand-blue shadow-md'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg ${
          plan.highlight
            ? 'bg-brand-blue text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div className="p-6 pb-4">
        <h3 className="text-xl font-bold dark:text-white mb-1">
          {plan.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {plan.description}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold dark:text-white">{plan.price}</span>
          <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 pb-4">
        <ul className="space-y-2.5">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="p-6 pt-4 mt-auto">
        <button
          className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            plan.highlight
              ? 'bg-brand-blue text-white hover:bg-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isSignedIn ? (
            <>
              Get Started <ArrowRight size={16} />
            </>
          ) : (
            <>
              Sign Up to Continue <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

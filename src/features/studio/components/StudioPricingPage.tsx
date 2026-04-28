import React from 'react';
import { PricingTable } from '@clerk/react';
import { useOrganization } from '@clerk/react';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * StudioPricingPage — Clerk PricingTable integration for studio plan upgrades.
 *
 * Renders Clerk's hosted pricing table so studio owners can subscribe to
 * org plans (Solo Suite, Pro Studio, Studio Network) or manage their
 * existing subscription.
 */
export default function StudioPricingPage(): JSX.Element {
  const { organization, isLoaded } = useOrganization();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1d21]">
      {/* Header */}
      <div className="bg-white dark:bg-[#2c2e36] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link
              to="/studio-manager"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <CreditCard size={24} className="text-brand-blue" />
                Studio Plans
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isLoaded && organization
                  ? `Managing plans for ${organization.name}`
                  : 'Subscribe to a studio plan to unlock your dashboard'}
              </p>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} />
              14-day free trial
            </span>
            <span>Cancel anytime</span>
            <span>Secure billing via Stripe</span>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PricingTable
          // Clerk renders the plan cards defined in the Dashboard.
          // The newSubscriptionRedirectUrl sends users back after checkout.
          newSubscriptionRedirectUrl="/studio-manager"
        />
      </div>
    </div>
  );
}

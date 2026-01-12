import React, { useState, useEffect } from 'react';
import { getLabelMetrics, getStudioMetrics, getDistributionMetrics } from '../../config/neonQueries';
import LabelOverviewCard from './LabelOverviewCard';
import StudioOverviewCard from './StudioOverviewCard';
import DistributionOverviewCard from './DistributionOverviewCard';
import { Briefcase, Settings2 } from 'lucide-react';

/**
 * BusinessOverview - Enhanced overview with real-time metrics for each business type
 *
 * Displays sectioned metrics for:
 * - Label operations (artists, releases, revenue, streams)
 * - Studio operations (rooms, bookings)
 * - Distribution (releases)
 */
export default function BusinessOverview({ user, userData, setActiveTab }) {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  // Determine which features the user has access to
  const isStudio = userData?.accountTypes?.includes('Studio');
  const isLabel = userData?.accountTypes?.some(t => ['Label', 'Agent'].includes(t));
  const isArtist = userData?.accountTypes?.some(t => ['Talent', 'Producer', 'Engineer'].includes(t));
  const hasDistribution = isStudio || isLabel || isArtist;

  useEffect(() => {
    const fetchMetrics = async () => {
      const userId = user?.id || user?.uid;
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const results = {};

      try {
        // Fetch metrics based on account types
        if (isLabel) {
          const labelData = await getLabelMetrics(userId);
          results.label = labelData?.[0] || {};
        }

        if (isStudio) {
          const studioData = await getStudioMetrics(userId);
          results.studio = studioData?.[0] || {};
        }

        if (hasDistribution) {
          const distData = await getDistributionMetrics(userId);
          results.distribution = distData?.[0] || {};
        }

        setMetrics(results);
      } catch (error) {
        console.error('Error fetching business metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user?.id, user?.uid, isLabel, isStudio, hasDistribution]);

  // Quick actions based on roles
  const quickActions = [
    {
      id: 'studio',
      title: 'Studio Settings',
      description: 'Configure your studio rooms, rates, and amenities',
      icon: 'Home',
      color: 'blue',
      show: isStudio
    },
    {
      id: 'distribution',
      title: 'New Release',
      description: 'Distribute your music to 150+ streaming platforms',
      icon: 'Globe',
      color: 'green',
      show: hasDistribution
    },
    {
      id: 'roster',
      title: 'Manage Roster',
      description: 'Sign artists and manage your label roster',
      icon: 'Users',
      color: 'purple',
      show: isLabel
    },
  ].filter(a => a.show);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Business Center</h1>
          <p className="text-indigo-100 max-w-xl">
            Manage your studio operations, distribute music, and grow your roster — all in one place.
          </p>
        </div>
      </div>

      {/* Sectioned Metrics */}
      {isLabel && (
        <LabelOverviewCard data={metrics.label} onNavigate={setActiveTab} />
      )}

      {isStudio && (
        <StudioOverviewCard data={metrics.studio} onNavigate={setActiveTab} />
      )}

      {hasDistribution && (
        <DistributionOverviewCard data={metrics.distribution} onNavigate={setActiveTab} />
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
            <Settings2 size={20} className="text-gray-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                className="bg-white dark:bg-[#2c2e36] p-6 rounded-xl border dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-left group hover:border-brand-blue dark:hover:border-brand-blue"
              >
                <h3 className="font-bold dark:text-white mb-1 flex items-center gap-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Business Features Message */}
      {quickActions.length === 0 && !isLabel && !isStudio && !hasDistribution && (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold dark:text-white mb-2">No Business Features Enabled</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Upgrade your account to access studio management, music distribution, and label features.
          </p>
          <p className="text-sm text-gray-400">
            Update your profile to add "Studio", "Talent", "Label", or "Agent" account types.
          </p>
        </div>
      )}
    </div>
  );
}

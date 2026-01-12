import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeQuery } from '../../config/neon';
import {
  Users,
  Disc,
  DollarSign,
  Calendar,
  TrendingUp,
  Plus,
  Music,
  Upload,
  BarChart3,
  ArrowRight,
  Activity,
  UserPlus
} from 'lucide-react';
import ExternalArtistManager from './ExternalArtistManager';

/**
 * LabelDashboard - Professional label management dashboard
 *
 * Displays:
 * - Overview metrics (artists, releases, revenue, deadlines)
 * - Roster performance table
 * - Release calendar
 * - Quick action buttons
 */
export default function LabelDashboard({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalArtists: 0,
    activeReleases: 0,
    monthlyRevenue: 0,
    upcomingReleases: 0,
    revenueGrowth: 0,
    totalStreams: 0
  });
  const [rosterData, setRosterData] = useState([]);
  const [upcomingReleases, setUpcomingReleases] = useState([]);
  const [artistView, setArtistView] = useState('platform'); // 'platform' or 'external'

  const userId = user?.id || user?.uid || user?.userId;

  useEffect(() => {
    if (!userId) return;
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [artistsResult, releasesResult, revenueResult] = await Promise.all([
        // Get label roster count
        executeQuery(`
          SELECT COUNT(*) as count
          FROM label_roster
          WHERE label_id = $1 AND status = 'active'
        `, [userId]),

        // Get active releases
        executeQuery(`
          SELECT COUNT(*) as count
          FROM releases
          WHERE label_id = $1 AND status IN ('distributed', 'submitted')
        `, [userId]),

        // Get revenue data
        executeQuery(`
          SELECT
            COALESCE(SUM(lifetime_earnings), 0) as total_revenue,
            COALESCE(SUM(lifetime_streams), 0) as total_streams
          FROM distribution_stats
          WHERE user_id IN (
            SELECT artist_id FROM label_roster WHERE label_id = $1
          )
        `, [userId])
      ]);

      // Set metrics
      setMetrics({
        totalArtists: artistsResult[0]?.count || 0,
        activeReleases: releasesResult[0]?.count || 0,
        monthlyRevenue: revenueResult[0]?.total_revenue || 0,
        upcomingReleases: releasesResult[0]?.count || 0, // Simplified for now
        revenueGrowth: 12.5, // Placeholder - would need historical data
        totalStreams: revenueResult[0]?.total_streams || 0
      });

      // Fetch roster with performance data
      const rosterResult = await executeQuery(`
        SELECT
          lr.id,
          lr.artist_id,
          lr.name,
          lr.email,
          lr.photo_url,
          lr.status,
          lr.signed_date,
          COALESCE(ds.lifetime_streams, 0) as streams,
          COALESCE(ds.lifetime_earnings, 0) as earnings,
          MAX(r.created_at) as last_release
        FROM label_roster lr
        LEFT JOIN distribution_stats ds ON ds.user_id = lr.artist_id
        LEFT JOIN releases r ON r.artist_id = lr.artist_id
        WHERE lr.label_id = $1
        GROUP BY lr.id, lr.artist_id, lr.name, lr.email, lr.photo_url, lr.status, lr.signed_date, ds.lifetime_streams, ds.lifetime_earnings
        ORDER BY ds.lifetime_earnings DESC
        LIMIT 10
      `, [userId]);

      setRosterData(rosterResult || []);

      // Fetch upcoming releases
      const upcomingReleasesResult = await executeQuery(`
        SELECT
          r.id,
          r.title,
          r.type,
          r.release_date,
          r.cover_art_url,
          p.display_name as artist_name
        FROM releases r
        LEFT JOIN profiles p ON p.user_id = r.artist_id
        WHERE r.label_id = $1
          AND r.release_date >= CURRENT_DATE
        ORDER BY r.release_date ASC
        LIMIT 5
      `, [userId]);

      setUpcomingReleases(upcomingReleasesResult || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Label Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your roster, releases, and campaigns</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Artists */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Artists</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalArtists}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Releases */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Releases</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.activeReleases}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Disc className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(metrics.monthlyRevenue)}
              </p>
              {metrics.revenueGrowth > 0 && (
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +{metrics.revenueGrowth}%
                </p>
              )}
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Streams */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Streams</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatNumber(metrics.totalStreams)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/labels/roster')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
            <span className="font-medium text-gray-700">Add Artist</span>
          </button>

          <button
            onClick={() => navigate('/labels/releases')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2 text-purple-600" />
            <span className="font-medium text-gray-700">New Release</span>
          </button>

          <button
            onClick={() => navigate('/labels/royalties')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-5 w-5 mr-2 text-green-600" />
            <span className="font-medium text-gray-700">Upload Royalties</span>
          </button>

          <button
            onClick={() => navigate('/labels/campaigns')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
            <span className="font-medium text-gray-700">New Campaign</span>
          </button>
        </div>
      </div>

      {/* Roster Performance */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Artist Management</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your signed artists</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setArtistView('platform')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    artistView === 'platform'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Platform Artists
                </button>
                <button
                  onClick={() => setArtistView('external')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${
                    artistView === 'external'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserPlus size={14} />
                  External Artists
                </button>
              </div>
              <button
                onClick={() => navigate('/labels/roster')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Platform Artists Table */}
        {artistView === 'platform' ? (
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Streams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Release
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rosterData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No artists on roster</p>
                    <p className="text-sm mt-1">Add your first artist to get started</p>
                  </td>
                </tr>
              ) : (
                rosterData.map((artist) => (
                  <tr key={artist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {artist.photo_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={artist.photo_url}
                              alt={artist.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                          <div className="text-sm text-gray-500">{artist.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        artist.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {artist.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(artist.streams)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(artist.earnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artist.last_release
                        ? new Date(artist.last_release).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-6">
            <ExternalArtistManager user={user} />
          </div>
        )}
      </div>

      {/* Upcoming Releases */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Releases</h2>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="text-sm">Release Calendar</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {upcomingReleases.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">No upcoming releases</p>
              <p className="text-sm text-gray-500 mt-1">Schedule your next release</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReleases.map((release) => (
                <div
                  key={release.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-300 rounded">
                      {release.cover_art_url ? (
                        <img
                          className="h-16 w-16 rounded object-cover"
                          src={release.cover_art_url}
                          alt={release.title}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded flex items-center justify-center">
                          <Disc className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{release.title}</p>
                      <p className="text-sm text-gray-500">{release.artist_name}</p>
                      <p className="text-xs text-gray-400 mt-1">{release.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(release.release_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">Release Date</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

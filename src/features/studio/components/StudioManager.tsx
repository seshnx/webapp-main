import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, LayoutGrid, Image, Clock, FileText, Calendar,
  Package, Settings, ChevronRight, Briefcase, Users, TrendingUp, LucideIcon, Loader2, AlertTriangle, MonitorPlay, ExternalLink
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';
import { useStudioByOwner, useBookingsByStudio } from '@/hooks/useConvex';
import { BYPASS_ENABLED, bypassClerkOrg, parseOrgTag } from '@/utils/clerkOrgBypass';
// Import sub-components
import StudioOverview from './StudioOverview';
import StudioRooms from './StudioRooms';
import StudioGallery from './StudioGallery';
import StudioAvailability from './StudioAvailability';
import StudioPolicies from './StudioPolicies';
import StudioBookings from './StudioBookings';
import StudioEquipment from './StudioEquipment';
import StudioSettings from './StudioSettings';
import StudioClients from './StudioClients';
import StudioStaff from './StudioStaff';
import StudioAnalytics from './StudioAnalytics';
import StudioSetupWizard from './StudioSetupWizard';
import type { UserData } from '@/types';

// =====================================================
// TYPES & CONSTANTS
// =====================================================

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

type TabId =
  | 'overview'
  | 'rooms'
  | 'equipment'
  | 'gallery'
  | 'availability'
  | 'policies'
  | 'bookings'
  | 'clients'
  | 'staff'
  | 'analytics'
  | 'settings';

interface Booking {
  id: string;
  status: string;
  date?: string;
  created_at: string;
  total_price?: number;
  offer_amount?: number;
}

interface StudioStats {
  pendingBookings: number;
  recentBookings: Booking[];
  totalRevenue: number;
}

interface StudioManagerProps {
  user: {
    id?: string;
    uid?: string;
    [key: string]: any;
  };
  userData: UserData | null;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: Home, description: 'Dashboard & quick stats' },
  { id: 'rooms', label: 'Rooms', icon: LayoutGrid, description: 'Manage studio rooms' },
  { id: 'equipment', label: 'Equipment', icon: Package, description: 'Equipment inventory' },
  { id: 'gallery', label: 'Gallery', icon: Image, description: 'Photo gallery' },
  { id: 'availability', label: 'Hours', icon: Clock, description: 'Operating hours' },
  { id: 'policies', label: 'Policies', icon: FileText, description: 'Rules & pricing' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, description: 'Manage bookings' },
  { id: 'clients', label: 'Clients', icon: Users, description: 'Client database & CRM' },
  { id: 'staff', label: 'Staff', icon: Briefcase, description: 'Staff management & scheduling' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Business insights & reports' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Studio info' },
];

// =====================================================
// COMPONENT
// =====================================================

/**
 * StudioManager - Complete studio management interface with tabbed navigation
 */
export default function StudioManager({ user, userData }: StudioManagerProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<StudioStats>({
    pendingBookings: 0,
    recentBookings: [],
    totalRevenue: 0
  });
  const [localUserData, setLocalUserData] = useState(userData);

  // Get user by clerk ID to get the Convex user ID
  const userRecord = useQuery(
    api.users.getUserByClerkId,
    !BYPASS_ENABLED && (userData?.clerkId || user?.id) ? { clerkId: userData?.clerkId || user?.id } : "skip"
  );

  // Fetch studio data — only query when we have a valid Convex user ID and bypass is not enabled
  const studio = !BYPASS_ENABLED ? useStudioByOwner(userRecord?._id) : createMockStudio(user?.id || userData?.clerkId || 'bypass_user');

  /**
   * Create mock studio data for bypass mode
   */
  function createMockStudio(userId: string) {
    if (!BYPASS_ENABLED) return undefined;

    const mockOrg = bypassClerkOrg('STUDIO', 'Bypass Test Studio');

    return {
      _id: 'bypass_studio_id' as any,
      name: 'Bypass Test Studio {[STUDIO]}',
      slug: 'bypass-test-studio',
      ownerId: 'bypass_user_id' as any,
      clerkOrgId: mockOrg?.id || 'bypass_clerk_org_id',
      description: 'This is a mock studio created for development testing with bypass enabled.',
      location: '123 Bypass Street, Development City',
      city: 'Development',
      state: 'CA',
      zip: '12345',
      coordinates: [34.0522, -118.2437],
      email: 'bypass@test.com',
      phoneCell: '+1-555-0123',
      phoneLand: '+1-555-0124',
      website: 'https://bypass-test.studio',
      hours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: null, close: null, closed: true },
      },
      amenities: ['Recording', 'Mixing', 'Mastering', 'Vocal Booth', 'Lounge', 'Kitchen'],
      hideAddress: false,
      kioskModeEnabled: false,
      kioskEduMode: false,
      kioskAuthorizedNetworks: [],
      kioskNetworkName: '',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      bypassed: true,
    };
  }

  // Fetch booking stats
  useEffect(() => {
    const calculateStats = (): void => {
      if (!studio) return;

      try {
        // For now, set empty stats until bookings are properly integrated
        // TODO: Replace with actual booking query when studio._id is available
        const bookings: Booking[] = [];

        const pending = bookings.filter(b => b.status === 'Pending' || b.status === 'pending').length;
        const recent = bookings
          .filter(b => {
            const bookingDate = b.date ? new Date(b.date) : new Date(b.created_at);
            return bookingDate >= new Date();
          })
          .sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(a.created_at);
            const dateB = b.date ? new Date(b.date) : new Date(b.created_at);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);
        const revenue = bookings
          .filter(b => b.status === 'Completed' || b.status === 'completed')
          .reduce((sum, b) => sum + (Number(b.total_price) || Number(b.offer_amount) || 0), 0);

        setStats({
          pendingBookings: pending,
          recentBookings: recent,
          totalRevenue: revenue
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };

    calculateStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(calculateStats, 30000);
    return () => clearInterval(interval);
  }, [studio]);

  // Handle updates from child components
  const handleUpdate = (updates: Partial<UserData>): void => {
    setLocalUserData(prev => prev ? { ...prev, ...updates } : updates as UserData);
  };

  // Merge studio data with userData
  const mergedUserData = localUserData && studio
    ? {
        ...localUserData,
        studio: {
          ...studio,
          name: studio.name,
          location: studio.location,
          city: studio.city,
          state: studio.state,
          zip: studio.zip,
          coordinates: studio.coordinates,
          email: studio.email,
          phoneCell: studio.phoneCell,
          phoneLand: studio.phoneLand,
          website: studio.website,
          hours: studio.hours,
          amenities: studio.amenities,
          hideAddress: studio.hideAddress,
          kioskModeEnabled: studio.kioskModeEnabled,
          kioskEduMode: studio.kioskEduMode,
          kioskAuthorizedNetworks: studio.kioskAuthorizedNetworks,
          kioskNetworkName: studio.kioskNetworkName,
        }
      }
    : localUserData;

  // Handle navigation from overview
  const handleNavigate = (tabId: TabId): void => {
    setActiveTab(tabId);
  };

  const renderContent = (): JSX.Element => {
    const commonProps = {
      user,
      userData: mergedUserData,
      onUpdate: handleUpdate
    };

    switch (activeTab) {
      case 'overview':
        return <StudioOverview {...commonProps} stats={stats} onNavigate={handleNavigate} />;
      case 'rooms':
        return <StudioRooms {...commonProps} />;
      case 'equipment':
        return <StudioEquipment {...commonProps} />;
      case 'gallery':
        return <StudioGallery {...commonProps} />;
      case 'availability':
        return <StudioAvailability {...commonProps} />;
      case 'policies':
        return <StudioPolicies {...commonProps} />;
      case 'bookings':
        return <StudioBookings {...commonProps} userData={localUserData} />;
      case 'clients':
        return <StudioClients {...commonProps} />;
      case 'staff':
        return <StudioStaff {...commonProps} />;
      case 'analytics':
        return <StudioAnalytics {...commonProps} />;
      case 'settings':
        return <StudioSettings {...commonProps} />;
      default:
        return <StudioOverview {...commonProps} stats={stats} onNavigate={handleNavigate} />;
    }
  };

  const activeTabInfo = TABS.find(t => t.id === activeTab);

  // Loading guard: wait for both userRecord and studio query to resolve
  // before rendering anything. Prevents the full StudioManager UI from
  // flashing before the setup wizard appears.
  // Skip loading state when bypass is enabled
  if (!BYPASS_ENABLED && (userRecord === undefined || studio === undefined)) {
    return (
      <div className="max-w-7xl mx-auto pb-20 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }

  // Show setup wizard when no studio exists (null = query completed with no results)
  // Skip setup wizard when bypass is enabled
  if (!BYPASS_ENABLED && studio === null && userRecord?._id) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <StudioSetupWizard
          clerkId={userData?.clerkId || user?.id}
          onComplete={() => {/* Convex real-time query will auto-update studio */}}
        />
      </div>
    );
  }

  // Show retry wizard when studio exists but has no Clerk org linked
  // (org creation failed on first attempt — user can retry linking)
  // Skip retry wizard when bypass is enabled
  if (!BYPASS_ENABLED && studio && !studio.clerkOrgId && studio.slug && userRecord?._id) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <StudioSetupWizard
          clerkId={userData?.clerkId || user?.id}
          existingStudioId={studio._id}
          existingStudioName={studio.name}
          existingSlug={studio.slug}
          onComplete={() => {/* Convex real-time query will auto-update studio */}}
        />
      </div>
    );
  }

  // Show bypass warning when in bypass mode
  if (BYPASS_ENABLED && studio) {
    console.log('[BYPASS] Studio Manager running in bypass mode with mock studio data');
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Bypass Warning Banner */}
      {BYPASS_ENABLED && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Development Bypass Active
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Studio Manager is running in bypass mode with mock data. This is for development testing only.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Briefcase size={14} />
          <span>Business Center</span>
          <ChevronRight size={14} />
          <span className="text-gray-700 dark:text-gray-200">Studio Manager</span>
          {BYPASS_ENABLED && (
            <>
              <ChevronRight size={14} />
              <span className="text-amber-600 dark:text-amber-500">Bypass Mode</span>
            </>
          )}
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center text-white ${
              BYPASS_ENABLED ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600'
            }`}>
              <Home size={24} />
            </div>
            {localUserData?.studioName || localUserData?.profileName || parseOrgTag(studio?.name || 'Studio Manager').displayName}
          </h1>

          {/* Kiosk launch controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {studio?._id && (
              <a
                href={`/kiosk/${studio._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <MonitorPlay size={16} />
                Launch Kiosk
                <ExternalLink size={13} className="opacity-70" />
              </a>
            )}
            <Link
              to="/kiosk/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
            >
              <MonitorPlay size={16} />
              Preview Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 mb-6 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasBadge = tab.id === 'bookings' && stats.pendingBookings > 0;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 relative ${
                  isActive
                    ? 'border-brand-blue text-brand-blue bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {hasBadge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {stats.pendingBookings}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Description (Mobile) */}
      <div className="md:hidden mb-4 px-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {activeTabInfo?.description}
        </p>
      </div>

      {/* Content */}
      <div className="min-h-[50vh]">
        {renderContent()}
      </div>
    </div>
  );
}

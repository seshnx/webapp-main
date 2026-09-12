import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, LayoutGrid, Image, Clock, FileText, Calendar,
  Package, Settings, ChevronRight, Briefcase, Users, TrendingUp, LucideIcon, Loader2, Building2
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useStudioByOwner, useBookingsByStudio } from '../hooks/useConvex';
// Import sub-components
import StudioOverview from './studio/StudioOverview';
import StudioRooms from './studio/StudioRooms';
import StudioGallery from './studio/StudioGallery';
import StudioAvailability from './studio/StudioAvailability';
import StudioPolicies from './studio/StudioPolicies';
import StudioBookings from './studio/StudioBookings';
import StudioEquipment from './studio/StudioEquipment';
import StudioSettings from './studio/StudioSettings';
import StudioClients from './studio/StudioClients';
import StudioStaff from './studio/StudioStaff';
import StudioAnalytics from './studio/StudioAnalytics';
import StudioSetupWizard from './studio/StudioSetupWizard';
import type { UserData } from '../types';

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
  const [localUserData, setLocalUserData] = useState(userData);

  // Get user by clerk ID to get the Convex user ID
  const userRecord = useQuery(
    api.users.getUserByClerkId,
    userData?.clerkId || user?.id ? { clerkId: userData?.clerkId || user?.id } : "skip"
  );

  // Fetch studio data — only query when we have a valid Convex user ID
  const studio = useStudioByOwner(userRecord?._id);

  // Fetch bookings for live stats
  const studioBookings = useBookingsByStudio(studio?._id);

  // Compute live booking stats reactively
  const stats: StudioStats = useMemo(() => {
    if (!studioBookings) {
      return { pendingBookings: 0, recentBookings: [], totalRevenue: 0 };
    }

    const pending = studioBookings.filter(
      (b: any) => (b.status || '').toLowerCase() === 'pending'
    ).length;

    const recent = studioBookings
      .filter((b: any) => {
        const bookingDate = b.date ? new Date(b.date) : new Date(b.createdAt || Date.now());
        return bookingDate >= new Date();
      })
      .sort((a: any, b: any) => {
        const dateA = a.date ? new Date(a.date) : new Date(a.createdAt || Date.now());
        const dateB = b.date ? new Date(b.date) : new Date(b.createdAt || Date.now());
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5)
      .map((b: any) => ({
        ...b,
        id: b._id,
        date: b.date ? new Date(b.date) : new Date(b.createdAt || Date.now()),
      }));

    const revenue = studioBookings
      .filter((b: any) => (b.status || '').toLowerCase() === 'completed')
      .reduce((sum: number, b: any) => sum + (Number(b.totalAmount) || Number(b.total_price) || Number(b.offer_amount) || 0), 0);

    return {
      pendingBookings: pending,
      recentBookings: recent,
      totalRevenue: revenue,
    };
  }, [studioBookings]);

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
      studio,
      onUpdate: handleUpdate
    };

    switch (activeTab) {
      case 'overview':
        return <StudioOverview {...commonProps} stats={stats as any} onNavigate={handleNavigate} />;
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
        return <StudioBookings {...commonProps} studio={studio} userData={localUserData} />;
      case 'clients':
        return <StudioClients {...commonProps} />;
      case 'staff':
        return <StudioStaff {...commonProps} />;
      case 'analytics':
        return <StudioAnalytics {...commonProps} />;
      case 'settings':
        return <StudioSettings {...commonProps} />;
      default:
        return <StudioOverview {...commonProps} stats={stats as any} onNavigate={handleNavigate} />;
    }
  };

  const activeTabInfo = TABS.find(t => t.id === activeTab);

  // Loading guard: wait for both userRecord and studio query to resolve
  // before rendering anything. Prevents the full StudioManager UI from
  // flashing before the setup wizard appears.
  if (userRecord === undefined || studio === undefined) {
    return (
      <div className="max-w-7xl mx-auto pb-20 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }

  // Show setup wizard when no studio exists (null = query completed with no results)
  if (studio === null && userRecord?._id) {
    return (
      <div className="max-w-7xl mx-auto pb-20">
        <StudioSetupWizard
          clerkId={userData?.clerkId || user?.id}
          onComplete={() => {/* Convex real-time query will auto-update studio */}}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Briefcase size={14} />
          <span>Business Center</span>
          <ChevronRight size={14} />
          <span className="text-gray-700 dark:text-gray-200">Studio Manager</span>
        </div>
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Home size={24} />
          </div>
          {localUserData?.studioName || localUserData?.profileName || 'Studio Manager'}
        </h1>
      </div>

      {/* Non-blocking Clerk Org linking notification if pending */}
      {studio && !studio.clerkOrgId && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Building2 className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Clerk Organization link pending
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Link or create your Clerk Organization to manage staff roles, team permissions, and automated client billing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shrink-0 transition shadow-sm"
          >
            Configure in Settings
          </button>
        </div>
      )}

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

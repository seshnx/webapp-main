import React, { useState, useEffect } from 'react';
import {
    Home, LayoutGrid, Image, Clock, FileText, Calendar,
    Package, Settings, ChevronRight, Briefcase, Users, TrendingUp
} from 'lucide-react';
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

const TABS = [
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

/**
 * StudioManager - Complete studio management interface with tabbed navigation
 */
export default function StudioManager({ user, userData }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        pendingBookings: 0,
        recentBookings: [],
        totalRevenue: 0
    });
    const [localUserData, setLocalUserData] = useState(userData);

    // Fetch booking stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id && !user?.uid || !supabase) return;
            const userId = user.id || user.uid;
            
            try {
                // Fetch bookings where user is the target OR studio_owner_id (studio owner receiving bookings)
                const { data: bookings, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .or(`target_id.eq.${userId},studio_owner_id.eq.${userId}`)
                    .order('date', { ascending: true });

                if (error) throw error;

                const pending = bookings.filter(b => b.status === 'Pending').length;
                const recent = bookings
                    .filter(b => {
                        const bookingDate = new Date(b.date);
                        return bookingDate >= new Date();
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5);
                const revenue = bookings
                    .filter(b => b.status === 'Completed')
                    .reduce((sum, b) => sum + (b.offer_amount || 0), 0);

                setStats({
                    pendingBookings: pending,
                    recentBookings: recent,
                    totalRevenue: revenue
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, [user?.id, user?.uid]);

    // Handle updates from child components
    const handleUpdate = (updates) => {
        setLocalUserData(prev => ({ ...prev, ...updates }));
    };

    // Handle navigation from overview
    const handleNavigate = (tabId) => {
        setActiveTab(tabId);
    };

    const renderContent = () => {
        const commonProps = {
            user,
            userData: localUserData,
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
                                onClick={() => setActiveTab(tab.id)}
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


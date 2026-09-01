import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  DollarSign,
  Share2,
  Calendar,
  ChevronRight,
  Music,
  Radio,
  Sparkles,
  ArrowUpRight,
  Award,
  Layers,
  MessageCircle,
  ExternalLink,
  Sliders,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  CalendarDays,
  RadioTower,
  ShieldCheck,
  FileText,
  CreditCard,
  UserCheck,
  Send,
  Zap,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReceivedTips,
  usePostsByAuthor,
  useTalentBookings,
  useClientBookings,
  useAcceptTalentBooking,
  useDeclineTalentBooking,
  useCancelTalentBooking,
  useCompleteTalentBooking
} from '../../hooks/useConvex';
import UserAvatar from '../shared/UserAvatar';
import toast from 'react-hot-toast';
import BroadcastList from '../BroadcastList';
import BroadcastRequest from '../BroadcastRequest';
import SessionWizard from '../SessionWizard';
import BoostVisibilityModal from '../social/BoostVisibilityModal';

interface CreatorStudioPageProps {
  user: any;
  userData: any;
  openPublicProfile?: (uid: string) => void;
  setPendingChatTarget?: (target: { uid: string; name: string }) => void;
}

type StudioTab = 'overview' | 'bookings' | 'broadcasts' | 'rates';

export default function CreatorStudioPage({
  user,
  userData,
  openPublicProfile,
  setPendingChatTarget
}: CreatorStudioPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab state synced with URL ?tab=...
  const currentTab = (searchParams.get('tab') as StudioTab) || 'overview';
  const setActiveTab = (tab: StudioTab) => {
    setSearchParams({ tab });
  };

  const clerkId = user?.id || user?.uid || '';

  // Data queries
  const tips = useReceivedTips(clerkId) || [];
  const authorPosts = usePostsByAuthor(clerkId, 50) || [];
  const talentBookings = useTalentBookings(clerkId) || [];
  const clientBookings = useClientBookings(clerkId) || [];

  // Mutations
  const acceptBooking = useAcceptTalentBooking();
  const declineBooking = useDeclineTalentBooking();
  const cancelBooking = useCancelTalentBooking();
  const completeBooking = useCompleteTalentBooking();

  // State
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeMetricTab, setActiveMetricTab] = useState<'engagement' | 'revenue'>('engagement');
  const [bookingPerspective, setBookingPerspective] = useState<'talent' | 'client'>('talent');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>('');
  const [showRevenueBreakdown, setShowRevenueBreakdown] = useState<boolean>(false);
  const [showBoostModal, setShowBoostModal] = useState<boolean>(false);

  // Sub-view page states (opened inline on page instead of modal dialogs)
  const [broadcastSubView, setBroadcastSubView] = useState<'list' | 'create'>('list');
  const [bookingSubView, setBookingSubView] = useState<'manage' | 'builder'>('manage');
  const [sessionParams, setSessionParams] = useState<any>(null);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // Rates & Availability state
  const [hourlyRate, setHourlyRate] = useState<number>(userData?.hourlyRate || 75);
  const [dayRate, setDayRate] = useState<number>(userData?.dayRate || 500);
  const [minHours, setMinHours] = useState<number>(2);
  const [bufferTime, setBufferTime] = useState<number>(30); // minutes
  const [depositRequired, setDepositRequired] = useState<boolean>(true);
  const [depositPercentage, setDepositPercentage] = useState<number>(50);
  const [workingDays, setWorkingDays] = useState<Record<string, boolean>>({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: true,
    Sun: false,
  });

  // Calculations
  const totalTipsAmount = tips.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const completedTalentBookings = talentBookings.filter(
    (b: any) => b.status === 'Accepted' || b.status === 'Completed' || b.status === 'confirmed'
  );
  const totalBookingsRevenue = completedTalentBookings.reduce(
    (sum: number, b: any) => sum + (b.offerAmount || b.offer_amount || 0),
    0
  );
  const grossRevenue = totalTipsAmount + totalBookingsRevenue;

  const followerCount = userData?.stats?.followersCount || userData?.followersCount || 0;
  const postsCount = authorPosts.length || userData?.stats?.postsCount || 0;
  const totalLikes = authorPosts.reduce(
    (sum: number, p: any) => sum + (p.engagement?.likesCount || p.likeCount || 0),
    0
  );
  const totalComments = authorPosts.reduce(
    (sum: number, p: any) => sum + (p.engagement?.commentsCount || p.commentCount || 0),
    0
  );
  const totalInteractions = totalLikes + totalComments;

  // Pending incoming requests
  const pendingRequests = useTalentBookings(clerkId, 'Pending') || [];

  // Top supporters leaderboard from tips
  const topSupporters = useMemo(() => {
    const supporterMap = new Map<string, { name: string; photo?: string; total: number; count: number }>();
    tips.forEach((t: any) => {
      const senderKey = t.senderClerkId || t.senderName || 'Anonymous';
      const existing = supporterMap.get(senderKey);
      if (existing) {
        existing.total += t.amount || 0;
        existing.count += 1;
      } else {
        supporterMap.set(senderKey, {
          name: t.senderName || 'Music Supporter',
          photo: t.senderPhoto,
          total: t.amount || 0,
          count: 1,
        });
      }
    });
    return Array.from(supporterMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [tips]);

  // Handle Booking Actions
  const handleAcceptBooking = async (bookingId: any) => {
    try {
      await acceptBooking({
        bookingId,
        talentClerkId: clerkId,
      });
      toast.success('Booking confirmed! Client notified.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to confirm booking.');
    }
  };

  const handleDeclineBooking = async (bookingId: any) => {
    try {
      await declineBooking({
        bookingId,
        talentClerkId: clerkId,
        reason: 'Unavailable for requested session slot.',
      });
      toast('Booking request declined.', { icon: 'ℹ️' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to decline booking.');
    }
  };

  const handleCompleteBooking = async (bookingId: any) => {
    try {
      await completeBooking({
        bookingId,
        clerkId,
      });
      toast.success('Session marked as completed!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to complete booking.');
    }
  };

  const handleContactClient = (targetUser: { uid: string; name: string }) => {
    if (setPendingChatTarget) {
      setPendingChatTarget(targetUser);
      toast.success(`Opening message window for ${targetUser.name}...`);
    } else {
      navigate('/messages');
    }
  };

  const handleOpenSessionBuilder = () => {
    setActiveTab('bookings');
    setBookingSubView('builder');
  };

  const handleOpenBroadcastCreate = () => {
    setActiveTab('broadcasts');
    setBroadcastSubView('create');
  };

  const activeBookingsList = bookingPerspective === 'talent' ? talentBookings : clientBookings;
  const filteredBookings = activeBookingsList.filter((b: any) => {
    if (bookingStatusFilter !== 'all' && b.status?.toLowerCase() !== bookingStatusFilter.toLowerCase()) {
      return false;
    }
    if (bookingSearchQuery.trim()) {
      const q = bookingSearchQuery.toLowerCase();
      const otherName = (bookingPerspective === 'talent' ? b.clientName : b.talentName) || '';
      const service = b.serviceType || '';
      return otherName.toLowerCase().includes(q) || service.toLowerCase().includes(q);
    }
    return true;
  });

  const tabItems = [
    { id: 'overview' as const, label: 'Overview & Analytics', icon: BarChart3 },
    {
      id: 'bookings' as const,
      label: 'Bookings & Schedule',
      icon: CalendarDays,
      badge: pendingRequests.length > 0 ? `${pendingRequests.length}` : undefined,
    },
    { id: 'broadcasts' as const, label: 'Broadcasts & Gigs', icon: RadioTower },
    { id: 'rates' as const, label: 'Rates & Availability', icon: Sliders },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-6">
      {/* Top Banner Header with Dynamic Role Indicator */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-gray-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-brand-blue/20 shadow-xl shadow-blue-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl -z-10" />

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="ring-4 ring-brand-blue/30 rounded-full overflow-hidden">
              <UserAvatar
                src={userData?.photoURL || user?.imageUrl}
                name={userData?.displayName || 'Creator'}
                size="lg"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-brand-blue text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/20">
              {userData?.activeProfileRole || userData?.activeRole || 'Creator'}
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-brand-blue" size={24} />
              Creator Studio & Sessions
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
              Manage client booking sessions, recording gigs, audience insights, and direct tip revenue.
            </p>
          </div>
        </div>

        {/* Quick Page Triggers */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <button
            onClick={handleOpenSessionBuilder}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-600 transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Plus size={14} /> + New Custom Session
          </button>
          <button
            onClick={handleOpenBroadcastCreate}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-brand-dark-accent text-white text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shadow-md shadow-brand-dark-accent/20"
          >
            <RadioTower size={14} /> Post Gig Broadcast
          </button>
        </div>
      </div>

      {/* Workspace Navigation Bar: Desktop Pill Tabs & Mobile Compact Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/90 dark:bg-dark-card/90 backdrop-blur-xl p-2 rounded-2xl border dark:border-gray-700 shadow-sm">
        {/* Desktop Tabs */}
        <div className="hidden sm:flex items-center gap-1.5">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'broadcasts') setBroadcastSubView('list');
                  if (tab.id === 'bookings') setBookingSubView('manage');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Selector */}
        <div className="sm:hidden relative">
          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Studio Workspace</label>
          <div className="relative">
            <select
              value={currentTab}
              onChange={(e) => {
                setActiveTab(e.target.value as StudioTab);
                if (e.target.value === 'broadcasts') setBroadcastSubView('list');
                if (e.target.value === 'bookings') setBookingSubView('manage');
              }}
              className="w-full bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white font-bold text-xs rounded-xl px-4 py-2.5 appearance-none outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {tabItems.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} {tab.badge ? `(${tab.badge} Alert)` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Right Aux Filter (for Overview) */}
        {currentTab === 'overview' && (
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-end sm:self-auto">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  timeRange === range
                    ? 'bg-white dark:bg-dark-card text-brand-blue shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & ANALYTICS                                              */}
      {/* ========================================================================= */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Sticky Pending Request Action Alert */}
          {pendingRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 border border-amber-500/30 dark:border-amber-500/20 shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{pendingRequests.length} Pending Booking Request{pendingRequests.length > 1 ? 's' : ''}</span>
                      <span className="text-[10px] bg-amber-500 text-white font-black px-2 py-0.5 rounded-full">ACTION REQUIRED</span>
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                      Client <strong>{pendingRequests[0].clientName}</strong> requested {pendingRequests[0].serviceType || 'Session'} on {pendingRequests[0].date || 'Upcoming'}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleAcceptBooking(pendingRequests[0]._id)}
                    className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={13} /> Confirm
                  </button>
                  <button
                    onClick={() => handleDeclineBooking(pendingRequests[0]._id)}
                    className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-red-500 hover:text-white transition flex items-center justify-center gap-1"
                  >
                    <XCircle size={13} /> Decline
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('bookings');
                      setBookingSubView('manage');
                    }}
                    className="text-xs font-bold text-brand-blue hover:underline px-2 py-1"
                  >
                    View All →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* KPI Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl p-5 border dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Revenue</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-2xl sm:text-3xl font-black dark:text-white">${grossRevenue.toFixed(2)}</h3>
                <button
                  onClick={() => setShowRevenueBreakdown(true)}
                  className="text-[11px] font-bold text-brand-blue hover:underline bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full"
                >
                  View Breakdown
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 truncate">
                ${totalTipsAmount.toFixed(2)} Tips • ${totalBookingsRevenue.toFixed(2)} Sessions
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl p-5 border dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Bookings</span>
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                  <CalendarDays size={18} />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-2xl sm:text-3xl font-black dark:text-white">
                  {talentBookings.filter((b: any) => b.status === 'Accepted' || b.status === 'Pending').length}
                </h3>
                <button
                  onClick={() => {
                    setActiveTab('bookings');
                    setBookingSubView('manage');
                  }}
                  className="text-[11px] font-bold text-brand-blue hover:underline"
                >
                  View Bookings
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                {pendingRequests.length} pending approval
              </p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl p-5 border dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Follower Base</span>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Users size={18} />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black dark:text-white">{followerCount}</h3>
              <p className="text-[11px] text-gray-400 mt-2">Active audience network</p>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl p-5 border dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content Reach</span>
                <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Sparkles size={18} />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black dark:text-white">{totalInteractions}</h3>
              <p className="text-[11px] text-gray-400 mt-2">{postsCount} posts published</p>
            </div>
          </div>

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-3xl p-6 border dark:border-gray-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base dark:text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-brand-blue" />
                    Performance & Interactions
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Summary of interactions across posts and sessions</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700">
                  <div className="flex items-center gap-2 text-rose-500 text-xs font-bold mb-1">
                    <Heart size={14} /> Total Likes
                  </div>
                  <div className="text-2xl font-black dark:text-white">{totalLikes}</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700">
                  <div className="flex items-center gap-2 text-blue-500 text-xs font-bold mb-1">
                    <MessageCircle size={14} /> Comments
                  </div>
                  <div className="text-2xl font-black dark:text-white">{totalComments}</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold mb-1">
                    <DollarSign size={14} /> Tips Received
                  </div>
                  <div className="text-2xl font-black dark:text-white">${totalTipsAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Top Supporters */}
            <div className="bg-white dark:bg-dark-card rounded-3xl p-6 border dark:border-gray-700 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base dark:text-white flex items-center gap-2 mb-1">
                  <Award size={18} className="text-amber-500" />
                  Top Supporters & Tippers
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Fans and studios contributing direct tips
                </p>

                {topSupporters.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    <DollarSign size={24} className="mx-auto mb-1 opacity-50" />
                    <p>No tips received yet</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topSupporters.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border dark:border-gray-700/60"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-amber-500">{i + 1}</span>
                          <UserAvatar src={s.photo} name={s.name} size="sm" />
                          <div>
                            <h4 className="font-bold text-xs dark:text-white">{s.name}</h4>
                            <span className="text-[10px] text-gray-400">{s.count} tips</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          ${s.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setShowBoostModal(true)}
              className="p-4 rounded-3xl bg-brand-blue text-white flex items-center justify-between transition shadow-md shadow-blue-500/20"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={18} />
                <span className="text-xs font-bold">Boost Visibility</span>
              </div>
              <ChevronRight size={16} className="text-white/80" />
            </button>
            <button
              onClick={() => {
                setActiveTab('bookings');
                setBookingSubView('manage');
              }}
              className="p-4 rounded-3xl bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <CalendarDays size={18} className="text-brand-blue" />
                <span className="text-xs font-bold">Manage Sessions</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className="p-4 rounded-3xl bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <Sliders size={18} className="text-brand-blue" />
                <span className="text-xs font-bold">Adjust Rates</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigate('/feed')}
              className="p-4 rounded-3xl bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-3">
                <Radio size={18} className="text-red-400" />
                <span className="text-xs font-bold">Host Live</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOOKINGS & SCHEDULE                                               */}
      {/* ========================================================================= */}
      {currentTab === 'bookings' && (
        <div className="space-y-6">
          {bookingSubView === 'builder' ? (
            /* Inline Session Builder Page View */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between bg-white dark:bg-dark-card p-5 rounded-3xl border dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-brand-blue">
                    <CalendarDays size={22} />
                  </div>
                  <div>
                    <h2 className="font-bold text-base dark:text-white">Custom Session Builder</h2>
                    <p className="text-xs text-gray-400">Discover studios, choose dates, and assemble your creative roster</p>
                  </div>
                </div>
                <button
                  onClick={() => setBookingSubView('manage')}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  ← Back to Schedule
                </button>
              </div>

              <SessionWizard
                userData={userData}
                sessionParams={sessionParams}
                setSessionParams={setSessionParams}
                onNext={() => {
                  setBookingSubView('manage');
                  toast.success('Session setup ready! View details in your bookings.');
                }}
              />
            </div>
          ) : (
            /* Standard Schedule & Bookings Management View */
            <div className="space-y-6">
              {/* Sub-Toggle: Client Sessions vs My Bookings */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-dark-card p-4 rounded-3xl border dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setBookingPerspective('talent')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
                      bookingPerspective === 'talent'
                        ? 'bg-white dark:bg-dark-card text-brand-blue shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Client Sessions (Booked with Me)
                    {pendingRequests.length > 0 && (
                      <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                        {pendingRequests.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setBookingPerspective('client')}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition ${
                      bookingPerspective === 'client'
                        ? 'bg-white dark:bg-dark-card text-brand-blue shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    My Bookings (Hired Others)
                  </button>
                </div>

                {/* Filter Pills & Search */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 sm:w-48">
                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search client or service..."
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>

                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs font-bold rounded-xl px-3 py-1.5 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={handleOpenSessionBuilder}
                    className="px-3.5 py-1.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1"
                  >
                    <Plus size={13} /> New Session
                  </button>
                </div>
              </div>

              {/* Bookings List & Cards */}
              {filteredBookings.length === 0 ? (
                <div className="bg-white dark:bg-dark-card rounded-3xl p-12 text-center border dark:border-gray-700">
                  <CalendarDays size={40} className="mx-auto mb-3 text-brand-blue opacity-60" />
                  <h3 className="font-bold text-base dark:text-white mb-1">
                    {bookingPerspective === 'talent' ? 'No Client Sessions Found' : 'No Outgoing Bookings Found'}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                    {bookingPerspective === 'talent'
                      ? 'When clients book audio engineering, production, or studio sessions with you, they will appear here.'
                      : 'You have not booked any recording sessions or talent yet.'}
                  </p>
                  <button
                    onClick={handleOpenSessionBuilder}
                    className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition"
                  >
                    + Build New Session
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((b: any) => {
                    const otherPartyName = (bookingPerspective === 'talent' ? b.clientName : b.talentName) || 'User';
                    const otherPartyPhoto = bookingPerspective === 'talent' ? b.clientPhoto : b.talentPhoto;
                    const otherPartyClerkId = bookingPerspective === 'talent' ? b.clientClerkId : b.talentClerkId;
                    const isPending = b.status?.toLowerCase() === 'pending';
                    const isConfirmed = b.status?.toLowerCase() === 'accepted' || b.status?.toLowerCase() === 'confirmed';
                    const isCompleted = b.status?.toLowerCase() === 'completed';

                    return (
                      <motion.div
                        key={b._id || b.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-dark-card rounded-3xl p-5 border dark:border-gray-700 shadow-sm hover:border-brand-blue/40 transition flex flex-col justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <UserAvatar src={otherPartyPhoto} name={otherPartyName} size="md" />
                              <div>
                                <h4 className="font-bold text-sm dark:text-white flex items-center gap-1.5">
                                  <span>{otherPartyName}</span>
                                  <span className="text-[10px] text-gray-400 font-normal">
                                    ({bookingPerspective === 'talent' ? 'Client' : 'Talent'})
                                  </span>
                                </h4>
                                <span className="text-xs text-brand-blue font-semibold">
                                  {b.serviceType || 'Studio Session'}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                                isPending
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                                  : isConfirmed
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                                  : isCompleted
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-brand-blue'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                              }`}
                            >
                              {b.status || 'Pending'}
                            </span>
                          </div>

                          {/* Details Strip */}
                          <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl text-xs text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-brand-blue" />
                              <span>{b.date || 'Flexible Date'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-blue-500" />
                              <span>{b.time || '12:00 PM'} ({b.duration || 2}h)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <DollarSign size={13} className="text-emerald-500" />
                              <span className="font-bold">${b.offerAmount || b.offer_amount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck size={13} className="text-brand-dark-accent" />
                              <span className="capitalize">{b.paymentStatus || 'Pending'}</span>
                            </div>
                          </div>

                          {b.message && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic line-clamp-2">
                              "{b.message}"
                            </p>
                          )}
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t dark:border-gray-800">
                          <button
                            onClick={() => handleContactClient({ uid: otherPartyClerkId, name: otherPartyName })}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-brand-blue dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <MessageCircle size={13} /> Message
                          </button>

                          <div className="flex items-center gap-1.5">
                            {bookingPerspective === 'talent' && isPending && (
                              <>
                                <button
                                  onClick={() => handleAcceptBooking(b._id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleDeclineBooking(b._id)}
                                  className="px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-red-500 hover:text-white transition"
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {bookingPerspective === 'talent' && isConfirmed && (
                              <button
                                onClick={() => handleCompleteBooking(b._id)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BROADCASTS & GIGS                                                 */}
      {/* ========================================================================= */}
      {currentTab === 'broadcasts' && (
        <div className="space-y-6">
          {broadcastSubView === 'create' ? (
            /* Inline Broadcast Creation Page View */
            <div className="space-y-4 animate-in fade-in duration-300">
              <BroadcastRequest
                user={user}
                userData={userData}
                onBack={() => setBroadcastSubView('list')}
                onSuccess={() => {
                  setBroadcastSubView('list');
                  toast.success('Gig broadcast published to the community!');
                }}
              />
            </div>
          ) : (
            /* Broadcast List Page View */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white dark:bg-dark-card p-5 rounded-3xl border dark:border-gray-700 shadow-sm">
                <div>
                  <h2 className="font-bold text-base dark:text-white flex items-center gap-2">
                    <RadioTower size={20} className="text-brand-blue" />
                    Community Broadcasts & Session Gigs
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Explore open producer, engineer, and artist gig requests or publish your own.
                  </p>
                </div>
                <button
                  onClick={handleOpenBroadcastCreate}
                  className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1.5"
                >
                  <Plus size={14} /> + Post Gig
                </button>
              </div>

              <BroadcastList
                user={user}
                userData={userData}
                onBid={(id) => toast.success(`Opening bid composer for gig #${id}`)}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RATES & AVAILABILITY                                              */}
      {/* ========================================================================= */}
      {currentTab === 'rates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Rates Configuration */}
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 border dark:border-gray-700 shadow-sm space-y-5">
            <h3 className="font-bold text-base dark:text-white flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-500" />
              Session Rates & Pricing
            </h3>
            <p className="text-xs text-gray-400 -mt-2">
              Configure your standard client booking rates for audio and production work.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Hourly Rate ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 font-bold text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Full Day Rate (8 Hours)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    value={dayRate}
                    onChange={(e) => setDayRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 font-bold text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Minimum Session Duration
                </label>
                <select
                  value={minHours}
                  onChange={(e) => setMinHours(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 font-bold text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value={1}>1 Hour Minimum</option>
                  <option value={2}>2 Hours Minimum</option>
                  <option value={3}>3 Hours Minimum</option>
                  <option value={4}>4 Hours Minimum (Half Day)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Buffer Time Between Sessions
                </label>
                <select
                  value={bufferTime}
                  onChange={(e) => setBufferTime(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 font-bold text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value={0}>0 Minutes (Back-to-back)</option>
                  <option value={15}>15 Minutes Cleanup / Reset</option>
                  <option value={30}>30 Minutes Standard Buffer</option>
                  <option value={60}>60 Minutes Extended Buffer</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => toast.success('Rates and buffer settings saved!')}
              className="w-full py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs hover:bg-blue-600 transition"
            >
              Save Rate Settings
            </button>
          </div>

          {/* Deposit Policies & Working Days */}
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 border dark:border-gray-700 shadow-sm space-y-5">
            <h3 className="font-bold text-base dark:text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-brand-blue" />
              Deposit Terms & Working Hours
            </h3>
            <p className="text-xs text-gray-400 -mt-2">
              Configure deposit requirements and standard weekly operating days.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs dark:text-white">Require Upfront Stripe Deposit</h4>
                  <p className="text-[11px] text-gray-400">Lock session calendar upon client payment</p>
                </div>
                <input
                  type="checkbox"
                  checked={depositRequired}
                  onChange={(e) => setDepositRequired(e.target.checked)}
                  className="w-4 h-4 text-brand-blue rounded"
                />
              </div>

              {depositRequired && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Deposit Percentage
                  </label>
                  <select
                    value={depositPercentage}
                    onChange={(e) => setDepositPercentage(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 font-bold text-xs text-gray-900 dark:text-white outline-none"
                  >
                    <option value={25}>25% Upfront Deposit</option>
                    <option value={50}>50% Standard Deposit</option>
                    <option value={100}>100% Full Prepayment</option>
                  </select>
                </div>
              )}

              {/* Working Days Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Active Booking Days
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {Object.keys(workingDays).map((day) => {
                    const isActive = workingDays[day];
                    return (
                      <button
                        key={day}
                        onClick={() => setWorkingDays((prev) => ({ ...prev, [day]: !prev[day] }))}
                        className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                          isActive
                            ? 'bg-brand-blue text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                      >
                        <span>{day}</span>
                        {isActive && <Check size={10} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => toast.success('Deposit policies updated!')}
              className="w-full py-2.5 rounded-xl bg-brand-blue text-white font-bold text-xs hover:bg-blue-600 transition"
            >
              Save Policies
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVENUE BREAKDOWN MODAL                                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRevenueBreakdown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-card rounded-3xl p-6 border dark:border-gray-700 shadow-2xl max-w-lg w-full space-y-5"
            >
              <div className="flex items-center justify-between border-b dark:border-gray-800 pb-3">
                <h3 className="font-bold text-base dark:text-white flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-500" />
                  Gross Revenue Breakdown
                </h3>
                <button
                  onClick={() => setShowRevenueBreakdown(false)}
                  className="p-1 text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
                    Direct Tips
                  </span>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                    ${totalTipsAmount.toFixed(2)}
                  </h4>
                  <span className="text-[10px] text-gray-400">{tips.length} total tips</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-500/20">
                  <span className="text-xs text-brand-blue font-semibold block">
                    Booking Sessions
                  </span>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                    ${totalBookingsRevenue.toFixed(2)}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {completedTalentBookings.length} completed sessions
                  </span>
                </div>
              </div>

              {/* Total Aggregate */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 font-bold text-sm dark:text-white">
                <span>Total Creator Earnings</span>
                <span className="text-lg text-emerald-500 font-black">${grossRevenue.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setShowRevenueBreakdown(false)}
                className="w-full py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition"
              >
                Close Breakdown
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Boost Visibility Modal */}
      {showBoostModal && (
        <BoostVisibilityModal
          isOpen={showBoostModal}
          onClose={() => setShowBoostModal(false)}
          user={user}
          userData={userData}
        />
      )}
    </div>
  );
}

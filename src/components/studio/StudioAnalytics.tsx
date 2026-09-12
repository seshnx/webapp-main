import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useBookingsByStudio } from '@/hooks/useConvex';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  Download,
  BarChart3,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import type { UserData } from '../../types';

export interface StudioAnalyticsProps {
  user?: any;
  userData?: UserData | null;
  studio?: any;
  onUpdate?: (data: Partial<any>) => void;
}

type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export default function StudioAnalytics({ user, userData, studio }: StudioAnalyticsProps) {
  const [period, setPeriod] = useState<TimePeriod>('30d');

  // Live data queries
  const bookings = useBookingsByStudio(studio?._id);
  const rooms = useQuery(
    api.sbookings.getRoomsByStudio,
    studio?._id ? { studioId: studio._id } : "skip"
  );
  const clients = useQuery(
    api.studioManager.getClientsByStudio,
    studio?._id ? { studioId: studio._id } : "skip"
  );

  // Period date boundaries
  const periodDays = useMemo(() => {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      case 'all': return null;
    }
  }, [period]);

  const startDate = useMemo(() => {
    if (!periodDays) return null;
    const d = new Date();
    d.setDate(d.getDate() - periodDays);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [periodDays]);

  // Filter bookings by selected period
  const filteredBookings = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) return [];
    if (!startDate) return bookings;

    return bookings.filter((b: any) => {
      if (b.date) {
        const bookingDate = new Date(b.date);
        if (!isNaN(bookingDate.getTime())) {
          return bookingDate >= startDate;
        }
      }
      if (b.createdAt) {
        return new Date(b.createdAt) >= startDate;
      }
      return true;
    });
  }, [bookings, startDate]);

  // Aggregated KPI metrics
  const stats = useMemo(() => {
    const totalBookings = filteredBookings.length;
    let confirmedCount = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;
    let inProgressCount = 0;

    let grossRevenue = 0;
    let pendingRevenue = 0;
    let depositRevenue = 0;
    let totalRoomHours = 0;

    const serviceMap: Record<string, { count: number; revenue: number }> = {};
    const roomMap: Record<string, { count: number; hours: number; revenue: number }> = {};

    filteredBookings.forEach((b: any) => {
      const status = (b.status || '').toLowerCase();
      const amount = Number(b.finalAmount ?? b.totalAmount ?? b.offerAmount ?? 0);
      const deposit = Number(b.depositAmount ?? 0);
      const duration = Number(b.duration ?? 0);

      depositRevenue += deposit;

      if (status === 'completed') {
        completedCount++;
        grossRevenue += amount;
        totalRoomHours += duration;
      } else if (status === 'confirmed') {
        confirmedCount++;
        grossRevenue += amount;
        totalRoomHours += duration;
      } else if (status === 'inprogress' || status === 'in_progress' || status === 'in progress') {
        inProgressCount++;
        grossRevenue += amount;
        totalRoomHours += duration;
      } else if (status === 'pending') {
        pendingCount++;
        pendingRevenue += amount;
      } else if (status === 'cancelled') {
        cancelledCount++;
      } else {
        // Fallback for other status
        pendingCount++;
        pendingRevenue += amount;
      }

      // Group by service
      const service = b.serviceType || 'General Session';
      if (!serviceMap[service]) {
        serviceMap[service] = { count: 0, revenue: 0 };
      }
      serviceMap[service].count++;
      if (status !== 'cancelled') {
        serviceMap[service].revenue += amount;
      }

      // Group by room
      if (b.roomId) {
        const roomIdStr = String(b.roomId);
        if (!roomMap[roomIdStr]) {
          roomMap[roomIdStr] = { count: 0, hours: 0, revenue: 0 };
        }
        roomMap[roomIdStr].count++;
        roomMap[roomIdStr].hours += duration;
        if (status !== 'cancelled') {
          roomMap[roomIdStr].revenue += amount;
        }
      }
    });

    const activeOrFinishedBookings = confirmedCount + completedCount + inProgressCount;
    const avgBookingValue = activeOrFinishedBookings > 0
      ? Math.round(grossRevenue / activeOrFinishedBookings)
      : 0;
    const avgDuration = activeOrFinishedBookings > 0
      ? Number((totalRoomHours / activeOrFinishedBookings).toFixed(1))
      : 0;

    // Room capacity utilization (assuming 8 operating hours/day per room)
    const roomCount = (rooms && rooms.length > 0) ? rooms.length : 1;
    const effectiveDays = periodDays || 30;
    const maxCapacityHours = roomCount * 8 * effectiveDays;
    const utilizationRate = maxCapacityHours > 0
      ? Math.min(100, Math.round((totalRoomHours / maxCapacityHours) * 100))
      : 0;

    return {
      totalBookings,
      confirmedCount,
      completedCount,
      pendingCount,
      cancelledCount,
      inProgressCount,
      activeOrFinishedBookings,
      grossRevenue,
      pendingRevenue,
      depositRevenue,
      totalRoomHours,
      avgBookingValue,
      avgDuration,
      utilizationRate,
      serviceMap,
      roomMap,
    };
  }, [filteredBookings, rooms, periodDays]);

  // Export filtered analytics to CSV
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert('No booking records to export for this period.');
      return;
    }

    const headers = ['Booking ID', 'Date', 'Time', 'Service Type', 'Duration (hrs)', 'Status', 'Offer Amount', 'Final Amount', 'Deposit Amount'];
    const rows = filteredBookings.map((b: any) => [
      b.id || b._id,
      b.date || '',
      b.time || '',
      `"${b.serviceType || 'General Session'}"`,
      b.duration || 0,
      b.status || 'Pending',
      b.offerAmount ?? '',
      b.finalAmount ?? '',
      b.depositAmount ?? '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${studio?.slug || 'studio'}-analytics-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currencySymbol = studio?.currency === 'EUR' ? '€' : studio?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <TrendingUp size={20} />
              </div>
              Studio Performance Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Real-time financial telemetry, room utilization, and booking volume for {studio?.name || 'your studio'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-700 text-xs font-semibold">
              {(['7d', '30d', '90d', '1y', 'all'] as TimePeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    period === p
                      ? 'bg-white dark:bg-[#2c2e36] text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : p === '1y' ? '1 Year' : 'All Time'}
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              disabled={filteredBookings.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition-colors border dark:border-gray-700"
              title="Export filtered records to CSV"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold dark:text-white">
              {currencySymbol}{stats.grossRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{currencySymbol}{stats.pendingRevenue.toLocaleString()} pending inquiries</span>
            </div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold dark:text-white">
              {stats.totalBookings}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.confirmedCount + stats.completedCount} confirmed</span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">{stats.pendingCount} pending</span>
            </div>
          </div>
        </div>

        {/* Studio Hours Booked */}
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Studio Hours</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold dark:text-white">
              {stats.totalRoomHours} hrs
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Avg. {stats.avgDuration} hrs / session</span>
            </div>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Room Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold dark:text-white">
              {stats.utilizationRate}%
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.utilizationRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Content */}
      {stats.totalBookings === 0 ? (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} />
          </div>
          <h3 className="text-lg font-bold dark:text-white mb-2">No Bookings Recorded For Selected Period</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            When clients book studio sessions or request time in your rooms, your gross revenue, room utilization, and service telemetry will update in real time.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">
            <Info size={14} className="text-blue-500" />
            <span>Currently tracking 0 records in {period === 'all' ? 'All Time' : `the last ${period}`}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Breakdown & Services */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Status Distribution */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-base font-bold dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-500" />
                Booking Status Distribution
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    <CheckCircle2 size={14} /> Confirmed / Done
                  </div>
                  <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                    {stats.confirmedCount + stats.completedCount}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {stats.totalBookings > 0 ? Math.round(((stats.confirmedCount + stats.completedCount) / stats.totalBookings) * 100) : 0}% of volume
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                    <Clock3 size={14} /> In Review / Pending
                  </div>
                  <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                    {stats.pendingCount}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {stats.totalBookings > 0 ? Math.round((stats.pendingCount / stats.totalBookings) * 100) : 0}% of volume
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                    <Sparkles size={14} /> In Progress
                  </div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {stats.inProgressCount}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Active sessions
                  </div>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                    <XCircle size={14} /> Cancelled
                  </div>
                  <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                    {stats.cancelledCount}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {stats.totalBookings > 0 ? Math.round((stats.cancelledCount / stats.totalBookings) * 100) : 0}% of volume
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Services Breakdown */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-base font-bold dark:text-white mb-4">
                Services Breakdown
              </h3>

              {Object.keys(stats.serviceMap).length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">No service types recorded.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(stats.serviceMap).map(([serviceName, item]) => {
                    const pct = stats.totalBookings > 0 ? Math.round((item.count / stats.totalBookings) * 100) : 0;
                    return (
                      <div key={serviceName} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-gray-800 dark:text-gray-200 font-semibold">{serviceName}</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {item.count} sessions • {currencySymbol}{item.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Rooms Performance Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-base font-bold dark:text-white mb-4 flex items-center gap-2">
                <Layers size={18} className="text-purple-500" />
                Room Utilization
              </h3>

              {(!rooms || rooms.length === 0) ? (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No studio rooms configured. Create rooms in the "Rooms" tab to track per-space utilization.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room: any) => {
                    const roomStats = stats.roomMap[String(room._id)] || { count: 0, hours: 0, revenue: 0 };
                    return (
                      <div
                        key={room._id}
                        className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border dark:border-gray-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-xs dark:text-white">{room.name}</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {room.hourlyRate ? `${currencySymbol}${room.hourlyRate}/hr` : 'Custom rate'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {roomStats.hours} hrs
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {currencySymbol}{roomStats.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Registered Clients Count Card */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Studio Client Roster</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                  {clients?.length || 0} Clients
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Direct and platform clients linked to {studio?.name}. Manage CRM profiles in the Clients tab.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

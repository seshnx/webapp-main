/**
 * Studio Dashboard View
 *
 * Role-specific dashboard for studio owners with booking schedule,
 * room utilization, equipment alerts, and technician availability.
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, Users, Wrench, Clock, TrendingUp } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';
import type { DashboardProps, RoleMetric, QuickAction, StudioDashboardData } from '@/types/dashboard';
import { StatsCard } from '../widgets/StatsCard';
import { RoleMetrics } from '../sections/RoleMetrics';
import { QuickActions } from '../sections/QuickActions';
import {
  useStudioByOwner,
  useBookingsByStudio,
  useRoomsByStudio
} from '@/hooks/useConvex';
import { useUpcomingBookings } from '@/services/bookingService';

interface StudioDashboardProps extends DashboardProps {
  subProfiles?: Record<string, any>;
  className?: string;
}

export function StudioDashboard({ userData, subProfiles, className = '' }: StudioDashboardProps) {
  // Get user by clerk ID to get the Convex user ID
  const userRecord = useQuery(
    api.users.getUserByClerkId,
    userData?.clerkId ? { clerkId: userData.clerkId } : "skip"
  );

  // Fetch studio data
  const studio = useStudioByOwner(userRecord?._id || (userData?.id as any));

  // Get studio ID from studio data
  const studioId = studio?._id;

  // Fetch real data from Convex
  const allBookings = useBookingsByStudio(studioId);
  const upcomingBookings = useUpcomingBookings(userData?.clerkId || '', 10);
  const rooms = useRoomsByStudio(studioId);

  // Calculate real dashboard data
  const data: StudioDashboardData = useMemo(() => {
    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = (allBookings || [])
      .filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate >= today && bookingDate < tomorrow;
      })
      .map(booking => ({
        id: booking._id,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        clientName: booking.clientName || 'Client',
        roomName: booking.roomName || 'Studio',
        status: booking.status
      }))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Calculate room utilization
    const totalRooms = (rooms || []).length;
    const bookedRooms = new Set(todayBookings.map(b => b.roomId)).size;
    const roomUtilization = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;

    // Pending maintenance (TODO: connect to maintenance system when implemented)
    const pendingMaintenance: any[] = [];

    // Available technicians (TODO: connect to technician availability when implemented)
    const availableTechs: any[] = [];

    return {
      todayBookings,
      roomUtilization,
      pendingMaintenance,
      availableTechs
    };
  }, [allBookings, rooms]);

  const metrics: RoleMetric[] = useMemo(() => [
    {
      id: 'today-bookings',
      label: "Today's Bookings",
      value: data.todayBookings.length,
      icon: Calendar,
      color: 'blue'
    },
    {
      id: 'utilization',
      label: 'Room Utilization',
      value: `${data.roomUtilization}%`,
      trend: 'up',
      trendPercentage: 5,
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'maintenance',
      label: 'Pending Maintenance',
      value: data.pendingMaintenance.length,
      icon: Wrench,
      color: 'amber'
    },
    {
      id: 'available-techs',
      label: 'Available Technicians',
      value: data.availableTechs.length,
      icon: Users,
      color: 'purple'
    }
  ], [data]);

  const quickActions: QuickAction[] = [
    {
      id: 'new-booking',
      label: 'New Booking',
      icon: Calendar,
      action: () => console.log('Create new booking'),
      variant: 'primary',
      roles: ['Studio', '*']
    },
    {
      id: 'view-calendar',
      label: 'View Calendar',
      icon: Calendar,
      action: () => console.log('Navigate to calendar'),
      variant: 'secondary',
      roles: ['Studio', '*']
    },
    {
      id: 'manage-equipment',
      label: 'Equipment',
      icon: Wrench,
      action: () => console.log('Navigate to equipment'),
      variant: 'secondary',
      roles: ['Studio', '*']
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Bookings"
          value={data.todayBookings.length}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Room Utilization"
          value={`${data.roomUtilization}%`}
          previousValue="73%"
          trend="up"
          trendPercentage={5}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Maintenance Alerts"
          value={data.pendingMaintenance.length}
          icon={AlertTriangle}
          color="amber"
        />
        <StatsCard
          title="Available Technicians"
          value={data.availableTechs.length}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <QuickActions actions={quickActions} role="Studio" />
      </div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Today's Schedule
        </h3>
        {data.todayBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bookings scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.todayBookings.map(booking => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {booking.clientName}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {booking.roomName} • {booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {booking.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Equipment Alerts */}
      {data.pendingMaintenance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800"
        >
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Equipment Maintenance Required
          </h3>
          <div className="space-y-3">
            {data.pendingMaintenance.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {item.equipment}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Reported: {item.reportedDate.toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                  item.priority === 'high'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                }`}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Technician Availability */}
      {data.availableTechs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Technicians
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.availableTechs.map(tech => (
              <div
                key={tech.id}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="font-semibold text-gray-900 dark:text-white text-base">
                  {tech.name}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {tech.specialties.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

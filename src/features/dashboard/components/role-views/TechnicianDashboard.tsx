/**
 * Technician Dashboard View
 *
 * Role-specific dashboard for studio technicians with service requests,
 * active jobs, and equipment warnings.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from 'convex/react';
import type { DashboardProps, RoleMetric, QuickAction, TechnicianDashboardData } from '@/types/dashboard';
import { StatsCard } from '../widgets/StatsCard';
import { RoleMetrics } from '../sections/RoleMetrics';
import { QuickActions } from '../sections/QuickActions';
import { api } from '@/@convex/api';

interface TechnicianDashboardProps extends DashboardProps {
  className?: string;
}

export function TechnicianDashboard({ userData, className = '' }: TechnicianDashboardProps) {
  // Fetch data from Convex
  const serviceRequests = useQuery(api.sbookings.getTechnicianServiceRequests,
    userData ? { technicianId: userData._id, status: "pending" } : "skip"
  );
  const activeJobs = useQuery(api.sbookings.getBookingsByTechnician,
    userData ? { technicianId: userData._id, status: "confirmed" } : "skip"
  );
  const earnings = useQuery(api.sbookings.getTechnicianEarnings,
    userData ? { technicianId: userData._id } : "skip"
  );

  // Calculate metrics from real data
  const pendingRequestsCount = serviceRequests?.length || 0;
  const activeJobsCount = activeJobs?.length || 0;
  const completedTodayCount = 0; // TODO: Implement completed today tracking
  const totalEarnings = earnings?.totalEarnings || 0;

  const [data, setData] = useState<TechnicianDashboardData>({
    serviceRequests: serviceRequests || [],
    activeJobs: activeJobs || [],
    equipmentWarnings: [] // TODO: Implement equipment warnings tracking
  });

  const [metrics, setMetrics] = useState<RoleMetric[]>([
    {
      id: 'pending-requests',
      label: 'Pending Service Requests',
      value: pendingRequestsCount,
      icon: Wrench,
      color: 'blue'
    },
    {
      id: 'active-jobs',
      label: 'Active Jobs',
      value: activeJobsCount,
      icon: Clock,
      color: 'green'
    },
    {
      id: 'completed-today',
      label: 'Completed Today',
      value: completedTodayCount,
      icon: CheckCircle,
      color: 'purple'
    },
    {
      id: 'equipment-warnings',
      label: 'Equipment Warnings',
      value: 0,
      icon: AlertTriangle,
      color: 'amber'
    }
  ]);

  const quickActions: QuickAction[] = [
    {
      id: 'new-service',
      label: 'New Service Request',
      icon: Wrench,
      action: () => console.log('Create service request'),
      variant: 'primary',
      roles: ['Technician', '*']
    },
    {
      id: 'my-schedule',
      label: 'My Schedule',
      icon: Calendar,
      action: () => console.log('Navigate to schedule'),
      variant: 'secondary',
      roles: ['Technician', '*']
    },
    {
      id: 'equipment-log',
      label: 'Equipment Log',
      icon: AlertTriangle,
      action: () => console.log('Navigate to equipment log'),
      variant: 'secondary',
      roles: ['Technician', '*']
    }
  ];

  // Update metrics when data changes
  useEffect(() => {
    setData({
      serviceRequests: serviceRequests || [],
      activeJobs: activeJobs || [],
      equipmentWarnings: [] // TODO: Implement equipment warnings tracking
    });

    setMetrics(prev => prev.map(m => {
      if (m.id === 'pending-requests') return { ...m, value: pendingRequestsCount };
      if (m.id === 'active-jobs') return { ...m, value: activeJobsCount };
      if (m.id === 'completed-today') return { ...m, value: completedTodayCount };
      if (m.id === 'equipment-warnings') return { ...m, value: 0 }; // TODO: Track equipment warnings
      return m;
    }));
  }, [pendingRequestsCount, activeJobsCount, completedTodayCount, serviceRequests, activeJobs]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Requests"
          value={data.serviceRequests.length}
          icon={Wrench}
          color="blue"
        />
        <StatsCard
          title="Active Jobs"
          value={data.activeJobs.length}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Completed Today"
          value={3}
          icon={CheckCircle}
          color="purple"
        />
        <StatsCard
          title="Equipment Warnings"
          value={data.equipmentWarnings.length}
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <QuickActions actions={quickActions} role="Technician" />
      </div>

      {/* Service Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Pending Service Requests
        </h3>
        {data.serviceRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pending service requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.serviceRequests.map(request => (
              <div
                key={request._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {request.serviceType || 'Studio Service'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {request.studioName || 'Studio Service Request'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <span className="font-medium">Studio:</span> {request.studioName || request.studioId}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {request.date} at {request.startTime}
                  </p>
                </div>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ml-4 flex-shrink-0 ${
                  request.status === "pending"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Active Jobs */}
      {data.activeJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Jobs
          </h3>
          <div className="space-y-3">
            {data.activeJobs.map(job => (
              <div
                key={job._id}
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {job.studioName || 'Studio Service'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.serviceType || 'General Service'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {job.date} at {job.startTime}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Equipment Warnings */}
      {data.equipmentWarnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800"
        >
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Equipment Warnings
          </h3>
          <div className="space-y-3">
            {data.equipmentWarnings.map(warning => (
              <div
                key={warning.equipmentId}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {warning.equipmentName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {warning.warning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

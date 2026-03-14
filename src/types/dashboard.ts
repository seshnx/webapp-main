/**
 * Dashboard Type Definitions
 *
 * Types for the new hybrid dashboard system with activity feed
 * and role-specific content.
 */

import type React from 'react';

// =====================================================
// ACTIVITY FEED TYPES
// =====================================================

export type ActivityType = 'post' | 'booking' | 'notification' | 'payment' | 'alert' | 'announcement';
export type ActivityPriority = 'high' | 'medium' | 'low';

export interface ActivityActor {
  id: string;
  displayName: string;
  photoURL?: string;
  role?: string;
}

export interface ActivityContent {
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  timestamp: Date;
  actor?: ActivityActor;
  content: ActivityContent;
  actionUrl?: string;
  icon?: React.ElementType;
  priority: ActivityPriority;
  read?: boolean;
}

// =====================================================
// QUICK ACTIONS TYPES
// =====================================================

export type QuickActionVariant = 'primary' | 'secondary' | 'danger' | 'success';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void | Promise<void>;
  variant: QuickActionVariant;
  roles: string[];
  badge?: number | string;
  disabled?: boolean;
}

// =====================================================
// WIDGET SYSTEM TYPES
// =====================================================

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';
export type WidgetType = 'stats' | 'feed' | 'quick-actions' | 'notifications' | 'custom' | 'metrics' | 'schedule';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title?: string;
  size: WidgetSize;
  position: { row: number; col: number };
  visible: boolean;
  config?: Record<string, any>;
}

export type DashboardLayout = 'default' | 'custom';

export interface DashboardConfig {
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  role: string;
  lastUpdated?: Date;
}

// =====================================================
// ROLE METRICS TYPES
// =====================================================

export interface RoleMetric {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
  icon?: React.ElementType;
  unit?: string;
  color?: string;
}

export interface RoleMetrics {
  role: string;
  metrics: RoleMetric[];
  period?: 'today' | 'week' | 'month' | 'year';
  lastUpdated: Date;
}

// =====================================================
// DASHBOARD PROPS
// =====================================================

export interface DashboardProps {
  user?: {
    id: string;
    uid?: string;
    email?: string;
  } | null;
  userData?: {
    accountTypes?: string[];
    activeProfileRole?: string;
    displayName?: string;
    effectiveDisplayName?: string;
    photoURL?: string;
    settings?: {
      dashboard?: DashboardConfig;
    };
  } | null;
  subProfiles?: Record<string, any>;
  setActiveTab?: (tab: string) => void;
  // Additional props from MainLayout
  bookingCount?: number;
  tokenBalance?: number;
}

// =====================================================
// ACTIVITY FEED FILTER
// =====================================================

export interface ActivityFilter {
  types?: ActivityType[];
  priorities?: ActivityPriority[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// =====================================================
// ROLE-SPECIFIC DATA TYPES
// =====================================================

export interface ProducerDashboardData {
  recentSales: number;
  streamingRevenue: number;
  collaborationInvites: number;
  beatUploads: number;
}

export interface StudioDashboardData {
  todayBookings: Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    clientName: string;
    roomName: string;
    status: string;
  }>;
  roomUtilization: number;
  pendingMaintenance: Array<{
    id: string;
    equipment: string;
    priority: string;
    reportedDate: Date;
  }>;
  availableTechs: Array<{
    id: string;
    name: string;
    specialties: string[];
  }>;
}

export interface TechnicianDashboardData {
  serviceRequests: Array<{
    id: string;
    studioId: string;
    equipment: string;
    issue: string;
    priority: string;
    status: string;
  }>;
  activeJobs: Array<{
    id: string;
    location: string;
    task: string;
    startTime: Date;
  }>;
  equipmentWarnings: Array<{
    equipmentId: string;
    equipmentName: string;
    warning: string;
  }>;
}

export interface LabelDashboardData {
  artistRoster: number;
  activeReleases: number;
  monthlyRoyalties: number;
  contractExpirations: Array<{
    artistName: string;
    expirationDate: Date;
  }>;
}

export interface TalentDashboardData {
  upcomingGigs: number;
  newFollowers: number;
  profileViews: number;
  collaborationRequests: number;
}

export interface EDUDashboardData {
  activeCourses: number;
  enrolledStudents: number;
  upcomingClasses: Array<{
    id: string;
    courseName: string;
    startTime: Date;
    enrolled: number;
  }>;
  assignmentsPending: number;
}

/**
 * Dashboard Component Index
 *
 * Centralized exports for all dashboard components.
 */

// Main Dashboard Component
export { default as Dashboard } from '../DashboardNew';

// Sections
export { GreetingSection } from './sections/GreetingSection';
export { ActivityFeedSection } from './sections/ActivityFeedSection';
export { RoleMetrics } from './sections/RoleMetrics';
export { QuickActions } from './sections/QuickActions';
export { NotificationsPanel } from './sections/NotificationsPanel';
export { WidgetGrid, WidgetWrapper } from './sections/WidgetGrid';

// Widgets
export { StatsCard } from './widgets/StatsCard';
export { ActivityItemWidget } from './widgets/ActivityItemWidget';
export { QuickActionCard } from './widgets/QuickActionCard';

// Role Views
export { ProducerDashboard } from './role-views/ProducerDashboard';
export { StudioDashboard } from './role-views/StudioDashboard';
export { TechnicianDashboard } from './role-views/TechnicianDashboard';
export { TalentDashboard } from './role-views/TalentDashboard';
export { EDUDashboard } from './role-views/EDUDashboard';

// Types
export type {
  ActivityItem,
  ActivityFilter,
  ActivityType,
  ActivityPriority,
  ActivityActor,
  QuickAction,
  QuickActionVariant,
  DashboardWidget,
  DashboardConfig,
  DashboardLayout,
  DashboardProps,
  RoleMetric,
  RoleMetrics,
  ProducerDashboardData,
  StudioDashboardData,
  TechnicianDashboardData,
  LabelDashboardData,
  TalentDashboardData,
  EDUDashboardData
} from '../../types/dashboard';

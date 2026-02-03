// src/contexts/PlatformAdminContext.tsx
// Context for the main webapp to indicate there's a separate Platform Admin app

import React, { createContext, useContext } from 'react';

/**
 * Platform admin only features list
 */
export type AdminOnlyFeature =
  | 'Create new schools'
  | 'Manage platform-wide settings'
  | 'View all schools'
  | 'Platform analytics'
  | 'User management across all schools'
  | 'Billing and subscription management'
  | 'System configuration';

/**
 * Main app admin features list
 */
export type MainAppAdminFeature =
  | 'Access EDU dashboards'
  | 'View school data'
  | 'Manage school-specific content';

/**
 * Platform admin configuration interface
 */
export interface PlatformAdminConfig {
  hasSeparateAdminApp: boolean;
  adminAppUrl: string;
  adminOnlyFeatures: AdminOnlyFeature[];
  mainAppAdminFeatures: MainAppAdminFeature[];
}

/**
 * Platform admin context value interface
 */
export interface PlatformAdminContextValue extends PlatformAdminConfig {
  shouldRedirectToAdminApp: (feature: string) => boolean;
  getAdminAppUrl: (feature?: string) => string;
}

/**
 * Platform admin provider props interface
 */
export interface PlatformAdminProviderProps {
  children: React.ReactNode;
}

const PlatformAdminContext = createContext<PlatformAdminContextValue | undefined>(undefined);

/**
 * Hook for accessing platform admin context
 *
 * @returns Platform admin context value
 *
 * @example
 * function AdminFeature() {
 *   const { shouldRedirectToAdminApp, getAdminAppUrl } = usePlatformAdmin();
 *
 *   if (shouldRedirectToAdminApp('Create new schools')) {
 *     return <a href={getAdminAppUrl('schools')}>Go to Admin App</a>;
 *   }
 *
 *   return <div>Feature available here</div>;
 * }
 */
export function usePlatformAdmin(): PlatformAdminContextValue | undefined {
  return useContext(PlatformAdminContext);
}

/**
 * Platform Admin Provider Component
 *
 * Provides configuration for the separate Platform Admin app
 *
 * @param props - Provider props
 * @returns Platform admin context provider
 *
 * @example
 * function App() {
 *   return (
 *     <PlatformAdminProvider>
 *       <YourApp />
 *     </PlatformAdminProvider>
 *   );
 * }
 */
export function PlatformAdminProvider({ children }: PlatformAdminProviderProps): React.ReactElement {
  // Configuration for the separate Platform Admin app
  const platformAdminConfig: PlatformAdminConfig = {
    // Indicates that platform admin features are handled by a separate app
    hasSeparateAdminApp: true,

    // URL to the Platform Admin app (if needed for redirects or links)
    adminAppUrl: import.meta.env.VITE_PLATFORM_ADMIN_URL || 'https://admin.seshnx.com',

    // Features that are only available in the Platform Admin app
    adminOnlyFeatures: [
      'Create new schools',
      'Manage platform-wide settings',
      'View all schools',
      'Platform analytics',
      'User management across all schools',
      'Billing and subscription management',
      'System configuration'
    ],

    // Features available in the main app for Global Admins
    mainAppAdminFeatures: [
      'Access EDU dashboards',
      'View school data',
      'Manage school-specific content'
    ]
  };

  const value: PlatformAdminContextValue = {
    ...platformAdminConfig,
    // Helper to check if a feature should redirect to admin app
    shouldRedirectToAdminApp: (feature: string): boolean => {
      return platformAdminConfig.adminOnlyFeatures.some(f =>
        feature.toLowerCase().includes(f.toLowerCase())
      );
    },
    // Helper to get admin app URL for a specific feature
    getAdminAppUrl: (feature = ''): string => {
      const baseUrl = platformAdminConfig.adminAppUrl;
      if (feature) {
        return `${baseUrl}/${feature.toLowerCase().replace(/\s+/g, '-')}`;
      }
      return baseUrl;
    }
  };

  return (
    <PlatformAdminContext.Provider value={value}>
      {children}
    </PlatformAdminContext.Provider>
  );
}

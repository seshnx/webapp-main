// src/contexts/PlatformAdminContext.jsx
// Context for the main webapp to indicate there's a separate Platform Admin app

import React, { createContext, useContext } from 'react';

const PlatformAdminContext = createContext();

export function usePlatformAdmin() {
    return useContext(PlatformAdminContext);
}

export function PlatformAdminProvider({ children }) {
    // Configuration for the separate Platform Admin app
    const platformAdminConfig = {
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
            'View platform data',
            'Manage platform-specific content'
        ]
    };

    const value = {
        ...platformAdminConfig,
        // Helper to check if a feature should redirect to admin app
        shouldRedirectToAdminApp: (feature) => {
            return platformAdminConfig.adminOnlyFeatures.some(f => 
                feature.toLowerCase().includes(f.toLowerCase())
            );
        },
        // Helper to get admin app URL for a specific feature
        getAdminAppUrl: (feature = '') => {
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


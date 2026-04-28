import { LucideIcon } from 'lucide-react';
import type { AccountType, UserData } from './index';

// Settings Tab ID type
export type SettingsTabId =
    | 'general'
    | 'security'
    | 'notifications'
    | 'messaging'
    | 'social'
    | 'bookings'
    | 'marketplace'
    | 'content'
    | 'accessibility'
    | 'performance';

// Tab definition interface
export interface SettingsTabDef {
    id: SettingsTabId;
    labelKey: string;
    icon: LucideIcon;
}

// Privacy settings
export interface PrivacySettings {
    publicProfile?: boolean;
    showLocation?: boolean;
    hideProfile?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    showOnlineStatus?: boolean;
    showLastSeen?: boolean;
    allowSearchEngines?: boolean;
    allowTagging?: boolean;
    reviewTagsBeforeAppear?: boolean;
    showFollowingList?: boolean;
    showFollowersList?: boolean;
}

// Notification settings by category
export interface NotificationCategorySettings {
    newRequests?: boolean;
    confirmations?: boolean;
    reminders?: boolean;
    cancellations?: boolean;
}

export interface SocialNotificationSettings {
    likes?: boolean;
    comments?: boolean;
    follows?: boolean;
    mentions?: boolean;
    reposts?: boolean;
}

export interface MarketplaceNotificationSettings {
    newOffers?: boolean;
    sales?: boolean;
    messages?: boolean;
}

export interface SystemNotificationSettings {
    maintenance?: boolean;
    updates?: boolean;
    security?: boolean;
}

export interface QuietHoursSettings {
    enabled?: boolean;
    start?: string;
    end?: string;
}

// Notifications settings
export interface NotificationsSettings {
    email?: boolean;
    push?: boolean;
    marketing?: boolean;
    booking?: NotificationCategorySettings;
    social?: SocialNotificationSettings;
    marketplace?: MarketplaceNotificationSettings;
    system?: SystemNotificationSettings;
    quietHours?: QuietHoursSettings;
    soundEnabled?: boolean;
    badgeCount?: boolean;
}

// Messaging settings
export interface MessagingSettings {
    readReceipts?: boolean;
    typingIndicators?: boolean;
    messageRequests?: boolean;
    whoCanMessage?: 'everyone' | 'followers' | 'none';
    autoArchive?: boolean;
    soundNotifications?: boolean;
    previewInNotifications?: boolean;
    mutedThreads?: string[];
    blockedContacts?: string[];
}

// Social settings
export interface SocialSettings {
    feedAlgorithm?: 'chronological' | 'recommended' | 'following';
    autoPlayVideos?: boolean;
    showSensitiveContentWarning?: boolean;
    showActivityStatus?: boolean;
    showSuggestedAccounts?: boolean;
    mutedUsers?: string[];
    blockedUsers?: string[];
}

// Content filtering settings
export interface ContentFilteringSettings {
    sensitivityFilter?: 'off' | 'low' | 'medium' | 'high';
    hideKeywords?: string[];
    muteWords?: string[];
    autoHideReported?: boolean;
    showAgeRestricted?: boolean;
}

// Booking settings
export interface BookingSettings {
    autoAccept?: boolean;
    autoAcceptCriteria?: Record<string, any>;
    defaultBufferTime?: number;
    showAvailabilityPublicly?: boolean;
    requireDeposit?: boolean;
    autoDeclineExpired?: boolean;
    defaultSessionDuration?: number;
    notifications?: NotificationCategorySettings;
}

// Marketplace settings
export interface MarketplaceSettings {
    autoListItems?: boolean;
    requireApproval?: boolean;
    defaultShippingMethod?: string;
    defaultPaymentTerms?: string;
    autoAcceptOffersAbove?: boolean;
    autoAcceptThreshold?: number;
    showSoldItems?: boolean;
    notifications?: MarketplaceNotificationSettings;
}

// Content settings
export interface ContentSettings {
    imageQuality?: 'high' | 'medium' | 'low';
    videoQuality?: 'high' | 'medium' | 'low';
    autoSaveUploaded?: boolean;
    compressImages?: boolean;
    maxUploadSize?: number;
}

// Accessibility settings
export interface AccessibilitySettings {
    fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
    reducedMotion?: boolean;
    highContrast?: boolean;
    screenReaderAnnouncements?: boolean;
    keyboardHints?: boolean;
}

// UI preferences
export interface UIPreferences {
    showBreadcrumbs?: boolean;
    compactMode?: boolean;
    sidebarCollapsed?: boolean;
}

// Performance settings
export interface PerformanceSettings {
    dataUsage?: 'wifi-only' | 'auto' | 'never';
    offlineMode?: boolean;
    backgroundSync?: boolean;
    autoClearOldNotifications?: boolean;
    autoClearAfterDays?: number;
}

// Legacy preferences
export interface LegacyPreferences {
    seeAllProfiles?: boolean;
}

// Complete settings interface
export interface ExtendedSettings {
    // General
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
    timezone?: string;
    currency?: string;
    numberFormat?: string;

    // Security & Privacy
    privacy?: PrivacySettings;
    twoFactorEnabled?: boolean;

    // Notifications
    notifications?: NotificationsSettings;

    // Messaging
    messaging?: MessagingSettings;

    // Social & Feed
    social?: SocialSettings;
    contentFiltering?: ContentFilteringSettings;

    // Bookings
    bookings?: BookingSettings;

    // Marketplace
    marketplace?: MarketplaceSettings;

    // Content & Media
    content?: ContentSettings;

    // Accessibility
    accessibility?: AccessibilitySettings;

    // UI Preferences
    ui?: UIPreferences;

    // Performance
    performance?: PerformanceSettings;

    // Legacy/Other
    preferences?: LegacyPreferences;
}

export interface SettingsUser {
    id: string;
    email: string;
    [key: string]: any;
}

export interface SubProfiles {
    [role: string]: {
        display_name?: string;
        profile_data?: Record<string, any>;
    } | undefined;
}

export interface SettingsTabProps {
    user: SettingsUser | null;
    userData?: UserData | null;
    onUpdate?: (updatedUserData: UserData) => void;
    onRoleSwitch?: (newRole: AccountType) => void;
    subProfiles?: SubProfiles;
}

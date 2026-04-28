import { z } from 'zod';
import { useZodForm } from '@/hooks/useZodForm';
import { useState, useCallback, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/api';
import { ExtendedSettings, AccountType, SubProfiles } from '@/types';
import { toast } from 'react-hot-toast';

// Roles that should never be shown in account settings (managed through other systems)
const HIDDEN_ROLES: AccountType[] = ['Student', 'EDUStaff', 'Intern', 'EDUAdmin', 'GAdmin'];

// -----------------------------------------------------------------------------
// SCHEMAS
// -----------------------------------------------------------------------------

const privacySchema = z.object({
  publicProfile: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  hideProfile: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
  showLastSeen: z.boolean().optional(),
  allowSearchEngines: z.boolean().optional(),
  allowTagging: z.boolean().optional(),
  reviewTagsBeforeAppear: z.boolean().optional(),
  showFollowingList: z.boolean().optional(),
  showFollowersList: z.boolean().optional(),
});

const notificationCategorySchema = z.object({
  newRequests: z.boolean().optional(),
  confirmations: z.boolean().optional(),
  reminders: z.boolean().optional(),
  cancellations: z.boolean().optional(),
});

const socialNotificationSchema = z.object({
  likes: z.boolean().optional(),
  comments: z.boolean().optional(),
  follows: z.boolean().optional(),
  mentions: z.boolean().optional(),
  reposts: z.boolean().optional(),
});

const marketplaceNotificationSchema = z.object({
  newOffers: z.boolean().optional(),
  sales: z.boolean().optional(),
  messages: z.boolean().optional(),
});

const systemNotificationSchema = z.object({
  maintenance: z.boolean().optional(),
  updates: z.boolean().optional(),
  security: z.boolean().optional(),
});

const quietHoursSchema = z.object({
  enabled: z.boolean().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
});

const notificationsSettingsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  marketing: z.boolean().optional(),
  booking: notificationCategorySchema.optional(),
  social: socialNotificationSchema.optional(),
  marketplace: marketplaceNotificationSchema.optional(),
  system: systemNotificationSchema.optional(),
  quietHours: quietHoursSchema.optional(),
  soundEnabled: z.boolean().optional(),
  badgeCount: z.boolean().optional(),
});

const messagingSettingsSchema = z.object({
  readReceipts: z.boolean().optional(),
  typingIndicators: z.boolean().optional(),
  messageRequests: z.boolean().optional(),
  whoCanMessage: z.enum(['everyone', 'followers', 'none']).optional(),
  autoArchive: z.boolean().optional(),
  soundNotifications: z.boolean().optional(),
  previewInNotifications: z.boolean().optional(),
  mutedThreads: z.array(z.string()).optional(),
  blockedContacts: z.array(z.string()).optional(),
});

const socialSettingsSchema = z.object({
  feedAlgorithm: z.enum(['chronological', 'recommended', 'following']).optional(),
  autoPlayVideos: z.boolean().optional(),
  showSensitiveContentWarning: z.boolean().optional(),
  showActivityStatus: z.boolean().optional(),
  showSuggestedAccounts: z.boolean().optional(),
  mutedUsers: z.array(z.string()).optional(),
  blockedUsers: z.array(z.string()).optional(),
});

const contentFilteringSchema = z.object({
  sensitivityFilter: z.enum(['off', 'low', 'medium', 'high']).optional(),
  hideKeywords: z.array(z.string()).optional(),
  muteWords: z.array(z.string()).optional(),
  autoHideReported: z.boolean().optional(),
  showAgeRestricted: z.boolean().optional(),
});

const bookingSettingsSchema = z.object({
  autoAccept: z.boolean().optional(),
  autoAcceptCriteria: z.record(z.any()).optional(),
  defaultBufferTime: z.number().optional(),
  showAvailabilityPublicly: z.boolean().optional(),
  requireDeposit: z.boolean().optional(),
  autoDeclineExpired: z.boolean().optional(),
  defaultSessionDuration: z.number().optional(),
  notifications: notificationCategorySchema.optional(),
});

const marketplaceSettingsSchema = z.object({
  autoListItems: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  defaultShippingMethod: z.string().optional(),
  defaultPaymentTerms: z.string().optional(),
  autoAcceptOffersAbove: z.boolean().optional(),
  autoAcceptThreshold: z.number().optional(),
  showSoldItems: z.boolean().optional(),
  notifications: marketplaceNotificationSchema.optional(),
});

const contentSettingsSchema = z.object({
  imageQuality: z.enum(['high', 'medium', 'low']).optional(),
  videoQuality: z.enum(['high', 'medium', 'low']).optional(),
  autoSaveUploaded: z.boolean().optional(),
  compressImages: z.boolean().optional(),
  maxUploadSize: z.number().optional(),
});

const accessibilitySettingsSchema = z.object({
  fontSize: z.enum(['small', 'medium', 'large', 'xlarge']).optional(),
  reducedMotion: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  screenReaderAnnouncements: z.boolean().optional(),
  keyboardHints: z.boolean().optional(),
});

const uiPreferencesSchema = z.object({
  showBreadcrumbs: z.boolean().optional(),
  compactMode: z.boolean().optional(),
  sidebarCollapsed: z.boolean().optional(),
});

const performanceSettingsSchema = z.object({
  dataUsage: z.enum(['wifi-only', 'auto', 'never']).optional(),
  offlineMode: z.boolean().optional(),
  backgroundSync: z.boolean().optional(),
  autoClearOldNotifications: z.boolean().optional(),
  autoClearAfterDays: z.number().optional(),
});

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  numberFormat: z.string().optional(),
  privacy: privacySchema.optional(),
  twoFactorEnabled: z.boolean().optional(),
  notifications: notificationsSettingsSchema.optional(),
  messaging: messagingSettingsSchema.optional(),
  social: socialSettingsSchema.optional(),
  contentFiltering: contentFilteringSchema.optional(),
  bookings: bookingSettingsSchema.optional(),
  marketplace: marketplaceSettingsSchema.optional(),
  content: contentSettingsSchema.optional(),
  accessibility: accessibilitySettingsSchema.optional(),
  ui: uiPreferencesSchema.optional(),
  performance: performanceSettingsSchema.optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// -----------------------------------------------------------------------------
// HOOK
// -----------------------------------------------------------------------------

interface UseSettingsFormProps {
  user: any;
  userData: any;
  onUpdate?: (data: any) => void;
  onRoleSwitch?: (role: AccountType) => void;
  subProfiles?: SubProfiles;
}

export function useSettingsForm({ user, userData, onUpdate, onRoleSwitch, subProfiles }: UseSettingsFormProps, clerk: any) {
  const updateProfileMutation = useMutation(api.users.updateProfile);
  
  const [saving, setSaving] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToRemove, setRoleToRemove] = useState<AccountType | null>(null);
  const [showRoleRemoveModal, setShowRoleRemoveModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityAction, setSecurityAction] = useState<'email' | 'password' | null>(null);
  const [securityForm, setSecurityForm] = useState({
    newEmail: '',
    newPassword: '',
    currentPassword: ''
  });
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);

  // Form State
  const form = useZodForm({
    schema: settingsSchema,
    defaultValues: (userData?.settings as any) || {},
  });

  const localSettings = form.watch();

  // Role State
  const [roles, setRoles] = useState<AccountType[]>(userData?.accountTypes || []);
  const [activeRole, setActiveRole] = useState<AccountType>(userData?.activeProfileRole || roles[0] || 'Fan');
  const [preferredRole, setPreferredRole] = useState<AccountType>(userData?.preferredRole || roles[0] || 'Fan');
  const [defaultProfileRole, setDefaultProfileRole] = useState<AccountType>(
    userData?.defaultProfileRole || userData?.activeProfileRole || roles[0] || 'Fan'
  );

  // Sync with userData
  useEffect(() => {
    if (userData?.settings) {
      form.reset(userData.settings);
    }
    if (userData?.accountTypes) {
      setRoles(userData.accountTypes);
    }
    if (userData?.activeProfileRole) {
      setActiveRole(userData.activeProfileRole);
    }
  }, [userData, form.reset]);

  const saveSettings = useCallback(async (data: SettingsFormData) => {
    if (!userData?._id) return;
    setSaving(true);
    try {
      await updateProfileMutation({
        id: userData._id,
        settings: data as any,
        defaultProfileRole: defaultProfileRole as any
      });
      toast.success('Settings saved successfully');
      if (onUpdate) {
        onUpdate({ ...userData, settings: data, defaultProfileRole });
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [userData, updateProfileMutation, onUpdate, defaultProfileRole]);

  const handleToggle = useCallback((category: keyof ExtendedSettings | null, key: string, subKey: string | null = null) => {
    const path = subKey ? `${category}.${key}.${subKey}` : category ? `${category}.${key}` : key;
    const current = (form.getValues() as any)[path];
    form.setValue(path as any, !current, { shouldDirty: true });
    
    // Auto-save behavior if needed (original code auto-saved on toggle)
    if (userData?._id) {
       updateProfileMutation({
         id: userData._id,
         settings: { ...form.getValues(), [path]: !current } as any
       }).catch(err => console.error('Auto-save failed:', err));
    }
  }, [form, userData?._id, updateProfileMutation]);

  const handleValueChange = useCallback((category: keyof ExtendedSettings | null, key: string, value: any, subKey: string | null = null) => {
    const path = subKey ? `${category}.${key}.${subKey}` : category ? `${category}.${key}` : key;
    form.setValue(path as any, value, { shouldDirty: true });
    
    if (userData?._id) {
        updateProfileMutation({
          id: userData._id,
          settings: { ...form.getValues(), [path]: value } as any
        }).catch(err => console.error('Auto-save failed:', err));
     }
  }, [form, userData?._id, updateProfileMutation]);

  const handleThemeChange = useCallback((theme: string) => {
    handleValueChange(null, 'theme', theme);
  }, [handleValueChange]);

  const updateAccountTypes = async () => {
    if (roles.length === 0 || !userData?._id) return toast.error("You must have at least one role.");
    setSaving(true);
    try {
      let newActiveRole = activeRole;
      if (!roles.includes(activeRole)) {
        newActiveRole = roles.find(r => !HIDDEN_ROLES.includes(r)) || roles[0];
        setActiveRole(newActiveRole);
        if (onRoleSwitch) onRoleSwitch(newActiveRole);
      }

      await updateProfileMutation({
        id: userData._id,
        accountTypes: roles as any,
        activeProfileRole: newActiveRole as any,
      });

      if (onUpdate) {
        onUpdate({ ...userData, accountTypes: roles, activeProfileRole: newActiveRole });
      }
      toast.success("Roles & Preferences updated!");
    } catch (e) {
      console.error("Update roles failed:", e);
      toast.error("Failed to update roles");
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role: AccountType) => {
    if (roles.includes(role)) {
      const hasSubProfile = subProfiles?.[role] && (
        subProfiles[role]!.display_name ||
        (subProfiles[role]!.profile_data && Object.keys(subProfiles[role]!.profile_data).length > 0)
      );

      if (roles.length === 1) {
        toast.error("You must have at least one role.");
        return;
      }

      if (hasSubProfile) {
        setRoleToRemove(role);
        setShowRoleRemoveModal(true);
        return;
      }
      setRoles(prev => prev.filter(r => r !== role));
    } else {
      setRoles(prev => [...prev, role]);
    }
  };

  const confirmRoleRemoval = () => {
    if (roleToRemove) {
      setRoles(prev => prev.filter(r => r !== roleToRemove));
      setShowRoleRemoveModal(false);
      setRoleToRemove(null);
    }
  };

  const cancelRoleRemoval = () => {
    setShowRoleRemoveModal(false);
    setRoleToRemove(null);
  };

  const openSecurityModal = (action: 'email' | 'password') => {
    setSecurityAction(action);
    setSecurityForm({ newEmail: '', newPassword: '', currentPassword: '' });
    setShowSecurityModal(true);
  };

  const handleSecurityUpdate = async () => {
    if (!securityForm.currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    setIsSecurityLoading(true);
    try {
      toast.info("Security management is handled through Clerk profile.");
      setShowSecurityModal(false);
    } catch (e) {
      toast.error("Security update failed");
    } finally {
      setIsSecurityLoading(false);
    }
  };

  const handleDataExport = async () => {
    if (!userData?._id) return;
    setExporting(true);
    try {
      const exportData = {
        profile: userData,
        exportDate: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `seshnx-export-${userData._id}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const clearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Cache cleared!");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error("Please type 'DELETE' to confirm.");
      return;
    }
    setIsDeleting(true);
    try {
      toast.info("Account deletion implementation pending.");
      // await clerk.signOut();
      // window.location.href = '/';
    } catch (error) {
      toast.error("Deletion failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    localSettings,
    setLocalSettings: (s: any) => form.reset(s),
    roles,
    setRoles,
    preferredRole,
    setPreferredRole,
    activeRole,
    setActiveRole,
    defaultProfileRole,
    setDefaultProfileRole,
    saving,
    setSaving,
    exporting,
    setExporting,
    activeSessions,
    setActiveSessions,
    isDeleting,
    setIsDeleting,
    deleteConfirm,
    setDeleteConfirm,
    showDeleteModal,
    setShowDeleteModal,
    roleToRemove,
    setRoleToRemove,
    showRoleRemoveModal,
    setShowRoleRemoveModal,
    showSecurityModal,
    setShowSecurityModal,
    securityAction,
    setSecurityAction,
    securityForm,
    setSecurityForm,
    isSecurityLoading,
    setIsSecurityLoading,
    handleToggle,
    handleValueChange,
    handleThemeChange,
    saveSettings: form.handleSubmit(saveSettings),
    updateAccountTypes,
    toggleRole,
    confirmRoleRemoval,
    cancelRoleRemoval,
    openSecurityModal,
    handleSecurityUpdate,
    handleDataExport,
    handleDeleteAccount,
    clearCache,
    settingsLoading,
    form
  };
}

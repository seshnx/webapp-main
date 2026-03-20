# Using the Settings System

This guide provides practical examples for using the comprehensive settings system in SeshNx.

## Table of Contents
- [User Settings](#user-settings)
- [Notification Settings](#notification-settings)
- [Privacy Settings](#privacy-settings)
- [Security Settings](#security-settings)
- [App Settings](#app-settings)
- [Data Export & Deletion](#data-export--deletion)

---

## User Settings

User settings control display preferences and accessibility options.

### Getting User Settings

```typescript
import { useUserSettings } from '@/hooks/useConvex';

function UserPreferencesPanel() {
  const { data: settings, isLoading } = useUserSettings(userId);

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="settings-panel">
      <h2>Display Settings</h2>

      {/* Theme Selection */}
      <label>
        Theme:
        <select
          value={settings?.theme || 'system'}
          onChange={(e) => updateTheme(e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System Default</option>
        </select>
      </label>

      {/* Language Selection */}
      <label>
        Language:
        <select
          value={settings?.language || 'en'}
          onChange={(e) => updateLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </label>

      {/* Font Size (Accessibility) */}
      <label>
        Font Size:
        <select
          value={settings?.fontSize || 'medium'}
          onChange={(e) => updateFontSize(e.target.value)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="extraLarge">Extra Large</option>
        </select>
      </label>

      {/* Accessibility Toggles */}
      <label>
        <input
          type="checkbox"
          checked={settings?.reduceMotion || false}
          onChange={(e) => updateReduceMotion(e.target.checked)}
        />
        Reduce Motion
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings?.highContrast || false}
          onChange={(e) => updateHighContrast(e.target.checked)}
        />
        High Contrast Mode
      </label>
    </div>
  );
}
```

### Updating User Settings

```typescript
import { useUpdateUserSettings } from '@/hooks/useConvex';

function SettingsForm() {
  const updateSettings = useUpdateUserSettings();

  const handleSave = async (formData) => {
    await updateSettings({
      userId,
      theme: formData.theme,
      language: formData.language,
      timezone: formData.timezone,
      dateFormat: formData.dateFormat,
      timeFormat: formData.timeFormat,
      fontSize: formData.fontSize,
      reduceMotion: formData.reduceMotion,
      highContrast: formData.highContrast,
      dataSaver: formData.dataSaver,
    });

    toast.success('Settings saved!');
  };

  return <form onSubmit={handleSave}>...</form>;
}
```

### Resetting to Defaults

```typescript
import { useResetUserSettings } from '@/hooks/useConvex';

function ResetButton() {
  const resetSettings = useResetUserSettings();

  const handleReset = async () => {
    if (confirm('Reset all settings to default values?')) {
      await resetSettings({ userId });
      toast.success('Settings reset to defaults');
    }
  };

  return <button onClick={handleReset}>Reset to Defaults</button>;
}
```

---

## Notification Settings

Notification settings provide granular control over all notification types.

### Getting Notification Settings

```typescript
import { useNotificationSettings } from '@/hooks/useConvex';

function NotificationPanel() {
  const { data: settings, isLoading } = useNotificationSettings(userId);

  if (isLoading) return <div>Loading notifications...</div>;

  return (
    <div className="notification-settings">
      <h2>Notification Preferences</h2>

      {/* Delivery Methods */}
      <div className="delivery-methods">
        <h3>How to Receive Notifications</h3>
        <label>
          <input
            type="checkbox"
            checked={settings?.pushEnabled || false}
            onChange={(e) => updatePushEnabled(e.target.checked)}
          />
          Push Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings?.emailEnabled || false}
            onChange={(e) => updateEmailEnabled(e.target.checked)}
          />
          Email Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings?.inAppEnabled !== false} // Default true
            onChange={(e) => updateInAppEnabled(e.target.checked)}
          />
          In-App Notifications
        </label>
      </div>

      {/* Social Notifications */}
      <div className="social-notifications">
        <h3>Social Notifications</h3>
        <NotificationToggle
          label="New Followers"
          checked={settings?.newFollower}
          onChange={(checked) => updateSocialNotifications({ newFollower: checked })}
        />
        <NotificationToggle
          label="New Comments"
          checked={settings?.newComment}
          onChange={(checked) => updateSocialNotifications({ newComment: checked })}
        />
        <NotificationToggle
          label="Post Likes"
          checked={settings?.postLike}
          onChange={(checked) => updateSocialNotifications({ postLike: checked })}
        />
        {/* ... more social notifications */}
      </div>

      {/* Booking Notifications */}
      <div className="booking-notifications">
        <h3>Booking Notifications</h3>
        <NotificationToggle
          label="New Booking Requests"
          checked={settings?.newBookingRequest}
          onChange={(checked) => updateBookingNotifications({ newBookingRequest: checked })}
        />
        <NotificationToggle
          label="Booking Reminders"
          checked={settings?.bookingReminder}
          onChange={(checked) => updateBookingNotifications({ bookingReminder: checked })}
        />
        {/* ... more booking notifications */}
      </div>

      {/* EDU Notifications */}
      <div className="edu-notifications">
        <h3>Education Notifications</h3>
        <NotificationToggle
          label="New Announcements"
          checked={settings?.eduNewAnnouncement}
          onChange={(checked) => updateEDUNotifications({ eduNewAnnouncement: checked })}
        />
        <NotificationToggle
          label="Assignment Due"
          checked={settings?.assignmentDue}
          onChange={(checked) => updateEDUNotifications({ assignmentDue: checked })}
        />
        {/* ... more EDU notifications */}
      </div>
    </div>
  );
}

function NotificationToggle({ label, checked, onChange }) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
```

### Updating Notification Categories

```typescript
import { useUpdateSocialNotificationSettings } from '@/hooks/useConvex';

function SocialNotificationSettings() {
  const updateSocial = useUpdateSocialNotificationSettings();

  const handleSave = async () => {
    await updateSocial({
      userId,
      newFollower: true,
      newComment: true,
      postLike: false,
      postReaction: false,
      postShare: true,
      mentionedInPost: true,
      taggedInPhoto: true,
    });
  };

  return <button onClick={handleSave}>Save Social Notifications</button>;
}
```

### Enable/Disable All Notifications

```typescript
import { useEnableAllNotifications, useDisableAllNotifications } from '@/hooks/useConvex';

function NotificationQuickActions() {
  const enableAll = useEnableAllNotifications();
  const disableAll = useDisableAllNotifications();

  const handleEnableAll = async () => {
    await enableAll({ userId });
    toast.success('All notifications enabled');
  };

  const handleDisableAll = async () => {
    await disableAll({ userId });
    toast.success('All notifications disabled');
  };

  return (
    <div>
      <button onClick={handleEnableAll}>Enable All</button>
      <button onClick={handleDisableAll}>Disable All</button>
    </div>
  );
}
```

---

## Privacy Settings

Privacy settings control who can interact with you and your content.

### Getting Privacy Settings

```typescript
import { usePrivacySettings } from '@/hooks/useConvex';

function PrivacyPanel() {
  const { data: settings, isLoading } = usePrivacySettings(userId);

  if (isLoading) return <div>Loading privacy settings...</div>;

  return (
    <div className="privacy-settings">
      <h2>Privacy Settings</h2>

      {/* Profile Visibility */}
      <label>
        Who can view my profile:
        <select
          value={settings?.whoCanViewProfile || 'everyone'}
          onChange={(e) => updateProfileVisibility(e.target.value)}
        >
          <option value="everyone">Everyone</option>
          <option value="followers">Followers Only</option>
          <option value="private">Private</option>
        </select>
      </label>

      {/* Message Permissions */}
      <label>
        Who can send me messages:
        <select
          value={settings?.whoCanSendMessage || 'everyone'}
          onChange={(e) => updateMessagePermission(e.target.value)}
        >
          <option value="everyone">Everyone</option>
          <option value="followers">Followers Only</option>
          <option value="none">No One</option>
        </select>
      </label>

      {/* Online Status */}
      <label>
        <input
          type="checkbox"
          checked={settings?.showOnlineStatus !== false} // Default true
          onChange={(e) => updateShowOnlineStatus(e.target.checked)}
        />
        Show when I'm active
      </label>

      {/* Private Account */}
      <label>
        <input
          type="checkbox"
          checked={settings?.privateAccount || false}
          onChange={(e) => updatePrivateAccount(e.target.checked)}
        />
        Private account (only followers can see posts)
      </label>

      {/* Data Collection */}
      <label>
        <input
          type="checkbox"
          checked={settings?.dataCollectionForAnalytics !== false} // Default true
          onChange={(e) => updateDataCollection(e.target.checked)}
        />
        Allow data collection for analytics
      </label>
    </div>
  );
}
```

### Blocking Users

```typescript
import { useBlockUser, useUnblockUser } from '@/hooks/useConvex';

function BlockButton({ userId, blockedUserId }) {
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const [isBlocked, setIsBlocked] = useState(false);

  const handleBlock = async () => {
    await blockUser({
      userId,
      blockedUserId,
    });
    setIsBlocked(true);
    toast.success('User blocked');
  };

  const handleUnblock = async () => {
    await unblockUser({
      userId,
      blockedUserId,
    });
    setIsBlocked(false);
    toast.success('User unblocked');
  };

  return (
    <button onClick={isBlocked ? handleUnblock : handleBlock}>
      {isBlocked ? 'Unblock' : 'Block'}
    </button>
  );
}
```

### Muting Users

```typescript
import { useMuteUser, useUnmuteUser } from '@/hooks/useConvex';

function MuteButton({ userId, mutedUserId }) {
  const muteUser = useMuteUser();
  const unmuteUser = useUnmuteUser();
  const [isMuted, setIsMuted] = useState(false);

  const handleMute = async () => {
    await muteUser({
      userId,
      mutedUserId,
    });
    setIsMuted(true);
    toast.success('User muted');
  };

  const handleUnmute = async () => {
    await unmuteUser({
      userId,
      mutedUserId,
    });
    setIsMuted(false);
    toast.success('User unmuted');
  };

  return (
    <button onClick={isMuted ? handleUnmute : handleMute}>
      {isMuted ? 'Unmute' : 'Mute'}
    </button>
  );
}
```

### Restricted Words

```typescript
import { useAddRestrictedWord, useRemoveRestrictedWord } from '@/hooks/useConvex';

function RestrictedWordsManager({ userId }) {
  const addWord = useAddRestrictedWord();
  const removeWord = useRemoveRestrictedWord();
  const [words, setWords] = useState([]);

  const handleAddWord = async (word) => {
    await addWord({
      userId,
      word,
    });
    toast.success('Word added to restricted list');
  };

  const handleRemoveWord = async (word) => {
    await removeWord({
      userId,
      word,
    });
    toast.success('Word removed from restricted list');
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Add restricted word"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleAddWord(e.target.value);
            e.target.value = '';
          }
        }}
      />
      <ul>
        {words.map((word) => (
          <li key={word}>
            {word}
            <button onClick={() => handleRemoveWord(word)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Security Settings

Security settings handle authentication, account locking, and login tracking.

### Getting Security Settings

```typescript
import { useSecuritySettings } from '@/hooks/useConvex';

function SecurityPanel() {
  const { data: settings, isLoading } = useSecuritySettings(userId);

  if (isLoading) return <div>Loading security settings...</div>;

  return (
    <div className="security-settings">
      <h2>Security Settings</h2>

      {/* Two-Factor Authentication */}
      <div className="two-factor">
        <h3>Two-Factor Authentication</h3>
        <p>Status: {settings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
        {settings?.twoFactorEnabled ? (
          <button onClick={handleDisable2FA}>Disable 2FA</button>
        ) : (
          <button onClick={handleEnable2FA}>Enable 2FA</button>
        )}
      </div>

      {/* Account Lock Status */}
      <div className="account-lock">
        <h3>Account Status</h3>
        {settings?.accountLocked ? (
          <p className="error">
            Account is locked until {new Date(settings.accountLockedUntil).toLocaleString()}
          </p>
        ) : (
          <p className="success">Account is in good standing</p>
        )}
        <p>Failed login attempts: {settings?.failedLoginAttempts || 0}</p>
      </div>

      {/* Recovery Options */}
      <div className="recovery">
        <h3>Recovery Options</h3>
        <p>Recovery Email: {settings?.recoveryEmail || 'Not set'}</p>
        <p>Recovery Phone: {settings?.recoveryPhone || 'Not set'}</p>
      </div>
    </div>
  );
}
```

### Recording Login Attempts

```typescript
import { useRecordLoginAttempt } from '@/hooks/useConvex';

function LoginForm() {
  const recordLogin = useRecordLoginAttempt();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      // Attempt authentication
      const result = await authenticate(email, password);

      // Record successful login
      await recordLogin({
        userId: result.user.id,
        success: true,
        ipAddress: await getIPAddress(),
        location: await getLocation(),
        device: getDeviceInfo(),
      });

      navigate('/dashboard');
    } catch (error) {
      // Record failed login attempt
      await recordLogin({
        userId: null,
        success: false,
        ipAddress: await getIPAddress(),
        location: await getLocation(),
        device: getDeviceInfo(),
      });

      toast.error('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" />
      <input type="password" name="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Enabling Two-Factor Authentication

```typescript
import { useEnableTwoFactor } from '@/hooks/useConvex';

function Enable2FAPanel({ userId }) {
  const enable2FA = useEnableTwoFactor();
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');

  const handleEnable = async () => {
    const result = await enable2FA({ userId });

    setSecret(result.secret);
    setQrCode(result.qrCode);

    // Show QR code to user
    // User scans with authenticator app
    // Then verify code
  };

  return (
    <div>
      <button onClick={handleEnable}>Enable Two-Factor Authentication</button>
      {qrCode && (
        <div>
          <img src={qrCode} alt="QR Code" />
          <p>Scan this code with your authenticator app</p>
          <p>Secret: {secret}</p>
        </div>
      )}
    </div>
  );
}
```

### Account Locking

```typescript
import { useLockAccount, useUnlockAccount } from '@/hooks/useConvex';

function AccountLockControls({ userId }) {
  const lockAccount = useLockAccount();
  const unlockAccount = useUnlockAccount();

  const handleLock = async () => {
    if (confirm('Lock this account?')) {
      await lockAccount({
        userId,
        reason: 'Suspicious activity detected',
        durationMinutes: 30,
      });
      toast.success('Account locked for 30 minutes');
    }
  };

  const handleUnlock = async () => {
    if (confirm('Unlock this account?')) {
      await unlockAccount({ userId });
      toast.success('Account unlocked');
    }
  };

  return (
    <div>
      <button onClick={handleLock}>Lock Account</button>
      <button onClick={handleUnlock}>Unlock Account</button>
    </div>
  );
}
```

---

## App Settings

App settings are platform-wide configuration values.

### Getting App Settings

```typescript
import { useAppSettings, usePublicAppSettings } from '@/hooks/useConvex';

function AppConfig() {
  const { data: allSettings } = useAppSettings();
  const { data: publicSettings } = usePublicAppSettings();

  return (
    <div>
      <h2>Platform Configuration</h2>

      {/* Feature Flags */}
      <div>
        <h3>Features</h3>
        {allSettings
          ?.filter(s => s.category === 'features')
          .map(setting => (
            <div key={setting.key}>
              {setting.key}: {setting.value.toString()}
            </div>
          ))}
      </div>

      {/* Public Settings (available to all users) */}
      <div>
        <h3>Public Settings</h3>
        {publicSettings?.map(setting => (
          <div key={setting.key}>
            {setting.key}: {setting.value}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Setting App Configuration

```typescript
import { useSetAppSetting } from '@/hooks/useConvex';

function AdminPanel() {
  const setSetting = useSetAppSetting();

  const toggleMaintenanceMode = async () => {
    await setSetting({
      key: 'maintenance.enabled',
      value: true,
      category: 'features',
      description: 'Enable maintenance mode',
      isPublic: true,
    });
    toast.success('Maintenance mode enabled');
  };

  const updateRateLimit = async () => {
    await setSetting({
      key: 'api.rateLimit',
      value: 100,
      category: 'limits',
      description: 'API rate limit per minute',
      isPublic: false,
    });
    toast.success('Rate limit updated');
  };

  return (
    <div>
      <button onClick={toggleMaintenanceMode}>Enable Maintenance</button>
      <button onClick={updateRateLimit}>Update Rate Limit</button>
    </div>
  );
}
```

---

## Data Export & Deletion

### Exporting User Data (GDPR/CCPA)

```typescript
import { useExportUserData } from '@/hooks/useConvex';

function DataExportButton({ userId }) {
  const exportData = useExportUserData();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportData({ userId });

      // Create downloadable JSON file
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'Exporting...' : 'Export My Data'}
    </button>
  );
}
```

### Deleting User Account

```typescript
import { useDeleteUserAccount } from '@/hooks/useConvex';

function DeleteAccountButton({ userId }) {
  const deleteAccount = useDeleteUserAccount();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDelete = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      await deleteAccount({
        userId,
        confirmation: 'DELETE',
        reason: 'User requested account deletion',
      });

      // Clear local storage and redirect
      localStorage.clear();
      window.location.href = '/goodbye';
    } catch (error) {
      toast.error('Deletion failed: ' + error.message);
    }
  };

  return (
    <div className="delete-account">
      <h3>Delete Account</h3>
      <p>Warning: This action cannot be undone!</p>

      {showConfirmation ? (
        <div>
          <p>Type "DELETE" to confirm:</p>
          <button onClick={handleDelete}>Delete My Account</button>
          <button onClick={() => setShowConfirmation(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={handleDelete}>Delete Account</button>
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Batch Queries for Performance
When loading settings pages, use `useAllUserSettings` instead of separate queries:

```typescript
// ✅ Good - Single query
const { data } = useAllUserSettings(userId);

// ❌ Bad - Multiple queries
const userSettings = useUserSettings(userId);
const notifSettings = useNotificationSettings(userId);
const privacySettings = usePrivacySettings(userId);
```

### 2. Optimistic Updates
Update UI immediately, then call mutation:

```typescript
const updateSettings = useUpdateUserSettings();

const handleThemeChange = async (theme) => {
  // Optimistic update
  setTheme(theme);

  try {
    await updateSettings({ userId, theme });
  } catch (error) {
    // Revert on error
    setTheme(previousTheme);
    toast.error('Failed to update theme');
  }
};
```

### 3. Categorize Notifications
Use category-specific update functions for better organization:

```typescript
// Update only social notifications
updateSocialNotifications({ newFollower: true, newComment: true });

// Update only booking notifications
updateBookingNotifications({ newBookingRequest: true });
```

### 4. Handle Account Locking
Always check account lock status before allowing login:

```typescript
const { data: security } = useSecuritySettings(userId);

if (security?.accountLocked) {
  const unlockTime = new Date(security.accountLockedUntil);
  if (unlockTime > new Date()) {
    toast.error(`Account locked until ${unlockTime.toLocaleString()}`);
    return;
  }
}
```

### 5. Provide Feedback
Always show success/error messages for settings changes:

```typescript
try {
  await updateSettings({ userId, theme: 'dark' });
  toast.success('Settings saved successfully');
} catch (error) {
  toast.error('Failed to save settings');
}
```

---

## Conclusion

The settings system provides comprehensive control over:
- ✅ Display and accessibility preferences
- ✅ Granular notification controls (25+ types)
- ✅ Privacy and blocking features
- ✅ Security and authentication
- ✅ Platform-wide configuration
- ✅ Data export and deletion

All functions have corresponding React hooks in `src/hooks/useConvex.ts` for easy integration into your components.

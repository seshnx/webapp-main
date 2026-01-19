import React, { useState, useEffect } from 'react';
import { Calendar, Link, Unlink, RefreshCw, Check, AlertCircle, Settings, Clock, Sync } from 'lucide-react';

/**
 * CalendarSync - Google Calendar two-way sync management
 * Phase 2: Advanced booking features
 *
 * Features:
 * - Connect/disconnect Google Calendar
 * - Two-way synchronization
 * - Sync status and settings
 * - Conflict detection
 */
export default function CalendarSync({ user, userData }) {
    const [syncStatus, setSyncStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [settings, setSettings] = useState({
        bidirectionalSync: true,
        syncInterval: 15,
        autoSync: true,
        syncConfirmedOnly: false
    });

    useEffect(() => {
        fetchSyncStatus();
    }, []);

    const fetchSyncStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/studio-ops/calendar-sync/status?studioId=${userData?.id}`);
            const data = await response.json();

            if (data.success) {
                setSyncStatus(data.data);
                if (data.data.syncSettings) {
                    setSettings(data.data.syncSettings);
                }
            }
        } catch (error) {
            console.error('Error fetching sync status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        // For this implementation, we'll use a simple prompt for the access token
        // In production, you'd use a proper OAuth flow
        const accessToken = prompt('Enter your Google Calendar access token:\n\nNote: In production, this would be handled through a proper OAuth flow with a "Connect Google Calendar" button.');

        if (!accessToken) return;

        try {
            const response = await fetch('/api/studio-ops/calendar-sync/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studioId: userData?.id,
                    accessToken
                })
            });

            const data = await response.json();

            if (data.success) {
                setSyncStatus({
                    ...syncStatus,
                    isConnected: true,
                    calendarName: data.data.calendarName,
                    calendarId: data.data.calendarId
                });
                alert('Google Calendar connected successfully!');
            } else {
                alert(`Error: ${data.error || 'Failed to connect Google Calendar'}`);
            }
        } catch (error) {
            console.error('Error connecting Google Calendar:', error);
            alert('Failed to connect Google Calendar. Please try again.');
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect Google Calendar? This will stop syncing your bookings.')) {
            return;
        }

        try {
            const response = await fetch('/api/studio-ops/calendar-sync/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studioId: userData?.id
                })
            });

            const data = await response.json();

            if (data.success) {
                setSyncStatus({
                    ...syncStatus,
                    isConnected: false
                });
                alert('Google Calendar disconnected successfully.');
            } else {
                alert(`Error: ${data.error || 'Failed to disconnect Google Calendar'}`);
            }
        } catch (error) {
            console.error('Error disconnecting Google Calendar:', error);
            alert('Failed to disconnect Google Calendar. Please try again.');
        }
    };

    const handleSync = async (direction = 'both') => {
        setSyncing(true);
        setSyncResult(null);

        try {
            const response = await fetch('/api/studio-ops/calendar-sync/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studioId: userData?.id,
                    direction
                })
            });

            const data = await response.json();

            if (data.success) {
                setSyncResult(data.data);
                await fetchSyncStatus(); // Refresh status

                const { syncedToGoogle, syncedFromGoogle, conflicts } = data.data;
                let message = `Sync completed!\n`;
                message += `• ${syncedToGoogle} bookings synced to Google Calendar\n`;
                message += `• ${syncedFromGoogle} events synced from Google Calendar`;

                if (conflicts.length > 0) {
                    message += `\n\n⚠️ ${conflicts.length} conflict(s) detected`;
                }

                alert(message);
            } else {
                alert(`Error: ${data.error || 'Failed to sync with Google Calendar'}`);
            }
        } catch (error) {
            console.error('Error syncing with Google Calendar:', error);
            alert('Failed to sync with Google Calendar. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    const handleSaveSettings = async () => {
        // In a full implementation, you'd save these to the database
        alert('Settings saved! (Feature not fully implemented)');
        setShowSettings(false);
    };

    const formatLastSynced = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center text-gray-600 dark:text-gray-400">
                <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                <p>Loading calendar sync status...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                                <Calendar size={20} />
                            </div>
                            Google Calendar Sync
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Two-way synchronization between your bookings and Google Calendar
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {syncStatus?.isConnected && (
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="flex items-center gap-2 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Settings size={18} />
                                Settings
                            </button>
                        )}
                    </div>
                </div>

                {/* Connection Status */}
                <div className={`p-4 rounded-lg border ${
                    syncStatus?.isConnected
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {syncStatus?.isConnected ? (
                                <Check className="text-green-600 dark:text-green-400" size={24} />
                            ) : (
                                <Link className="text-gray-400 dark:text-gray-500" size={24} />
                            )}
                            <div>
                                <div className="font-semibold dark:text-white">
                                    {syncStatus?.isConnected ? 'Connected' : 'Not Connected'}
                                </div>
                                {syncStatus?.isConnected && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {syncStatus.calendarName || syncStatus.calendarId}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Last Synced</div>
                            <div className="font-medium dark:text-white">
                                {formatLastSynced(syncStatus?.lastSyncedAt)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4">
                    {!syncStatus?.isConnected ? (
                        <button
                            onClick={handleConnect}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Link size={18} />
                            Connect Google Calendar
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => handleSync('both')}
                                disabled={syncing}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                            >
                                {syncing ? (
                                    <RefreshCw className="animate-spin" size={18} />
                                ) : (
                                    <Sync size={18} />
                                )}
                                {syncing ? 'Syncing...' : 'Sync Now'}
                            </button>
                            <button
                                onClick={() => handleSync('to-google')}
                                disabled={syncing}
                                className="flex items-center gap-2 px-4 py-2 border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 rounded-lg dark:text-gray-300 transition-colors"
                            >
                                Upload to Google
                            </button>
                            <button
                                onClick={() => handleSync('from-google')}
                                disabled={syncing}
                                className="flex items-center gap-2 px-4 py-2 border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-800 rounded-lg dark:text-gray-300 transition-colors"
                            >
                                Download from Google
                            </button>
                            <button
                                onClick={handleDisconnect}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Unlink size={18} />
                                Disconnect
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Sync Settings */}
            {showSettings && syncStatus?.isConnected && (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
                        <Settings size={18} />
                        Sync Settings
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium dark:text-white">Bidirectional Sync</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Sync changes both ways between SeshNx and Google Calendar
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.bidirectionalSync}
                                    onChange={(e) => setSettings({ ...settings, bidirectionalSync: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium dark:text-white">Auto Sync</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Automatically sync when bookings are created or modified
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.autoSync}
                                    onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium dark:text-white">Sync Confirmed Bookings Only</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Only sync bookings that have been confirmed (skip pending)
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.syncConfirmedOnly}
                                    onChange={(e) => setSettings({ ...settings, syncConfirmedOnly: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Sync Interval (minutes)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={settings.syncInterval}
                                onChange={(e) => setSettings({ ...settings, syncInterval: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSaveSettings}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Save Settings
                            </button>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sync Results */}
            {syncResult && (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
                        <Clock size={18} />
                        Sync Results
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {syncResult.syncedToGoogle}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Synced to Google Calendar</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {syncResult.syncedFromGoogle}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Synced from Google Calendar</div>
                        </div>
                    </div>

                    {/* Conflicts */}
                    {syncResult.conflicts && syncResult.conflicts.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
                                <h4 className="font-semibold dark:text-white">Conflicts Detected</h4>
                                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                    {syncResult.conflicts.length}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {syncResult.conflicts.map((conflict, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                                    >
                                        <div className="text-sm font-medium dark:text-white">{conflict.message}</div>
                                        {conflict.bookingTime && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Booking: {conflict.bookingTime} vs Google: {conflict.googleEventTime}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Errors */}
                    {syncResult.errors && syncResult.errors.length > 0 && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                                <h4 className="font-semibold dark:text-white">Errors</h4>
                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                    {syncResult.errors.length}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {syncResult.errors.map((error, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                                    >
                                        <div className="text-sm font-medium dark:text-white">{error.message}</div>
                                        {error.bookingId && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Booking ID: {error.bookingId}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                        <h4 className="font-semibold dark:text-white mb-2">How Google Calendar Sync Works</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <li>• <strong>Two-way sync:</strong> Changes in SeshNx sync to Google, and Google events are checked for conflicts</li>
                            <li>• <strong>Conflict detection:</strong> Warnings appear when Google Calendar events overlap with existing bookings</li>
                            <li>• <strong>Automatic updates:</strong> When enabled, bookings automatically update in Google Calendar when modified</li>
                            <li>• <strong>Event tracking:</strong> Each booking tracks its Google Calendar event ID for accurate synchronization</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

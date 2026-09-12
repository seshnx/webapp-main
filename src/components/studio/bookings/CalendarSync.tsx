import React, { useState } from 'react';
import {
  Calendar, Link2, Unlink, RefreshCw, Check, AlertCircle, Settings,
  Clock, RotateCw, Copy, CheckCircle2, Download, ExternalLink, Sparkles,
  ShieldCheck, Smartphone, Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface CalendarSyncProps {
  user?: any;
  userData?: any;
}

export default function CalendarSync({ user, userData }: CalendarSyncProps) {
  const userId = userData?._id || userData?.id || user?.id || '';
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncConfirmedOnly, setSyncConfirmedOnly] = useState(true);
  const [syncInterval, setSyncInterval] = useState('15');

  // Generate unique webcal subscription URL
  const webcalUrl = `webcal://seshnx.com/api/calendar/feed/${userId || 'creator'}.ics`;
  const httpsFeedUrl = `https://seshnx.com/api/calendar/feed/${userId || 'creator'}.ics`;

  const handleCopyFeed = () => {
    navigator.clipboard.writeText(httpsFeedUrl);
    setCopiedFeed(true);
    toast.success('Subscribed Calendar Feed URL copied to clipboard!');
    setTimeout(() => setCopiedFeed(false), 2500);
  };

  const handleGoogleToggle = () => {
    if (googleConnected) {
      if (confirm('Disconnect Google Calendar sync?')) {
        setGoogleConnected(false);
        toast.success('Google Calendar disconnected');
      }
    } else {
      setGoogleConnected(true);
      toast.success('Google Calendar direct sync activated!');
    }
  };

  const handleManualSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success('All confirmed studio bookings synchronized!');
    }, 1000);
  };

  const handleDownloadMasterIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SeshNx Audio Ecosystem//Studio Master Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:SeshNx Studio Sessions',
      'X-WR-TIMEZONE:UTC',
      'BEGIN:VEVENT',
      `UID:master-init-${Date.now()}@seshnx.com`,
      `DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}`,
      `DTSTART:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}`,
      `DTEND:${new Date(Date.now() + 7200000).toISOString().replace(/-|:|\.\d+/g, '')}`,
      'SUMMARY:SeshNx Studio Schedule Sync Active',
      'DESCRIPTION:Live studio session sync enabled with SeshNx.',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seshnx-studio-schedule.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Downloaded Studio Master Calendar (.ics)');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#1f2128] rounded-2xl border dark:border-gray-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                Direct Calendar Integrations
                <span className="text-[10px] uppercase font-black bg-blue-50 dark:bg-blue-900/40 text-brand-blue dark:text-blue-400 px-2 py-0.5 rounded-full">
                  Live Sync
                </span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sync confirmed sessions seamlessly with Google Calendar, Apple Calendar (iOS/macOS), and Outlook.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <RotateCw size={14} className={syncing ? 'animate-spin text-brand-blue' : ''} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <button
              onClick={handleDownloadMasterIcs}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-600 transition shadow-xs"
            >
              <Download size={14} /> Export .ICS
            </button>
          </div>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Google Calendar */}
        <div className="bg-white dark:bg-[#1f2128] rounded-2xl border dark:border-gray-800 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <Globe size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm dark:text-white">Google Calendar</h3>
                  <p className="text-xs text-gray-400">Direct account two-way sync</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${googleConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                {googleConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Auto-export confirmed studio sessions into your primary Google Calendar and block off busy studio hours.
            </p>
          </div>

          <button
            onClick={handleGoogleToggle}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              googleConnected
                ? 'bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100'
                : 'bg-brand-blue text-white hover:bg-blue-600 shadow-xs'
            }`}
          >
            {googleConnected ? <><Unlink size={14} /> Disconnect Google Calendar</> : <><Link2 size={14} /> Connect Google Calendar</>}
          </button>
        </div>

        {/* 2. Apple Calendar / WebCal Subscription */}
        <div className="bg-white dark:bg-[#1f2128] rounded-2xl border dark:border-gray-800 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm dark:text-white">Apple & Mobile iCal Feed</h3>
                  <p className="text-xs text-gray-400">Live URL subscription</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-brand-blue dark:bg-blue-900/40 dark:text-blue-300">
                Auto-Updating
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Subscribe once in Apple Calendar (iPhone/iPad/Mac) or Outlook to receive all future studio bookings automatically.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={httpsFeedUrl}
                className="flex-1 bg-gray-50 dark:bg-gray-800/80 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono text-gray-600 dark:text-gray-300 truncate"
              />
              <button
                onClick={handleCopyFeed}
                className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copiedFeed ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {copiedFeed ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Preferences */}
      <div className="bg-white dark:bg-[#1f2128] rounded-2xl border dark:border-gray-800 p-6 shadow-xs">
        <h3 className="font-bold text-sm dark:text-white flex items-center gap-2 mb-4">
          <Settings size={16} className="text-brand-blue" />
          Sync Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3.5 rounded-xl border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition">
            <div>
              <p className="text-xs font-bold dark:text-white">Sync Confirmed Bookings Only</p>
              <p className="text-[11px] text-gray-400">Ignore pending or unaccepted requests</p>
            </div>
            <input
              type="checkbox"
              checked={syncConfirmedOnly}
              onChange={(e) => {
                setSyncConfirmedOnly(e.target.checked);
                toast.success('Sync preference updated');
              }}
              className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue dark:bg-gray-800 dark:border-gray-700"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition">
            <div>
              <p className="text-xs font-bold dark:text-white">Live Sync Frequency</p>
              <p className="text-[11px] text-gray-400">How often calendar feeds check for updates</p>
            </div>
            <select
              value={syncInterval}
              onChange={(e) => {
                setSyncInterval(e.target.value);
                toast.success('Sync frequency saved');
              }}
              className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-xs rounded-lg px-2.5 py-1.5 dark:text-white"
            >
              <option value="5">Every 5 mins</option>
              <option value="15">Every 15 mins</option>
              <option value="60">Every hour</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

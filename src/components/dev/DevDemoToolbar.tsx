import React, { useState, useEffect } from 'react';
import { Sparkles, Database, Trash2, ChevronUp, ChevronDown, CheckCircle2, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { useSeedDemoEnvironment, useClearDemoEnvironment } from '../../hooks/useConvex';
import toast from 'react-hot-toast';

interface DevDemoToolbarProps {
  user?: any;
}

export default function DevDemoToolbar({ user }: DevDemoToolbarProps) {
  // STRICT GUARD: Absolutely only render in local development
  if (!import.meta.env.DEV) {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(() => {
    return localStorage.getItem('seshnx_dev_demo_active') === 'true';
  });
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const seedDemo = useSeedDemoEnvironment();
  const clearDemo = useClearDemoEnvironment();

  // Keyboard shortcut: Ctrl + Shift + D to toggle toolbar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsExpanded(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleDemoMode = () => {
    const nextState = !isDemoActive;
    setIsDemoActive(nextState);
    localStorage.setItem('seshnx_dev_demo_active', String(nextState));
    toast(nextState ? '🧪 Dev Demo Mode ON' : 'Dev Demo Mode OFF', {
      icon: nextState ? '✨' : '⚪',
    });
  };

  const handlePopulateData = async () => {
    setIsSeeding(true);
    const toastId = toast.loading('Populating demo studios, bookings, feed & gear...');
    try {
      const clerkId = user?.id || user?.uid;
      await seedDemo({ currentClerkId: clerkId });
      setIsDemoActive(true);
      localStorage.setItem('seshnx_dev_demo_active', 'true');
      toast.success('🎉 Demo ecosystem populated successfully!', { id: toastId });
    } catch (err) {
      console.error('Demo seed error:', err);
      toast.error('Failed to populate demo data', { id: toastId });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    const toastId = toast.loading('Wiping demo records...');
    try {
      await clearDemo();
      setIsDemoActive(false);
      localStorage.setItem('seshnx_dev_demo_active', 'false');
      toast.success('🧹 Demo records wiped clean', { id: toastId });
    } catch (err) {
      console.error('Demo clear error:', err);
      toast.error('Failed to clear demo data', { id: toastId });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 font-sans select-none">
      {/* Expanded Toolbar Panel */}
      {isExpanded ? (
        <div className="bg-gray-900/95 text-white border border-brand-blue/40 shadow-2xl backdrop-blur-xl rounded-2xl p-4 w-80 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black tracking-wider uppercase text-brand-blue">
                Local DEV Demo Tool
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
              title="Minimize (Ctrl+Shift+D)"
            >
              <X size={14} />
            </button>
          </div>

          <div className="text-[11px] text-gray-400 leading-relaxed">
            Quickly seed and reset live demonstration records across Feed, Shorts, Marketplace, Studios, and Bookings.
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handlePopulateData}
              disabled={isSeeding || isClearing}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-brand-blue to-blue-600 hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
            >
              {isSeeding ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Populating DB...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>⚡ Populate All Demo Data</span>
                </>
              )}
            </button>

            <button
              onClick={handleClearData}
              disabled={isSeeding || isClearing}
              className="w-full py-2 px-3 bg-gray-800 hover:bg-red-500/20 hover:text-red-300 text-gray-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-gray-700/60 transition disabled:opacity-50"
            >
              {isClearing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Clearing...</span>
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  <span>🧹 Wipe Demo Records</span>
                </>
              )}
            </button>
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500">
            <span>DEV Only • GitIgnored</span>
            <span className="font-mono text-[9px] bg-gray-800 px-1.5 py-0.5 rounded">Ctrl+Shift+D</span>
          </div>
        </div>
      ) : (
        /* Collapsed Floating Pill */
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 bg-gray-900/90 hover:bg-gray-900 text-white px-3 py-1.5 rounded-full border border-brand-blue/30 shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 group text-xs font-bold"
        >
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping" />
          <span className="text-gray-300 group-hover:text-white">🧪 Dev Demo</span>
          <ChevronUp size={12} className="text-gray-400 group-hover:text-white" />
        </button>
      )}
    </div>
  );
}

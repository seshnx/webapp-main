import React from 'react';
import { Radio, Users, Compass, ArrowRight, ShieldCheck } from 'lucide-react';

interface ViewerLiveHeaderProps {
  pitchId: string;
  hostName: string;
  isHostLive: boolean;
  viewersCount: number;
  hostSlideIndex: number;
  currentViewerSlideIndex: number;
  isFreeRoam: boolean;
  onToggleFreeRoam: () => void;
  onJumpToHost: () => void;
  onClaimHostRole: () => void;
}

export default function ViewerLiveHeader({
  pitchId,
  hostName,
  isHostLive,
  viewersCount,
  hostSlideIndex,
  currentViewerSlideIndex,
  isFreeRoam,
  onToggleFreeRoam,
  onJumpToHost,
  onClaimHostRole
}: ViewerLiveHeaderProps): JSX.Element {
  const isOutOfSync = isFreeRoam && hostSlideIndex !== currentViewerSlideIndex;

  return (
    <>
      {/* Top Status Banner */}
      <header 
        role="banner"
        className="w-full bg-[#1b1d24]/95 border-b border-gray-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-30 shadow-md backdrop-blur-md"
      >
        {/* Left: Live indicator */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            <span className={`w-2 h-2 rounded-full ${isHostLive ? 'bg-red-500 animate-ping' : 'bg-gray-500'}`} />
            {isHostLive ? 'LIVE BROADCAST' : 'BROADCAST PAUSED'}
          </span>
          <span className="text-gray-300 font-medium hidden sm:inline">
            Room: <strong className="text-white font-mono">{pitchId}</strong>
          </span>
          <span className="text-gray-400 hidden md:inline">• Host: {hostName}</span>
        </div>

        {/* Center: Slide synchronization status */}
        <div className="flex items-center gap-2 text-gray-300">
          <span className="font-semibold text-white">
            {isFreeRoam ? 'Free Roaming' : `Following Host (Slide ${hostSlideIndex + 1})`}
          </span>
          {viewersCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 bg-[#2c2e36] px-2 py-0.5 rounded-full">
              <Users className="w-3 h-3 text-emerald-400" />
              {viewersCount}
            </span>
          )}
        </div>

        {/* Right: Mode Switcher & Host Claim */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFreeRoam}
            className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all flex items-center gap-1.5 ${
              isFreeRoam
                ? 'bg-[#2c2e36] text-gray-300 border border-gray-700 hover:border-gray-500'
                : 'bg-brand-blue text-white shadow-sm'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {isFreeRoam ? 'Resume Auto-Follow' : 'Free Roam'}
          </button>

          <button
            onClick={onClaimHostRole}
            title="Switch to Presenter Mode"
            className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Jump-to-Host Pill when in Free Roam and out of sync */}
      {isOutOfSync && (
        <aside 
          aria-label="Presenter sync alert"
          className="fixed top-14 left-1/2 -translate-x-1/2 z-40 animate-bounce"
        >
          <button
            onClick={onJumpToHost}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue text-white text-xs font-bold shadow-2xl border border-blue-400/40 hover:bg-brand-blue/90 transition-all"
          >
            <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Presenter moved to Slide {hostSlideIndex + 1}</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-mono flex items-center gap-1">
              Jump <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </aside>
      )}
    </>
  );
}

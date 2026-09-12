import React, { useState } from 'react';
import { 
  Radio, 
  Copy, 
  Check, 
  QrCode, 
  Users, 
  X, 
  Sparkles, 
  ExternalLink,
  Sliders
} from 'lucide-react';
import AmaliaMediaLogo from '../../../assets/AmaliaMediaLLc logo.png';

interface LiveBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitchId: string;
  isBroadcasting: boolean;
  viewersCount: number;
  syncDemos: boolean;
  onToggleSyncDemos: () => void;
  onStartBroadcast: (roomId: string) => void;
  onStopBroadcast: () => void;
}

export default function LiveBroadcastModal({
  isOpen,
  onClose,
  pitchId,
  isBroadcasting,
  viewersCount,
  syncDemos,
  onToggleSyncDemos,
  onStartBroadcast,
  onStopBroadcast
}: LiveBroadcastModalProps): JSX.Element | null {
  const [roomIdInput, setRoomIdInput] = useState<string>(pitchId || 'amalia-seed');
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(true);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.seshnx.com';
  const effectiveRoomId = (isBroadcasting ? pitchId : roomIdInput).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'seed';
  const shareUrl = `${origin}/pitch/${effectiveRoomId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&bgcolor=2c2e36&color=ffffff`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleBroadcast = () => {
    if (isBroadcasting) {
      onStopBroadcast();
    } else {
      onStartBroadcast(effectiveRoomId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#1f2128] border border-gray-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue">
            <Radio className={`w-6 h-6 ${isBroadcasting ? 'animate-pulse text-red-500' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">Live Synchronized Pitch Room</h3>
              {isBroadcasting && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Mirror slides and interactive sliders across all viewer screens in real time
            </p>
          </div>
        </div>

        {/* Room Code & URL Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Room Identifier (Short Code)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-mono text-sm">/pitch/</span>
              <input
                type="text"
                disabled={isBroadcasting}
                value={isBroadcasting ? pitchId : roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="amalia-seed"
                className="flex-1 bg-[#2c2e36] border border-gray-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-blue disabled:opacity-60"
              />
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="p-3.5 bg-[#2c2e36] border border-gray-700 rounded-2xl flex items-center justify-between gap-3">
            <div className="truncate text-xs font-mono text-gray-300">
              {shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-brand-blue/90 active:scale-95 transition-all shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Connected Viewers Counter */}
          {isBroadcasting && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <Users className="w-4 h-4" />
                <span>Active Connected Viewers</span>
              </div>
              <span className="text-sm font-bold font-mono text-emerald-300">
                {viewersCount} {viewersCount === 1 ? 'Viewer' : 'Viewers'}
              </span>
            </div>
          )}

          {/* QR Code Section */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 hover:text-gray-200 transition-colors mb-2"
            >
              <span className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-brand-blue" />
                <span>Mobile Scan QR Code (iPhone / Android)</span>
              </span>
              <span>{showQr ? '▲ Hide' : '▼ Show'}</span>
            </button>

            {showQr && (
              <div className="p-4 bg-[#2c2e36] border border-gray-700 rounded-2xl flex flex-col items-center justify-center">
                <div className="p-3 bg-white rounded-xl shadow-inner mb-2">
                  <img
                    src={qrCodeUrl}
                    alt="Scan for Live Pitch Deck"
                    className="w-40 h-40 object-contain rounded-md"
                  />
                </div>
                <p className="text-[11px] text-gray-400 text-center max-w-xs">
                  Attendees can point their phone camera at this QR code to view the live deck with zero login.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Demos Sync Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#2c2e36] border border-gray-700 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-brand-blue" />
              <div>
                <div className="text-xs font-semibold text-white">Sync Interactive Sliders & Kiosk</div>
                <div className="text-[11px] text-gray-400">Stream slider movements & kiosk check-in to viewers</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={syncDemos}
              onChange={onToggleSyncDemos}
              className="w-4 h-4 accent-brand-blue rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <img src={AmaliaMediaLogo} alt="Amalia Media" className="h-5 w-auto object-contain opacity-70" />
            <span className="text-[10px] text-gray-400">Amalia Media LLC</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
            >
              Done
            </button>
            <button
              onClick={handleToggleBroadcast}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
                isBroadcasting
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-brand-blue text-white hover:bg-brand-blue/90'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {isBroadcasting ? 'End Broadcast' : 'Start Live Broadcast'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

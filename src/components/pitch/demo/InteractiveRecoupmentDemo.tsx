import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Disc, 
  PieChart, 
  Info,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import SeshNxLogo from '../../../assets/SeshNx-PNG cCropped white text.png';

interface InteractiveRecoupmentDemoProps {
  syncAdvance?: number;
  syncStreams?: number;
  syncShare?: number;
  onSyncChange?: (change: { advanceAmount?: number; streamVolume?: number; recoupmentShare?: number }) => void;
  isViewer?: boolean;
}

export default function InteractiveRecoupmentDemo({
  syncAdvance,
  syncStreams,
  syncShare,
  onSyncChange,
  isViewer = false
}: InteractiveRecoupmentDemoProps = {}): JSX.Element {
  // Inputs
  const [advanceAmount, setAdvanceAmount] = useState<number>(syncAdvance || 1500);
  const [streamVolume, setStreamVolume] = useState<number>(syncStreams || 750000);
  const [recoupmentShare, setRecoupmentShare] = useState<number>(syncShare || 25); // 25% of gross directed to advance

  // Sync with incoming host updates
  React.useEffect(() => {
    if (typeof syncAdvance === 'number' && syncAdvance !== advanceAmount) {
      setAdvanceAmount(syncAdvance);
    }
  }, [syncAdvance]);

  React.useEffect(() => {
    if (typeof syncStreams === 'number' && syncStreams !== streamVolume) {
      setStreamVolume(syncStreams);
    }
  }, [syncStreams]);

  React.useEffect(() => {
    if (typeof syncShare === 'number' && syncShare !== recoupmentShare) {
      setRecoupmentShare(syncShare);
    }
  }, [syncShare]);

  const handleAdvanceChange = (val: number) => {
    setAdvanceAmount(val);
    if (!isViewer && onSyncChange) onSyncChange({ advanceAmount: val });
  };

  const handleStreamsChange = (val: number) => {
    setStreamVolume(val);
    if (!isViewer && onSyncChange) onSyncChange({ streamVolume: val });
  };

  const handleShareChange = (val: number) => {
    setRecoupmentShare(val);
    if (!isViewer && onSyncChange) onSyncChange({ recoupmentShare: val });
  };

  // DSP blended rate ($0.0035 / stream)
  const dspBlendedRate = 0.0035;
  const grossStreamingRevenue = streamVolume * dspBlendedRate;

  // Platform cut: IndieNx takes 10% distribution fee
  const indieNxPlatformCut = grossStreamingRevenue * 0.10;

  // Amount directed toward recouping the studio advance
  const recoupmentFund = grossStreamingRevenue * (recoupmentShare / 100);
  const recoupedAmount = Math.min(advanceAmount, recoupmentFund);
  const recoupmentPercent = Math.min(100, Math.round((recoupmentFund / advanceAmount) * 100));
  const isFullyRecouped = recoupmentPercent >= 100;

  // Artist share = Gross - Recouped Amount - IndieNx cut
  const artistShare = Math.max(0, grossStreamingRevenue - recoupedAmount - indieNxPlatformCut);

  // Remaining unrecouped balance
  const remainingUnrecouped = Math.max(0, advanceAmount - recoupmentFund);

  // Streams needed to break even
  const breakEvenStreams = Math.round(advanceAmount / (dspBlendedRate * (recoupmentShare / 100)));

  return (
    <div className="w-full bg-[#1f2128] border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-gray-700">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-blue/10 text-brand-blue border border-brand-blue/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <img src={SeshNxLogo} alt="SeshNx" className="h-6 w-auto object-contain brightness-110" />
              <h4 className="font-bold text-xl sm:text-2xl text-white">IndieNx Studio Advance Recoupment</h4>
              <span className="px-3 py-1 text-xs font-mono rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/30 font-bold">
                FINANCIAL SIMULATOR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
              Direct studio-time advances self-liquidated from streaming DSP royalties
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-mono text-gray-200 bg-[#2c2e36] px-4 py-1.5 rounded-xl border border-gray-700 font-semibold shadow-sm">
            Blended DSP Royalty: $0.0035 / Stream
          </span>
        </div>
      </div>

      {/* Main Grid: Controls (5 Cols) & Visual Output (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Side: Interactive Sliders */}
        <div className="lg:col-span-5 bg-[#2c2e36] border border-gray-700 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Slider 1: Studio Advance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm sm:text-base font-bold text-gray-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-blue" />
                  Studio Advance Amount
                </label>
                <span className="text-base sm:text-lg font-mono font-bold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-lg border border-brand-blue/30">
                  ${advanceAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={advanceAmount}
                onChange={(e) => handleAdvanceChange(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-blue"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1.5 font-medium">
                <span>$500 (10 hrs tracking)</span>
                <span>$5,000 (Full Album Package)</span>
              </div>
            </div>

            {/* Slider 2: Stream Volume */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm sm:text-base font-bold text-gray-200 flex items-center gap-2">
                  <Disc className="w-4 h-4 text-brand-blue" />
                  Projected DSP Streams
                </label>
                <span className="text-base sm:text-lg font-mono font-bold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-lg border border-brand-blue/30">
                  {streamVolume.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="3000000"
                step="25000"
                value={streamVolume}
                onChange={(e) => handleStreamsChange(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-blue"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1.5 font-medium">
                <span>50K (Local buzz)</span>
                <span>3.0M (Regional playlist viral)</span>
              </div>
            </div>

            {/* Slider 3: Recoupment Reserve % */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm sm:text-base font-bold text-gray-200 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-400" />
                  Recoupment Allocation Cut
                </label>
                <span className="text-base sm:text-lg font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                  {recoupmentShare}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={recoupmentShare}
                onChange={(e) => handleShareChange(Number(e.target.value))}
                className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1.5 font-medium">
                <span>10% (Gentle payback)</span>
                <span>50% (Accelerated payback)</span>
              </div>
            </div>
          </div>

          {/* Breakeven analysis card */}
          <div className="p-4 sm:p-5 bg-[#1f2128] border border-gray-700 rounded-xl space-y-2.5 text-xs sm:text-sm shadow-inner">
            <div className="flex items-center justify-between text-gray-300">
              <span className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-brand-blue" />
                Streams to 100% Recouped:
              </span>
              <span className="font-mono font-bold text-white text-sm sm:text-base">
                {breakEvenStreams.toLocaleString()} streams
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Once {breakEvenStreams.toLocaleString()} streams are surpassed, the advance is fully extinguished and the {recoupmentShare}% waterfall flips back 100% to the artist.
            </p>
          </div>
        </div>

        {/* Right Side: Waterfall & Financial Distribution (7 Cols) */}
        <div className="lg:col-span-7 bg-[#2c2e36] border border-gray-700 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Top Status & Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-mono uppercase text-gray-300 font-bold">Recoupment Velocity</span>
                  <span className={`px-3 py-1 text-xs sm:text-sm font-mono rounded-full font-bold flex items-center gap-1.5 ${
                    isFullyRecouped 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {isFullyRecouped ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {isFullyRecouped ? '100% FULLY RECOUPED' : `${recoupmentPercent}% RECOUPED`}
                  </span>
                </div>
                <span className="font-mono text-sm sm:text-base text-gray-200 font-bold">
                  ${recoupedAmount.toFixed(2)} / ${advanceAmount.toFixed(2)}
                </span>
              </div>

              {/* Recoupment Progress Bar */}
              <div className="w-full h-4 sm:h-5 bg-[#1a1d21] rounded-full overflow-hidden border border-gray-700 p-1">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFullyRecouped 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                      : 'bg-gradient-to-r from-brand-blue to-brand-dark-accent'
                  }`}
                  style={{ width: `${recoupmentPercent}%` }}
                />
              </div>
            </div>

            {/* Waterfall Breakdown Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Gross Revenue */}
              <div className="p-4 sm:p-5 bg-[#1f2128] border border-gray-700 rounded-xl shadow-md">
                <span className="text-xs sm:text-sm text-gray-400 block mb-1 font-semibold">Gross DSP Royalties</span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-black text-white block">
                  ${grossStreamingRevenue.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 block mt-1">Spotify, Apple, Tidal</span>
              </div>

              {/* Studio Direct Recoupment */}
              <div className="p-4 sm:p-5 bg-[#1f2128] border border-gray-700 rounded-xl shadow-md">
                <span className="text-xs sm:text-sm text-brand-blue block mb-1 font-bold">Studio Advance Recovered</span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-black text-white block">
                  ${recoupedAmount.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 block mt-1 font-medium">
                  {remainingUnrecouped > 0 ? `$${remainingUnrecouped.toFixed(2)} remaining` : 'Principal 100% Repaid'}
                </span>
              </div>

              {/* SeshNx / IndieNx Platform Take */}
              <div className="p-4 sm:p-5 bg-[#1f2128] border border-gray-700 rounded-xl shadow-md">
                <span className="text-xs sm:text-sm text-brand-blue block mb-1 font-bold">SeshNx / IndieNx Cut (10%)</span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-black text-brand-blue block">
                  ${indieNxPlatformCut.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 block mt-1">Distribution & contract fee</span>
              </div>

              {/* Artist Take-Home */}
              <div className="p-4 sm:p-5 bg-[#1f2128] border border-gray-700 rounded-xl shadow-md">
                <span className="text-xs sm:text-sm text-emerald-400 block mb-1 font-bold">Artist Net Payout</span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-black text-emerald-400 block">
                  ${artistShare.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 block mt-1">Liquid cash deposited</span>
              </div>
            </div>
          </div>

          {/* Strategic Moat Box */}
          <div className="p-4 sm:p-5 bg-[#1f2128] border border-brand-blue/30 rounded-xl text-xs sm:text-sm flex items-start gap-3.5 shadow-md">
            <Sparkles className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block text-sm sm:text-base mb-1">
                The Closed-Loop Structural Advantage:
              </span>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Traditional advances suffer 70% default rates because money is wired to bank accounts. 
                SeshNx delivers the advance strictly as <span className="text-white font-bold">booked studio hours</span>, 
                and automatically recoups gross streaming royalties at the delivery level. Zero debt collection, zero legal friction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

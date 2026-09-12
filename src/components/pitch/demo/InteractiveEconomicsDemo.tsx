import React, { useState } from 'react';
import { 
  Calculator, 
  Building2, 
  CreditCard, 
  Zap, 
  Percent, 
  Coins 
} from 'lucide-react';
import SeshNxLogo from '../../../assets/SeshNx-PNG cCropped white text.png';

interface InteractiveEconomicsDemoProps {
  syncStudioCount?: number;
  onSyncChange?: (change: { studioCount: number }) => void;
  isViewer?: boolean;
}

export default function InteractiveEconomicsDemo({
  syncStudioCount,
  onSyncChange,
  isViewer = false
}: InteractiveEconomicsDemoProps = {}): JSX.Element {
  // Input: Studio Count
  const [studioCount, setStudioCount] = useState<number>(syncStudioCount || 100);

  // Sync with incoming host updates
  React.useEffect(() => {
    if (typeof syncStudioCount === 'number' && syncStudioCount !== studioCount) {
      setStudioCount(syncStudioCount);
    }
  }, [syncStudioCount]);

  const handleStudioCountChange = (val: number) => {
    setStudioCount(val);
    if (!isViewer && onSyncChange) onSyncChange({ studioCount: val });
  };

  // Economic constants
  const hardwareSubsidyPerStudio = 150; // Wholesale 10" Android Kiosk Tablet
  const monthlySaasPerStudio = 149; // Core Studio ERP tier
  const monthlyGmvPerStudio = 12000; // 150 billable hours @ $80/hr average
  const gmvTakeRate = 0.05; // 5% marketplace & payment processing fee
  const annualDistroPerStudio = 1800; // IndieNx distribution & recoupment margin

  // Calculated values
  const totalHardwareSubsidyCost = studioCount * hardwareSubsidyPerStudio;
  const annualSaasArr = studioCount * monthlySaasPerStudio * 12;
  const totalAnnualGmv = studioCount * monthlyGmvPerStudio * 12;
  const annualMarketplaceArr = totalAnnualGmv * gmvTakeRate;
  const annualDistroArr = studioCount * annualDistroPerStudio;
  const totalAnnualArr = annualSaasArr + annualMarketplaceArr + annualDistroArr;
  const monthlyRevenuePerStudio = monthlySaasPerStudio + (monthlyGmvPerStudio * gmvTakeRate) + (annualDistroPerStudio / 12);
  const paybackPeriodDays = Math.max(7, Math.round((hardwareSubsidyPerStudio / monthlyRevenuePerStudio) * 30));

  return (
    <div className="w-full bg-[#1f2128] border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-gray-700">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-blue/10 text-brand-blue border border-brand-blue/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <img src={SeshNxLogo} alt="SeshNx" className="h-6 w-auto object-contain brightness-110" />
              <h4 className="font-bold text-xl sm:text-2xl text-white">Studio Network Economics & ARR Engine</h4>
              <span className="px-3 py-1 text-xs font-mono rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                SCALED PROJECTIONS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
              Model the hardware tablet subsidy ($150) against blended SaaS & booking ARR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-xl font-bold shadow-sm">
            Payback Window: {paybackPeriodDays} Days
          </span>
        </div>
      </div>

      {/* Main Grid: Slider & Metrics (12 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Interactive Slider & Lever Settings (5 Cols) */}
        <div className="lg:col-span-5 bg-[#2c2e36] border border-gray-700 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm sm:text-base font-bold text-gray-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-blue" />
                Active Partner Studios
              </label>
              <span className="text-base sm:text-xl font-mono font-bold text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-lg border border-brand-blue/30">
                {studioCount} Studios
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="250"
              step="5"
              value={studioCount}
              onChange={(e) => handleStudioCountChange(Number(e.target.value))}
              className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-blue"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
              <span>10 Studios (Initial Beta)</span>
              <span>100 (Seed Goal)</span>
              <span>250 (Series A Scale)</span>
            </div>
          </div>

          {/* Key Lever Assumptions */}
          <div className="p-5 bg-[#1f2128] border border-gray-700 rounded-xl space-y-3 text-xs sm:text-sm shadow-inner">
            <span className="font-bold text-gray-200 block text-sm border-b border-gray-700 pb-2">
              Unit Model Per Studio Node
            </span>
            <div className="flex justify-between">
              <span className="text-gray-400">1x Wholesale Tablet Hardware:</span>
              <span className="font-mono text-gray-200 font-bold">${hardwareSubsidyPerStudio} one-time</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Core ERP SaaS License:</span>
              <span className="font-mono text-brand-blue font-bold">${monthlySaasPerStudio}/mo ($1,788/yr)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Billable GMV:</span>
              <span className="font-mono text-gray-200">${monthlyGmvPerStudio.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">SeshNx GMV Take (5%):</span>
              <span className="font-mono text-emerald-400 font-bold">${(monthlyGmvPerStudio * gmvTakeRate).toLocaleString()}/mo</span>
            </div>
          </div>

          {/* Subsidized Tablet ROI Proof */}
          <div className="p-4 sm:p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs sm:text-sm space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>Negative Net Churn Trove</span>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Total hardware cost for all {studioCount} studios is only{' '}
              <span className="text-white font-mono font-bold">${totalHardwareSubsidyCost.toLocaleString()}</span>. 
              Once mounted on the wall, switching costs become insurmountable for the facility.
            </p>
          </div>
        </div>

        {/* Right Column: Aggregated Financial Yield (7 Cols) */}
        <div className="lg:col-span-7 bg-[#2c2e36] border border-gray-700 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Big ARR Headline */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-brand-blue/20 via-[#1f2128] to-[#2c2e36] border border-brand-blue/40 rounded-2xl mb-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs sm:text-sm font-mono uppercase text-brand-blue font-bold tracking-wider">
                    Blended Run-Rate ARR
                  </span>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-mono font-black text-white mt-1.5">
                    ${Math.round(totalAnnualArr).toLocaleString()}
                    <span className="text-base sm:text-lg font-normal text-gray-300 ml-2">/ year</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-mono text-gray-400 block font-semibold">Total GMV Flow</span>
                  <span className="text-2xl sm:text-3xl font-mono font-black text-brand-blue">
                    ${(totalAnnualGmv / 1000000).toFixed(1)}M / yr
                  </span>
                </div>
              </div>
            </div>

            {/* ARR Composition Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {/* SaaS ARR */}
              <div className="p-4 sm:p-5 bg-[#1f2128] border border-gray-700 rounded-xl shadow-md">
                <span className="text-xs sm:text-sm text-brand-blue flex items-center gap-1.5 mb-1.5 font-bold">
                  <CreditCard className="w-4 h-4 shrink-0" /> SaaS Software
                </span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-mono font-black text-white block">
                  ${Math.round(annualSaasArr).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 mt-1 block">Subscription revenue</span>
              </div>

              {/* GMV Take */}
              <div className="p-4 sm:p-5 bg-[#1f2128] border border-gray-700 rounded-xl shadow-md">
                <span className="text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5 mb-1.5 font-bold">
                  <Percent className="w-4 h-4 shrink-0" /> 5% GMV Fee
                </span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-mono font-black text-white block">
                  ${Math.round(annualMarketplaceArr).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 mt-1 block">Session transactions</span>
              </div>

              {/* Distro & Advances */}
              <div className="p-4 sm:p-5 bg-[#1f2128] border border-gray-700 rounded-xl shadow-md">
                <span className="text-xs sm:text-sm text-purple-400 flex items-center gap-1.5 mb-1.5 font-bold">
                  <Coins className="w-4 h-4 shrink-0" /> IndieNx Distro
                </span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-mono font-black text-white block">
                  ${Math.round(annualDistroArr).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 mt-1 block">Royalties & advances</span>
              </div>
            </div>
          </div>

          {/* Capital Ask Context Footer */}
          <div className="p-5 bg-[#1f2128] border border-gray-700 rounded-xl text-xs sm:text-sm space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between text-gray-200 font-bold border-b border-gray-700 pb-2 text-sm sm:text-base">
              <span>$500K – $1.0M SAFE Deployment Fit</span>
              <span className="font-mono text-emerald-400 font-bold">18-24 Month Runway</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-300">
              <div>
                • <span className="text-white font-semibold">100 Target Studios:</span> $15K hardware budget
              </div>
              <div>
                • <span className="text-white font-semibold">Breakeven:</span> Achieved at ~65 active studio nodes
              </div>
              <div>
                • <span className="text-white font-semibold">Capital Efficiency:</span> Low burn, high LTV/CAC
              </div>
              <div>
                • <span className="text-white font-semibold">Phase 4 Foundation:</span> Booking data unlocks owned flagship studios
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

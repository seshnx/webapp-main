import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, MapPin, Zap, Check, ArrowRight, RadioTower, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscribeToPriorityVisibility } from '../../hooks/useConvex';
import toast from 'react-hot-toast';

interface BoostVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userData: any;
}

export default function BoostVisibilityModal({
  isOpen,
  onClose,
  user,
  userData
}: BoostVisibilityModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'creator' | 'studio'>('creator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subscribeToBoost = useSubscribeToPriorityVisibility();
  const clerkId = user?.id || user?.uid || '';

  if (!isOpen) return null;

  const handleActivate = async () => {
    setIsSubmitting(true);
    try {
      await subscribeToBoost({
        clerkId,
        tier: selectedPlan === 'creator' ? 'creator_priority' : 'studio_local',
        durationDays: 30,
      });
      toast.success(
        selectedPlan === 'creator'
          ? '🎉 Creator Priority Pass Activated! Your verified badge is live.'
          : '🎉 Studio Local Geo-Boost Activated!'
      );
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to activate boost.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 border border-brand-blue/30 shadow-2xl max-w-xl w-full relative overflow-hidden cursor-default"
        >
          {/* Background Glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-brand-blue/20 to-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            ✕
          </button>

          {/* Header */}
          <div className="text-center max-w-md mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-xs font-black mb-2">
              <Sparkles size={13} /> REACH MORE CREATORS
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Increase Your Visibility
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Elevate your tracks, releases, and studio bookings across the SeshNx network.
            </p>
          </div>

          {/* Plan Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Creator Priority */}
            <div
              onClick={() => setSelectedPlan('creator')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === 'creator'
                  ? 'border-brand-blue bg-blue-50/50 dark:bg-blue-950/20 shadow-md shadow-blue-500/10'
                  : 'border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/40 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-brand-blue text-white">
                    <Award size={18} />
                  </div>
                  <span className="text-xs font-black text-brand-blue">$9.99/mo</span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                  <span>Creator Priority</span>
                  <span className="text-[10px] text-brand-blue font-black">⚡</span>
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  For artists, producers, and engineers looking to grow listeners.
                </p>
              </div>

              <div className="space-y-1.5 mt-4 pt-3 border-t dark:border-gray-700/60 text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Verified Creator Badge</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>3x Feed Priority Ranking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Highlighted Top Comments</span>
                </div>
              </div>
            </div>

            {/* Studio Local Geo-Boost */}
            <div
              onClick={() => setSelectedPlan('studio')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedPlan === 'studio'
                  ? 'border-brand-dark-accent bg-blue-50/50 dark:bg-blue-950/20 shadow-md shadow-brand-dark-accent/10'
                  : 'border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/40 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-brand-dark-accent text-white">
                    <RadioTower size={18} />
                  </div>
                  <span className="text-xs font-black text-brand-dark-accent">
                    $29.99/mo
                  </span>
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1">
                  <span>Studio Geo-Boost</span>
                  <span className="text-[10px] text-brand-blue font-black">📍</span>
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  For recording facilities booking local vocal and mix sessions.
                </p>
              </div>

              <div className="space-y-1.5 mt-4 pt-3 border-t dark:border-gray-700/60 text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>50-Mile Local Feed Broadcast</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>"Book Studio" Action Button</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Local Distance Tags (e.g. 8 mi)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <button
              onClick={handleActivate}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-brand-blue/25 transition flex items-center justify-center gap-2"
            >
              <span>
                {isSubmitting
                  ? 'Activating Boost...'
                  : selectedPlan === 'creator'
                  ? 'Activate Creator Priority ($9.99/mo)'
                  : 'Activate Studio Geo-Boost ($29.99/mo)'}
              </span>
              <ArrowRight size={14} />
            </button>
            <p className="text-[10px] text-center text-gray-400">
              Cancel anytime. No lock-in contracts. Powered by SeshNx Stripe billing.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

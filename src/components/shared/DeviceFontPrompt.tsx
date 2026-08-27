import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Check, X, Sliders } from 'lucide-react';
import { useDeviceFontDetection } from '../../hooks/useDeviceFontDetection';

interface DeviceFontPromptProps {
  userId?: string | null;
}

export default function DeviceFontPrompt({ userId }: DeviceFontPromptProps) {
  const {
    isLargeFontDetected,
    baseFontSize,
    optimizeFontSize,
    dismissPrompt,
  } = useDeviceFontDetection(userId);

  if (!isLargeFontDetected) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[9970] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-amber-500/30 dark:border-amber-500/20 shadow-2xl rounded-2xl p-4 text-gray-900 dark:text-white"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Type size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                Large Font Size Detected
                <span className="text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md">
                  ~{Math.round(baseFontSize)}px
                </span>
              </h4>
              <button
                onClick={dismissPrompt}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition"
                aria-label="Dismiss font size alert"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
              Your device's system settings are causing large font sizes, which may cause buttons or content to be cut off. Would you like to optimize app font size to avoid cutoffs?
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={optimizeFontSize}
                className="flex-1 py-1.5 px-3 bg-gradient-to-r from-brand-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Check size={14} />
                Optimize Font Size
              </button>

              <button
                onClick={dismissPrompt}
                className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-medium transition"
              >
                Keep Current
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

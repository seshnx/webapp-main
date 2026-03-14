/**
 * Quick Action Card Widget Component
 *
 * Displays a single quick action button with optional badge.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { QuickAction } from '../../../types/dashboard';

interface QuickActionCardProps {
  action: QuickAction;
  index?: number;
  className?: string;
}

const ACTION_VARIANT_STYLES: Record<QuickAction['variant'], string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none',
  secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-none',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none'
};

export function QuickActionCard({
  action,
  index = 0,
  className = ''
}: QuickActionCardProps) {
  const Icon = action.icon;

  const handleClick = async () => {
    if (!action.disabled) {
      await action.action();
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={handleClick}
      disabled={action.disabled}
      className={`
        relative p-4 rounded-xl font-medium transition-all
        ${ACTION_VARIANT_STYLES[action.variant]}
        ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
    >
      {action.badge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
          {action.badge}
        </span>
      )}

      <div className="flex flex-col items-center gap-2">
        <Icon className="w-6 h-6" />
        <span className="text-sm text-center">{action.label}</span>
      </div>
    </motion.button>
  );
}

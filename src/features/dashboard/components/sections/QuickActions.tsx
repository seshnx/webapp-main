/**
 * Quick Actions Section Component
 *
 * Displays role-specific quick action buttons.
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { QuickAction, DashboardProps } from '@/types/dashboard';

interface QuickActionsProps {
  actions: QuickAction[];
  role: string;
  className?: string;
}

const ACTION_VARIANT_STYLES: Record<QuickAction['variant'], string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-none',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 dark:shadow-none'
};

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
}

const QuickActionCard = ({ action, index }: QuickActionCardProps) => {
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
        ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}
        disabled:hover:scale-100
      `}
    >
      {action.badge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {action.badge}
        </span>
      )}

      <div className="flex flex-col items-center gap-2">
        <Icon className="w-6 h-6" />
        <span className="text-sm">{action.label}</span>
      </div>
    </motion.button>
  );
};

export function QuickActions({ actions, role, className = '' }: QuickActionsProps) {
  // Filter actions by role
  const filteredActions = actions.filter(action =>
    action.roles.includes(role) || action.roles.includes('*')
  );

  if (filteredActions.length === 0) {
    return null;
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
      {filteredActions.map((action, index) => (
        <QuickActionCard key={action.id} action={action} index={index} />
      ))}
    </div>
  );
}

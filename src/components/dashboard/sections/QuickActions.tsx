/**
 * Quick Actions Section Component
 *
 * Displays role-specific quick action cards with subtext descriptions
 * and high-impact primary action callouts.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import type { QuickAction } from '../../../types/dashboard';

interface QuickActionsProps {
  actions: QuickAction[];
  role: string;
  className?: string;
}

export function QuickActions({ actions, role, className = '' }: QuickActionsProps) {
  // Filter actions by role
  const filteredActions = actions.filter(action =>
    action.roles.includes(role) || action.roles.includes('*')
  );

  if (filteredActions.length === 0) {
    return null;
  }

  const primaryAction = filteredActions.find(a => a.featured || a.variant === 'primary') || filteredActions[0];
  const secondaryActions = filteredActions.filter(a => a !== primaryAction);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Featured Primary Action Card */}
      {primaryAction && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => !primaryAction.disabled && primaryAction.action()}
          className={`
            relative p-4 sm:p-5 rounded-2xl cursor-pointer overflow-hidden group
            bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg
            hover:shadow-xl transition-all duration-300 render-crisp transform-gpu-crisp
            ${primaryAction.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}
          `}
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 flex-shrink-0">
                <primaryAction.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-white tracking-wide truncate">
                    {primaryAction.label}
                  </h4>
                  {primaryAction.badge && (
                    <span className="bg-amber-400 text-gray-900 text-xs font-extrabold px-2 py-0.5 rounded-full">
                      {primaryAction.badge}
                    </span>
                  )}
                </div>
                {primaryAction.description && (
                  <p className="text-xs text-white/80 mt-0.5 truncate">
                    {primaryAction.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center p-2 sm:p-2.5 bg-white text-blue-600 rounded-xl group-hover:bg-blue-50 transition-colors flex-shrink-0 shadow-md">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Secondary Actions Grid */}
      {secondaryActions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {secondaryActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                onClick={() => !action.disabled && action.action()}
                disabled={action.disabled}
                className={`
                  relative p-3 rounded-xl border text-left flex items-center justify-between gap-3
                  bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700/80 shadow-sm
                  hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/50 hover:bg-blue-50/50 dark:hover:bg-gray-750
                  transition-all duration-200 group render-crisp transform-gpu-crisp
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {action.label}
                      </span>
                      {action.badge && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    {action.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {action.description}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Greeting Section Component
 *
 * Displays personalized greeting and user overview.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock } from 'lucide-react';
import type { DashboardProps } from '../../../types/dashboard';

interface GreetingSectionProps extends Pick<DashboardProps, 'userData'> {
  className?: string;
}

export function GreetingSection({ userData, className = '' }: GreetingSectionProps) {
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getActiveRole = (): string => {
    return userData?.activeProfileRole || userData?.accountTypes?.[0] || 'Fan';
  };

  const displayName = userData?.effectiveDisplayName || userData?.displayName || 'User';
  const greeting = getGreeting();
  const activeRole = getActiveRole();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {greeting}, {displayName}!
          </h1>
          <p className="text-blue-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Active Role: <span className="font-semibold">{activeRole}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <Clock className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

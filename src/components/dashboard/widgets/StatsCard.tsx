/**
 * Stats Card Widget Component
 *
 * Displays a single statistic with optional trend indicator.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import AnimatedNumber from '../../shared/AnimatedNumber';

export interface StatsCardProps {
  title: string;
  value: number | string;
  previousValue?: number | string;
  unit?: string;
  icon?: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'pink';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/40'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/40'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40'
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    text: 'text-pink-600 dark:text-pink-400',
    iconBg: 'bg-pink-100 dark:bg-pink-900/40'
  }
};

const SIZE_CLASSES = {
  small: 'p-4',
  medium: 'p-5',
  large: 'p-6'
};

export function StatsCard({
  title,
  value,
  previousValue,
  unit,
  icon: Icon,
  trend,
  trendPercentage,
  color = 'blue',
  size = 'medium',
  className = ''
}: StatsCardProps) {
  const colorClass = COLOR_CLASSES[color];
  const sizeClass = SIZE_CLASSES[size];

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow ${sizeClass} ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorClass.iconBg}`}>
            <Icon className={`w-5 h-5 ${colorClass.text}`} />
          </div>
        )}
        {trend && trendPercentage !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()} bg-gray-50 dark:bg-gray-700`}>
            {getTrendIcon()}
            {trendPercentage > 0 ? '+' : ''}{trendPercentage}%
          </div>
        )}
      </div>

      <div className="mb-1">
        <p className={`text-2xl font-bold text-gray-900 dark:text-white ${size === 'large' ? 'text-3xl' : ''}`}>
          {typeof value === 'number' ? (
            <AnimatedNumber value={value} />
          ) : (
            value
          )}
          {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
        </p>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        {title}
      </p>

      {previousValue !== undefined && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Previous: {previousValue}
        </p>
      )}
    </motion.div>
  );
}

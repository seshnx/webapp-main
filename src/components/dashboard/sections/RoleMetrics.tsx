/**
 * Role Metrics Section Component
 *
 * Displays role-specific metrics and stats.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { RoleMetric } from '../../../types/dashboard';
import AnimatedNumber from '../../shared/AnimatedNumber';

interface RoleMetricsProps {
  metrics: RoleMetric[];
  className?: string;
}

interface MetricCardProps {
  metric: RoleMetric;
  index: number;
}

const MetricCard = ({ metric, index }: MetricCardProps) => {
  const Icon = metric.icon;

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendBgColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'down':
        return 'bg-red-100 dark:bg-red-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${metric.color ? `bg-${metric.color}-100 dark:bg-${metric.color}-900/30` : 'bg-blue-100 dark:bg-blue-900/30'}`}>
          {Icon && <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        </div>
        {metric.trend && metric.trendPercentage && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()} ${getTrendBgColor()}`}>
            {getTrendIcon()}
            {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}%
          </div>
        )}
      </div>

      <div className="mb-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof metric.value === 'number' ? (
            <AnimatedNumber value={metric.value} />
          ) : (
            metric.value
          )}
          {metric.unit && <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>}
        </p>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        {metric.label}
      </p>

      {metric.previousValue !== undefined && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Previous: {metric.previousValue}
        </p>
      )}
    </motion.div>
  );
};

export function RoleMetrics({ metrics, className = '' }: RoleMetricsProps) {
  if (metrics.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 text-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No metrics available</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard key={metric.id} metric={metric} index={index} />
      ))}
    </div>
  );
}

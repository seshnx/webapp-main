/**
 * Stats Card Widget Component
 *
 * Displays a single statistic with a premium glassmorphism aesthetic.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
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

const GRADIENT_CLASSES = {
  blue: 'bg-gradient-to-br from-blue-500/90 to-indigo-600/90',
  green: 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90',
  red: 'bg-gradient-to-br from-red-500/90 to-rose-600/90',
  amber: 'bg-gradient-to-br from-amber-500/90 to-orange-600/90',
  purple: 'bg-gradient-to-br from-purple-500/90 to-fuchsia-600/90',
  pink: 'bg-gradient-to-br from-pink-500/90 to-rose-600/90'
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
  const gradientClass = GRADIENT_CLASSES[color] || GRADIENT_CLASSES.blue;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.medium;

  const isTrendUp = trend === 'up';
  const isTrendDown = trend === 'down';

  return (
    <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className={`relative ${sizeClass} rounded-[1.25rem] cursor-pointer overflow-hidden group backdrop-blur-md shadow-lg border border-white/10 ${gradientClass} ${className}`}
    >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform -translate-x-8 translate-y-8" />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between min-h-[100px]">
            <div className="flex items-start justify-between mb-3 w-full">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 shadow-inner">
                    {Icon && <Icon className="w-5 h-5 text-white drop-shadow-md" />}
                </div>
                {trend && trendPercentage !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold leading-none backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-white/10 shadow-sm ${isTrendUp ? 'bg-green-500/20 text-green-100' : isTrendDown ? 'bg-red-500/20 text-red-100' : 'bg-white/10 text-white'}`}>
                        {isTrendUp ? <ArrowUpRight size={12} className="text-green-300" /> : isTrendDown ? <ArrowUpRight size={12} className="rotate-90 text-red-300" /> : <Minus size={12} className="text-white/70" />}
                        {trendPercentage > 0 ? '+' : ''}{trendPercentage}%
                    </div>
                )}
            </div>
            
            <div className="mt-auto">
                <div className="text-3xl font-black text-white mb-1 tracking-tight flex items-baseline drop-shadow-sm">
                    {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
                    {unit && <span className="text-lg text-white/80 ml-1 font-semibold">{unit}</span>}
                </div>
                <div className="text-white/90 text-sm font-semibold tracking-wide">{title}</div>
                {previousValue !== undefined && (
                    <div className="text-white/80 text-xs mt-2 font-medium bg-black/20 inline-block px-2.5 py-1 rounded-full backdrop-blur-md border border-white/5">
                        Previous: {previousValue}
                    </div>
                )}
            </div>
        </div>

        {/* Hover shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </motion.div>
  );
}

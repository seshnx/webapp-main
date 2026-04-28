/**
 * Widget Grid Component
 *
 * Manages the layout and arrangement of dashboard widgets.
 * Supports both default role-based layouts and custom user layouts.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, RotateCcw } from 'lucide-react';
import type { DashboardConfig, DashboardWidget, DashboardProps } from '@/types/dashboard';

interface WidgetGridProps {
  config: DashboardConfig | null;
  role: string;
  children: React.ReactNode;
  onEditLayout?: () => void;
  onResetLayout?: () => void;
  className?: string;
}

interface GridSlot {
  row: number;
  col: number;
  size: 'small' | 'medium' | 'large' | 'full';
  children?: React.ReactNode;
}

const DEFAULT_GRID_SLOTS: GridSlot[] = [
  // Row 1
  { row: 1, col: 1, size: 'large' },  // Greeting
  { row: 1, col: 2, size: 'medium' }, // Quick Stats
  { row: 1, col: 3, size: 'medium' }, // Notifications
  // Row 2
  { row: 2, col: 1, size: 'medium' }, // Activity Feed
  { row: 2, col: 2, size: 'medium' }, // Role Metrics
  { row: 2, col: 3, size: 'medium' }, // Quick Actions
];

const getGridClass = (size: GridSlot['size']): string => {
  switch (size) {
    case 'small':
      return 'col-span-1';
    case 'medium':
      return 'col-span-1 lg:col-span-1';
    case 'large':
      return 'col-span-1 lg:col-span-2';
    case 'full':
      return 'col-span-1 lg:col-span-3';
    default:
      return 'col-span-1';
  }
};

export function WidgetGrid({
  config,
  role,
  children,
  onEditLayout,
  onResetLayout,
  className = ''
}: WidgetGridProps) {
  const [isEditing, setIsEditing] = useState(false);

  const isCustomLayout = config?.layout === 'custom';

  const handleEditToggle = () => {
    if (isEditing) {
      onEditLayout?.();
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      {(isCustomLayout || isEditing) && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isCustomLayout ? 'Custom Layout' : `${role} Dashboard`}
          </h2>
          <div className="flex items-center gap-2">
            {isCustomLayout && !isEditing && (
              <button
                onClick={onResetLayout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button>
            )}
            <button
              onClick={handleEditToggle}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${isEditing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <Settings className="w-4 h-4" />
              {isEditing ? 'Done Editing' : 'Customize'}
            </button>
          </div>
        </div>
      )}

      {/* Widget Grid */}
      {config?.layout === 'custom' ? (
        // Custom Layout - User-defined widget arrangement
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {config.widgets
            .filter(w => w.visible)
            .sort((a, b) => {
              if (a.position.row !== b.position.row) {
                return a.position.row - b.position.row;
              }
              return a.position.col - b.position.col;
            })
            .map(widget => (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={getGridClass(widget.size)}
              >
                {isEditing && (
                  <div className="relative group">
                    <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-xl z-10 pointer-events-none" />
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {widget.title || widget.type}
                    </div>
                  </div>
                )}
                {/* Widget content will be rendered here */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  {widget.title && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {widget.title}
                      </h3>
                    </div>
                  )}
                  <div className="p-4">
                    {/* Widget placeholder - actual widgets will be rendered here */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {widget.type} widget
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      ) : (
        // Default Layout - Role-based grid with children directly in grid cells
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {React.Children.map(children, (child, index) => {
            const animations = [
              { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
              { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 } },
              { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } }
            ];

            return (
              <motion.div
                key={index}
                className="space-y-6"
                initial={animations[index]?.initial}
                animate={animations[index]?.animate}
                transition={{ delay: (index + 1) * 0.1, duration: 0.4 }}
              >
                {child}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Widget Wrapper Component
 * Wraps individual widget content with consistent styling
 */
export function WidgetWrapper({
  title,
  size = 'medium',
  children,
  className = ''
}: {
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  children: React.ReactNode;
  className?: string;
}) {
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-5',
    large: 'p-6',
    full: 'p-6'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {title && (
        <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className={sizeClasses[size]}>
        {children}
      </div>
    </div>
  );
}

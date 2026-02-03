import React from 'react';

/**
 * Stat card component props
 */
export interface StatCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Icon element */
  icon?: React.ReactNode;
  /** Optional subtitle */
  sub?: React.ReactNode;
  /** Background color classes */
  bg?: string;
  /** Text color classes */
  text?: string;
}

/**
 * Stat Card Component
 *
 * Displays a statistic card with title, value, icon, and optional subtitle.
 * Commonly used in dashboards and analytics views.
 *
 * @param props - Stat card props
 * @returns Stat card component
 *
 * @example
 * <StatCard
 *   title="Total Bookings"
 *   value="248"
 *   icon={<CalendarIcon />}
 *   sub="+12% from last month"
 * />
 *
 * @example
 * // Custom styling
 * <StatCard
 *   title="Revenue"
 *   value="$12,450"
 *   bg="bg-gradient-to-br from-blue-500 to-purple-600"
 *   text="text-white"
 * />
 */
export default function StatCard({
  title,
  value,
  icon,
  sub,
  bg = "bg-white dark:bg-[#2c2e36]",
  text = "text-gray-900 dark:text-white"
}: StatCardProps): React.ReactElement {
  return (
    <div className={`${bg} p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-28`}>
      <div className="flex justify-between items-start">
        <div>
          <div className={`text-sm font-medium ${text === 'text-white' ? 'text-blue-100' : 'text-gray-500'}`}>{title}</div>
          <div className={`text-2xl font-extrabold ${text}`}>{value}</div>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
      {sub && <div className="text-xs mt-auto opacity-75">{sub}</div>}
    </div>
  );
}

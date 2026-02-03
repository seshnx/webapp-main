import React, { useState } from 'react';
import { User, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Avatar size variants
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * Avatar status indicator
 */
export type AvatarStatus = 'online' | 'offline';

/**
 * User avatar component props
 */
export interface UserAvatarProps {
  /** Image source URL */
  src?: string | null;
  /** User's display name (used for initials and alt text) */
  name?: string | null;
  /** Avatar size */
  size?: AvatarSize;
  /** Additional CSS classes */
  className?: string;
  /** Click handler (makes avatar interactive) */
  onClick?: () => void;
  /** Online status indicator */
  status?: AvatarStatus;
  /** Show group icon instead of initials */
  isGroup?: boolean;
  /** Use square shape instead of circular */
  square?: boolean;
}

/**
 * Helper to generate initials from name
 */
const getInitials = (name: string | null | undefined): string => {
  if (!name) return '';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].substring(0, 2).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() || '';
};

/**
 * Generate a consistent color based on the name
 */
const getAvatarColor = (name: string | null | undefined): string => {
  if (!name) return 'from-brand-blue to-purple-600';
  const colors = [
    'from-brand-blue to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

/**
 * User Avatar Component
 *
 * Displays a user avatar with fallback to initials, group icon, or default user icon.
 * Supports different sizes, status indicators, and click interactions.
 *
 * @param props - Avatar props
 * @returns Avatar component
 *
 * @example
 * // Basic usage
 * <UserAvatar name="John Doe" src="/avatar.jpg" />
 *
 * @example
 * // With status indicator
 * <UserAvatar name="Jane Smith" status="online" />
 *
 * @example
 * // Group avatar
 * <UserAvatar isGroup={true} name="Band Members" />
 *
 * @example
 * // Clickable avatar
 * <UserAvatar name="User" onClick={() => navigate('/profile')} />
 */
export default function UserAvatar({
  src,
  name,
  size = 'md',
  className,
  onClick,
  status,
  isGroup = false,
  square = false
}: UserAvatarProps): React.ReactElement {
  const [imgError, setImgError] = useState<boolean>(false);

  const sizeClasses: Record<AvatarSize, string> = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-14 w-14 text-lg",
    '2xl': "h-24 w-24 text-2xl",
    '3xl': "h-32 w-32 text-4xl"
  };

  const containerClass = twMerge(
    clsx(
      "relative overflow-hidden flex items-center justify-center shrink-0 bg-gray-200 dark:bg-gray-700 border border-transparent transition-all select-none",
      square ? "rounded-xl" : "rounded-full",
      sizeClasses[size],
      onClick && "cursor-pointer hover:opacity-90",
      className
    )
  );

  const showFallback = !src || imgError;
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  return (
    <div
      className={containerClass}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={name ? `${name}'s avatar` : 'User avatar'}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${avatarColor} text-white font-bold`}>
          {isGroup ? (
            <Users className="w-1/2 h-1/2" aria-hidden="true" />
          ) : initials ? (
            <span aria-hidden="true">{initials}</span>
          ) : (
            <User className="w-1/2 h-1/2" aria-hidden="true" />
          )}
        </div>
      )}

      {/* Online Status Indicator */}
      {status && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900",
            status === 'online' ? "bg-green-500" : "bg-gray-400",
            size === 'xs' || size === 'sm' ? "h-2 w-2" : "h-3.5 w-3.5"
          )}
          aria-label={status === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

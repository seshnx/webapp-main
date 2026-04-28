import React, { useState } from 'react';
import { UserPlus, UserMinus, Loader2, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Button size variant
 */
export type FollowButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button style variant
 */
export type FollowButtonVariant = 'default' | 'outline' | 'minimal';

/**
 * Props for FollowButton component
 */
export interface FollowButtonProps {
    isFollowing: boolean;
    onToggle: () => void | Promise<void>;
    size?: FollowButtonSize;
    variant?: FollowButtonVariant;
    disabled?: boolean;
    showIcon?: boolean;
    className?: string;
}

/**
 * Reusable Follow/Unfollow button component
 */
export default function FollowButton({
    isFollowing,
    onToggle,
    size = 'md',
    variant = 'default',
    disabled = false,
    showIcon = true,
    className = ''
}: FollowButtonProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [isHovering, setIsHovering] = useState<boolean>(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || loading) return;

        setLoading(true);
        try {
            await onToggle();
        } catch (error) {
            console.error('Follow toggle error:', error);
        }
        setLoading(false);
    };

    // Size variants
    const sizeClasses: Record<FollowButtonSize, string> = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-1.5 text-sm',
        lg: 'px-6 py-2 text-base'
    };

    const iconSizes: Record<FollowButtonSize, number> = {
        sm: 12,
        md: 14,
        lg: 16
    };

    // Style variants
    const getVariantClasses = (): string => {
        if (isFollowing) {
            // Following state - show unfollow on hover
            if (variant === 'outline' || variant === 'minimal') {
                return isHovering
                    ? 'border-red-300 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20'
                    : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300';
            }
            return isHovering
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
        } else {
            // Not following - show follow
            if (variant === 'outline') {
                return 'border-brand-blue text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20';
            }
            if (variant === 'minimal') {
                return 'text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20';
            }
            return 'bg-brand-blue text-white hover:bg-blue-600';
        }
    };

    const baseClasses: string = `
        font-semibold rounded-full transition-all duration-200
        flex items-center justify-center gap-1.5
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === 'outline' ? 'border-2 bg-transparent' : ''}
        ${variant === 'minimal' ? 'bg-transparent' : ''}
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${className}
    `;

    const getIcon = () => {
        if (loading) return <Loader2 className="animate-spin" size={iconSizes[size]} />;
        if (isFollowing) {
            return isHovering
                ? <UserMinus size={iconSizes[size]} />
                : <UserCheck size={iconSizes[size]} />;
        }
        return <UserPlus size={iconSizes[size]} />;
    };

    const getText = (): string => {
        if (isFollowing) {
            return isHovering ? 'Unfollow' : 'Following';
        }
        return 'Follow';
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={baseClasses}
            onClick={handleClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            disabled={disabled || loading}
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={`${isFollowing}-${isHovering}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                >
                    {showIcon && getIcon()}
                    <span>{getText()}</span>
                </motion.span>
            </AnimatePresence>
        </motion.button>
    );
}

/**
 * Props for FollowButtonCompact component
 */
export interface FollowButtonCompactProps {
    isFollowing: boolean;
    onToggle: () => void | Promise<void>;
    disabled?: boolean;
}

/**
 * Compact follow button for use in lists/cards
 */
export function FollowButtonCompact({ isFollowing, onToggle, disabled }: FollowButtonCompactProps) {
    const [loading, setLoading] = useState<boolean>(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled || loading) return;
        setLoading(true);
        try {
            await onToggle();
        } catch (error) {
            console.error('Follow toggle error:', error);
        }
        setLoading(false);
    };

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
                p-2 rounded-full transition-all
                ${isFollowing
                    ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/20'
                    : 'bg-brand-blue text-white hover:bg-blue-600'
                }
                disabled:opacity-50
            `}
            title={isFollowing ? 'Unfollow' : 'Follow'}
        >
            {loading ? (
                <Loader2 className="animate-spin" size={16} />
            ) : isFollowing ? (
                <UserCheck size={16} />
            ) : (
                <UserPlus size={16} />
            )}
        </motion.button>
    );
}

import React from 'react';
import { motion } from 'framer-motion';

/**
 * PageLayout - A consistent wrapper component for all main pages
 * Provides the same polished look and feel as the Dashboard
 *
 * Features:
 * - Centered content with max-w-7xl (matching Dashboard)
 * - Consistent padding and spacing
 * - Optional hero section with gradient background
 * - Smooth animations
 * - Responsive design
 */

export interface PageLayoutProps {
    children: React.ReactNode;
    /** Page title displayed in header */
    title?: string;
    /** Optional subtitle or description */
    subtitle?: string;
    /** Show a hero section with gradient background */
    showHero?: boolean;
    /** Hero section content (overrides title/subtitle) */
    heroContent?: React.ReactNode;
    /** Custom gradient class for hero */
    heroGradient?: string;
    /** Extra actions for the header (buttons, etc) */
    headerActions?: React.ReactNode;
    /** Tab navigation for sub-pages */
    tabs?: React.ReactNode;
    /** Container className override */
    className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    title,
    subtitle,
    showHero = false,
    heroContent,
    heroGradient = 'bg-gradient-to-br from-brand-blue via-purple-600 to-pink-500',
    headerActions,
    tabs,
    className = '',
}) => {
    return (
        <div className={`min-h-screen pb-24 px-fluid pt-fluid ${className}`}>
            {/* Hero Section - Optional */}
            {showHero && (
                <div className="relative overflow-hidden rounded-3xl md:rounded-[2rem] shadow-2xl max-w-7xl mx-auto mb-6">
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 ${heroGradient} opacity-90`} />

                    {/* Animated background blobs */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>

                    {/* Grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '50px 50px'
                        }}
                    />

                    {/* Hero Content */}
                    <div className="relative z-10 px-5 md:px-8 py-8 md:py-12">
                        {heroContent || (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="flex flex-col md:flex-row justify-between md:items-end gap-6"
                            >
                                <div>
                                    {title && (
                                        <>
                                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                                {title}
                                            </h1>
                                            {subtitle && (
                                                <p className="text-white/60 mt-2 text-lg">{subtitle}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                                {headerActions && (
                                    <div className="flex items-center gap-3">
                                        {headerActions}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {/* Simple Header - When hero is not shown */}
            {!showHero && (title || tabs || headerActions) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto mb-6"
                >
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div>
                            {title && (
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">{subtitle}</p>
                            )}
                        </div>
                        {headerActions && (
                            <div className="flex items-center gap-3">
                                {headerActions}
                            </div>
                        )}
                    </div>
                    {tabs && (
                        <div className="mt-6">
                            {tabs}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-7xl mx-auto"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default PageLayout;

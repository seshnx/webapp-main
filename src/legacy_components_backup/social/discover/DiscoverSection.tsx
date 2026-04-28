// src/components/social/discover/DiscoverSection.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Props for DiscoverSection component
 */
export interface DiscoverSectionProps {
    title: string;
    description?: string;
    items: any[];
    loading?: boolean;
    emptyMessage?: string;
    onSeeMore?: () => void;
    renderItem?: (item: any, index: number) => React.ReactNode;
    gridCols?: string;
}

export default function DiscoverSection({
    title,
    description,
    items,
    loading = false,
    emptyMessage,
    onSeeMore,
    renderItem,
    gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
}: DiscoverSectionProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold dark:text-white mb-1">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                    )}
                </div>
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold dark:text-white mb-1">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                    )}
                </div>
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">
                        {emptyMessage || 'No items found.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold dark:text-white mb-1">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                    )}
                </div>
                {onSeeMore && (
                    <button
                        onClick={onSeeMore}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                        See More →
                    </button>
                )}
            </div>

            <div className={`grid ${gridCols} gap-4`}>
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        {renderItem ? renderItem(item, idx) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                {JSON.stringify(item)}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

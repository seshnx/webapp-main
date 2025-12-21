// src/components/social/discover/StudiosDiscover.jsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';

export default function StudiosDiscover({ user, userData, openPublicProfile }) {
    const { loading, recommendations } = useDiscover(user, userData);

    const studios = recommendations?.studios || {};

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Trending Studios"
                description="Most popular studios right now"
                items={studios.trending || []}
                loading={loading}
                emptyMessage="No trending studios found."
                renderItem={(item) => (
                    <DiscoverCard
                        item={item}
                        type="studio"
                        onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                    />
                )}
            />

            <DiscoverSection
                title="New Studios"
                description="Recently added studios"
                items={studios.recent || []}
                loading={loading}
                emptyMessage="No new studios found."
                renderItem={(item) => (
                    <DiscoverCard
                        item={item}
                        type="studio"
                        onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                    />
                )}
            />

            {studios.personalized && studios.personalized.length > 0 && (
                <DiscoverSection
                    title="Recommended for You"
                    description="Based on your location and interests"
                    items={studios.personalized || []}
                    loading={loading}
                    emptyMessage="No recommendations yet."
                    renderItem={(item) => (
                        <DiscoverCard
                            item={item}
                            type="studio"
                            onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                        />
                    )}
                />
            )}
        </div>
    );
}


// src/components/social/discover/ProducersDiscover.jsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';
import { useFollowSystem } from '../../../hooks/useFollowSystem';

export default function ProducersDiscover({ user, userData, openPublicProfile }) {
    const { loading, recommendations } = useDiscover(user, userData);
    const { isFollowing, toggleFollow } = useFollowSystem(user?.uid, userData);

    const producers = recommendations?.producers || {};

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Trending Producers"
                description="Most popular producers right now"
                items={producers.trending || []}
                loading={loading}
                emptyMessage="No trending producers found."
                renderItem={(item) => (
                    <DiscoverCard
                        item={item}
                        type="producer"
                        onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                        onFollow={() => toggleFollow(item.userId || item.id, item)}
                        isFollowing={isFollowing(item.userId || item.id)}
                    />
                )}
            />

            <DiscoverSection
                title="New Producers"
                description="Recently joined producers"
                items={producers.recent || []}
                loading={loading}
                emptyMessage="No new producers found."
                renderItem={(item) => (
                    <DiscoverCard
                        item={item}
                        type="producer"
                        onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                        onFollow={() => toggleFollow(item.userId || item.id, item)}
                        isFollowing={isFollowing(item.userId || item.id)}
                    />
                )}
            />

            {producers.personalized && producers.personalized.length > 0 && (
                <DiscoverSection
                    title="Recommended for You"
                    description="Based on producers you follow"
                    items={producers.personalized || []}
                    loading={loading}
                    emptyMessage="No recommendations yet."
                    renderItem={(item) => (
                        <DiscoverCard
                            item={item}
                            type="producer"
                            onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                            onFollow={() => toggleFollow(item.userId || item.id, item)}
                            isFollowing={isFollowing(item.userId || item.id)}
                        />
                    )}
                />
            )}
        </div>
    );
}


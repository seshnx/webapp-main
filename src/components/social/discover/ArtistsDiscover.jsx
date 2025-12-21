// src/components/social/discover/ArtistsDiscover.jsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';
import { useFollowSystem } from '../../../hooks/useFollowSystem';

export default function ArtistsDiscover({ user, userData, openPublicProfile }) {
    const { loading, recommendations } = useDiscover(user, userData);
    const { isFollowing, toggleFollow } = useFollowSystem(user?.uid, userData);

    const artists = recommendations?.artists || {};

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Trending Artists"
                description="Most popular artists right now"
                items={artists.trending || []}
                loading={loading}
                emptyMessage="No trending artists found."
                renderItem={(item) => (
                    <DiscoverCard
                        item={item}
                        type="artist"
                        onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                        onFollow={() => toggleFollow(item.userId || item.id, item)}
                        isFollowing={isFollowing(item.userId || item.id)}
                    />
                )}
            />

            <DiscoverSection
                title="New Artists"
                description="Recently joined artists"
                items={artists.recent || []}
                loading={loading}
                emptyMessage="No new artists found."
                renderItem={(item) => (
                    <DiscoverCard
                        item={item}
                        type="artist"
                        onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                        onFollow={() => toggleFollow(item.userId || item.id, item)}
                        isFollowing={isFollowing(item.userId || item.id)}
                    />
                )}
            />

            {artists.personalized && artists.personalized.length > 0 && (
                <DiscoverSection
                    title="Recommended for You"
                    description="Based on artists you follow"
                    items={artists.personalized || []}
                    loading={loading}
                    emptyMessage="No recommendations yet."
                    renderItem={(item) => (
                        <DiscoverCard
                            item={item}
                            type="artist"
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


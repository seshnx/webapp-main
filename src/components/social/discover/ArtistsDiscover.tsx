// src/components/social/discover/ArtistsDiscover.tsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';
import { useFollowSystem } from '../../../hooks/useFollowSystem';
import type { UserData } from '../../../types';

/**
 * Props for ArtistsDiscover component
 */
export interface ArtistsDiscoverProps {
    user?: any;
    userData?: UserData | null;
    openPublicProfile?: (userId: string) => void;
}

export default function ArtistsDiscover({ user, userData, openPublicProfile }: ArtistsDiscoverProps) {
    const { loading, artists } = useDiscover(user, userData);
    const { isFollowing, toggleFollow } = useFollowSystem(user?.uid || user?.id);

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Artists"
                description="Discover talented artists"
                items={artists || []}
                loading={loading}
                emptyMessage="No artists found."
                renderItem={(item: any) => (
                    <DiscoverCard
                        item={item}
                        type="artist"
                        onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                        onFollow={() => toggleFollow(item.userId || item.id)}
                        isFollowing={isFollowing(item.userId || item.id)}
                    />
                )}
            />
        </div>
    );
}

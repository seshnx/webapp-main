// src/components/social/discover/ProducersDiscover.tsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';
import { useFollowSystem } from '../../../hooks/useFollowSystem';
import type { UserData } from '../../../types';

/**
 * Props for ProducersDiscover component
 */
export interface ProducersDiscoverProps {
    user?: any;
    userData?: UserData | null;
    openPublicProfile?: (userId: string) => void;
}

export default function ProducersDiscover({ user, userData, openPublicProfile }: ProducersDiscoverProps) {
    const { loading, producers } = useDiscover(user, userData);
    const { isFollowing, toggleFollow } = useFollowSystem(user?.uid || user?.id);

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Producers"
                description="Discover music producers"
                items={producers || []}
                loading={loading}
                emptyMessage="No producers found."
                renderItem={(item: any) => (
                    <DiscoverCard
                        item={item}
                        type="producer"
                        onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                        onFollow={() => toggleFollow(item.userId || item.id)}
                        isFollowing={isFollowing(item.userId || item.id)}
                    />
                )}
            />
        </div>
    );
}

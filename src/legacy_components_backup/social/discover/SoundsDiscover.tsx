// src/components/social/discover/SoundsDiscover.tsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';
import type { UserData } from '../../../types';

/**
 * Props for SoundsDiscover component
 */
export interface SoundsDiscoverProps {
    user?: any;
    userData?: UserData | null;
    openPublicProfile?: (userId: string) => void;
    onFollow?: (userId: string) => void;
}

export default function SoundsDiscover({ user, userData, openPublicProfile }: SoundsDiscoverProps) {
    const { loading, sounds } = useDiscover(user, userData);

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Sounds"
                description="Discover audio content"
                items={sounds || []}
                loading={loading}
                emptyMessage="No sounds found."
                renderItem={(item: any) => (
                    <DiscoverCard
                        item={item}
                        type="sound"
                        onViewProfile={() => openPublicProfile?.(item.userId)}
                        onPlay={() => {
                            // Handle play - would integrate with audio player
                            console.log('Play sound:', item.id);
                        }}
                    />
                )}
            />
        </div>
    );
}

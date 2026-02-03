// src/components/social/discover/StudiosDiscover.tsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';
import type { UserData } from '../../../types';

/**
 * Props for StudiosDiscover component
 */
export interface StudiosDiscoverProps {
    user?: any;
    userData?: UserData | null;
    openPublicProfile?: (userId: string) => void;
}

export default function StudiosDiscover({ user, userData, openPublicProfile }: StudiosDiscoverProps) {
    const { loading, studios } = useDiscover(user, userData);

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Studios"
                description="Discover recording studios"
                items={studios || []}
                loading={loading}
                emptyMessage="No studios found."
                renderItem={(item: any) => (
                    <DiscoverCard
                        item={item}
                        type="studio"
                        onViewProfile={() => openPublicProfile?.(item.userId || item.id)}
                    />
                )}
            />
        </div>
    );
}

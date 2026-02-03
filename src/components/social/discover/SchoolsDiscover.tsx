// src/components/social/discover/SchoolsDiscover.tsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';
import type { UserData } from '../../../types';

/**
 * Props for SchoolsDiscover component
 */
export interface SchoolsDiscoverProps {
    user?: any;
    userData?: UserData | null;
}

export default function SchoolsDiscover({ user, userData }: SchoolsDiscoverProps) {
    const { loading, schools } = useDiscover(user, userData);

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Schools"
                description="Music education programs"
                items={schools || []}
                loading={loading}
                emptyMessage="No schools found."
                renderItem={(item: any) => (
                    <DiscoverCard
                        item={item}
                        type="school"
                        onViewProfile={() => {
                            // Navigate to school or show details
                            console.log('View school:', item.id);
                        }}
                    />
                )}
            />
        </div>
    );
}

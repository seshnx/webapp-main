// src/components/social/discover/SoundsDiscover.jsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';

export default function SoundsDiscover({ user, userData, openPublicProfile, onFollow }) {
    const { loading, recommendations } = useDiscover(user, userData);

    const sounds = recommendations?.sounds || {};

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Trending Sounds"
                description="Most popular audio content right now"
                items={sounds.trending || []}
                loading={loading}
                emptyMessage="No trending sounds found."
                renderItem={(item) => (
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

            <DiscoverSection
                title="New Releases"
                description="Recently posted audio content"
                items={sounds.recent || []}
                loading={loading}
                emptyMessage="No new sounds found."
                renderItem={(item) => (
                    <DiscoverCard
                        item={item}
                        type="sound"
                        onViewProfile={() => openPublicProfile?.(item.userId)}
                        onPlay={() => {
                            console.log('Play sound:', item.id);
                        }}
                    />
                )}
            />

            {sounds.personalized && sounds.personalized.length > 0 && (
                <DiscoverSection
                    title="Recommended for You"
                    description="Based on your activity"
                    items={sounds.personalized || []}
                    loading={loading}
                    emptyMessage="No recommendations yet."
                    renderItem={(item) => (
                        <DiscoverCard
                            item={item}
                            type="sound"
                            onViewProfile={() => openPublicProfile?.(item.userId)}
                            onPlay={() => {
                                console.log('Play sound:', item.id);
                            }}
                        />
                    )}
                />
            )}
        </div>
    );
}


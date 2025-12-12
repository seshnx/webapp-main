// src/components/social/discover/SchoolsDiscover.jsx

import React from 'react';
import DiscoverSection from './DiscoverSection';
import DiscoverCard from './DiscoverCard';
import { useDiscover } from '../../../hooks/useDiscover';

export default function SchoolsDiscover({ user, userData }) {
    const { loading, recommendations } = useDiscover(user, userData);

    const schools = recommendations?.schools || {};

    return (
        <div className="space-y-8">
            <DiscoverSection
                title="Featured Schools"
                description="Top music education programs"
                items={schools.trending || []}
                loading={loading}
                emptyMessage="No featured schools found."
                renderItem={(item) => (
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

            <DiscoverSection
                title="New Schools"
                description="Recently added schools"
                items={schools.recent || []}
                loading={loading}
                emptyMessage="No new schools found."
                renderItem={(item) => (
                    <DiscoverCard
                        item={item}
                        type="school"
                        onViewProfile={() => {
                            console.log('View school:', item.id);
                        }}
                    />
                )}
            />

            {schools.personalized && schools.personalized.length > 0 && (
                <DiscoverSection
                    title="Recommended for You"
                    description="Based on your location and interests"
                    items={schools.personalized || []}
                    loading={loading}
                    emptyMessage="No recommendations yet."
                    renderItem={(item) => (
                        <DiscoverCard
                            item={item}
                            type="school"
                            onViewProfile={() => {
                                console.log('View school:', item.id);
                            }}
                        />
                    )}
                />
            )}
        </div>
    );
}


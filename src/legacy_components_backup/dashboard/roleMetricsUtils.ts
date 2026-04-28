/**
 * Role Metrics Utilities
 *
 * Generates role-specific metrics for the dashboard
 */

import {
    Headphones, Activity, Star, MessageCircle, Music, Wallet,
    Target, Sliders, Crown, Radio
} from 'lucide-react';

export interface RoleMetric {
    id: string;
    label: string;
    value: number | string;
    icon?: any;
    color?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendPercentage?: number;
}

export function generateRoleMetrics(
    roles: string[],
    studioRooms: any[]
): RoleMetric[] {
    const metrics: RoleMetric[] = [];

    if (roles.includes('Studio')) {
        metrics.push(
            {
                id: 'studio-rooms',
                label: 'Studio Rooms',
                value: studioRooms.length,
                icon: Headphones,
                color: 'purple'
            },
            {
                id: 'studio-active',
                label: 'Active Rooms',
                value: studioRooms.filter((r: any) => r.active).length,
                icon: Activity,
                color: 'green'
            }
        );
    }

    if (roles.includes('Talent') || roles.includes('Producer') || roles.includes('Engineer')) {
        metrics.push(
            {
                id: 'gigs-completed',
                label: 'Gigs Completed',
                value: Math.floor(Math.random() * 50) + 10,
                icon: Star,
                color: 'yellow',
                trend: 'up',
                trendPercentage: 12
            },
            {
                id: 'response-rate',
                label: 'Response Rate',
                value: '94%',
                icon: MessageCircle,
                color: 'blue',
                trend: 'up',
                trendPercentage: 5
            }
        );
    }

    if (roles.includes('Producer')) {
        metrics.push(
            {
                id: 'beats-sold',
                label: 'Beats Sold',
                value: Math.floor(Math.random() * 100) + 20,
                icon: Music,
                color: 'pink',
                trend: 'up',
                trendPercentage: 8
            },
            {
                id: 'royalties',
                label: 'Royalties (This Month)',
                value: '$' + (Math.floor(Math.random() * 5000 + 1000)).toString(),
                icon: Wallet,
                color: 'green',
                trend: 'up',
                trendPercentage: 15
            }
        );
    }

    if (roles.includes('Engineer') || roles.includes('Technician')) {
        metrics.push(
            {
                id: 'projects-completed',
                label: 'Projects Completed',
                value: Math.floor(Math.random() * 30) + 5,
                icon: Target,
                color: 'orange',
                trend: 'up',
                trendPercentage: 10
            },
            {
                id: 'equipment-listed',
                label: 'Equipment Listed',
                value: Math.floor(Math.random() * 20) + 5,
                icon: Sliders,
                color: 'indigo'
            }
        );
    }

    if (roles.includes('Label')) {
        metrics.push(
            {
                id: 'artists-signed',
                label: 'Artists Signed',
                value: Math.floor(Math.random() * 15) + 3,
                icon: Crown,
                color: 'purple',
                trend: 'up',
                trendPercentage: 2
            },
            {
                id: 'releases',
                label: 'Releases This Year',
                value: Math.floor(Math.random() * 25) + 5,
                icon: Radio,
                color: 'blue'
            }
        );
    }

    return metrics;
}

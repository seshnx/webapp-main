// src/components/social/discover/DiscoverCard.jsx

import React from 'react';
import { User, Play, MapPin, Award, School, Music, Building2 } from 'lucide-react';
import UserAvatar from '../../shared/UserAvatar';
import FollowButton from '../FollowButton';

export default function DiscoverCard({ 
    item, 
    type, 
    onFollow, 
    onViewProfile, 
    onPlay,
    isFollowing,
    currentUser 
}) {
    const getIcon = () => {
        switch (type) {
            case 'artist':
            case 'producer':
                return <User size={20} />;
            case 'studio':
                return <Building2 size={20} />;
            case 'school':
                return <School size={20} />;
            case 'sound':
                return <Music size={20} />;
            default:
                return null;
        }
    };

    const getTitle = () => {
        if (type === 'sound') {
            return item.text || 'Audio Post';
        }
        return item.displayName || item.name || item.title || 'Unknown';
    };

    const getSubtitle = () => {
        if (type === 'sound') {
            return item.displayName || 'Unknown Artist';
        }
        if (type === 'artist' || type === 'producer') {
            return item.role || item.activeProfileRole || 'User';
        }
        if (type === 'studio') {
            return item.address || item.city || 'Location not specified';
        }
        if (type === 'school') {
            return item.address || 'Location not specified';
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3">
                {/* Avatar/Image */}
                <div className="shrink-0">
                    {type === 'sound' ? (
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Music size={24} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                    ) : (
                        <UserAvatar
                            src={item.photoURL || item.logoURL}
                            name={getTitle()}
                            size="md"
                        />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 
                                className="font-bold dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                onClick={onViewProfile}
                            >
                                {getTitle()}
                            </h3>
                            {getSubtitle() && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                                    {getSubtitle()}
                                </p>
                            )}
                            
                            {/* Additional info */}
                            {type === 'studio' && item.amenities && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {item.amenities.slice(0, 2).join(', ')}
                                </p>
                            )}
                            
                            {type === 'school' && item.programs && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {item.programs.length} program{item.programs.length !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {type === 'sound' && onPlay && (
                                <button
                                    onClick={onPlay}
                                    className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition"
                                    title="Play"
                                >
                                    <Play size={16} fill="currentColor" />
                                </button>
                            )}
                            
                            {(type === 'artist' || type === 'producer') && onFollow && (
                                <FollowButton
                                    isFollowing={isFollowing}
                                    onToggle={onFollow}
                                    size="sm"
                                />
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    {(item.followerCount || item.enrollmentCount) && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {item.followerCount !== undefined && (
                                <span>{item.followerCount} followers</span>
                            )}
                            {item.enrollmentCount !== undefined && (
                                <span>{item.enrollmentCount} enrolled</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


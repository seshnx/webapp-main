import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, DollarSign, Music, Globe, ArrowUpRight } from 'lucide-react';
import StatCard from '../shared/StatCard';
import { getDistributionStats, getStorePerformance, getTopTerritories } from '../../config/neonQueries';

export default function AnalyticsDashboard({ user }) {
    const [stats, setStats] = useState({
        lifetimeStreams: 0,
        lifetimeEarnings: 0,
        monthlyListeners: 0
    });
    const [storePerformance, setStorePerformance] = useState([]);
    const [topTerritories, setTopTerritories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id && !user?.uid) return;
        const userId = user.id || user.uid;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch distribution stats summary
                const statsData = await getDistributionStats(userId);
                if (statsData) {
                    setStats({
                        lifetimeStreams: statsData.lifetime_streams || 0,
                        lifetimeEarnings: statsData.lifetime_earnings || 0,
                        monthlyListeners: statsData.monthly_listeners || 0
                    });
                }

                // Fetch store performance
                const storeData = await getStorePerformance(userId);
                setStorePerformance(storeData);

                // Fetch top territories
                const territoryData = await getTopTerritories(userId, 5);
                setTopTerritories(territoryData);
            } catch (error) {
                console.error('Error fetching distribution analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);

        return () => clearInterval(interval);
    }, [user?.id, user?.uid]);

    // Platform colors mapping
    const getPlatformColor = (platform) => {
        const colors = {
            'spotify': 'bg-green-500',
            'Spotify': 'bg-green-500',
            'apple_music': 'bg-red-500',
            'Apple Music': 'bg-red-500',
            'itunes': 'bg-red-500',
            'tiktok': 'bg-black dark:bg-white',
            'TikTok': 'bg-black dark:bg-white',
            'youtube': 'bg-red-600',
            'YouTube': 'bg-red-600',
            'youtube_music': 'bg-red-600',
            'YouTube Music': 'bg-red-600',
            'amazon_music': 'bg-blue-500',
            'Amazon Music': 'bg-blue-500',
            'deezer': 'bg-purple-500',
            'Deezer': 'bg-purple-500'
        };
        return colors[platform] || 'bg-gray-400';
    };

    // Territory colors mapping
    const getTerritoryColor = (index) => {
        const colors = [
            'bg-blue-100 dark:bg-blue-900',
            'bg-green-100 dark:bg-green-900',
            'bg-purple-100 dark:bg-purple-900',
            'bg-amber-100 dark:bg-amber-900',
            'bg-pink-100 dark:bg-pink-900'
        ];
        return colors[index % colors.length];
    };

    const getTerritoryTextColor = (index) => {
        const colors = [
            'text-blue-600 dark:text-blue-300',
            'text-green-600 dark:text-green-300',
            'text-purple-600 dark:text-purple-300',
            'text-amber-600 dark:text-amber-300',
            'text-pink-600 dark:text-pink-300'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Lifetime Earnings"
                    value={`$${(stats.lifetimeEarnings || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                    icon={<DollarSign className="text-white"/>}
                    bg="bg-gradient-to-br from-green-500 to-emerald-700"
                    text="text-white"
                />
                <StatCard
                    title="Total Streams"
                    value={(stats.lifetimeStreams || 0).toLocaleString()}
                    icon={<Music className="text-white"/>}
                    bg="bg-gradient-to-br from-blue-500 to-indigo-600"
                    text="text-white"
                />
                <StatCard
                    title="Avg. Revenue / 1k"
                    value={`$${stats.lifetimeStreams > 0 ? ((stats.lifetimeEarnings / stats.lifetimeStreams) * 1000).toFixed(2) : '0.00'}`}
                    icon={<TrendingUp className="text-white"/>}
                    bg="bg-gradient-to-br from-purple-500 to-pink-600"
                    text="text-white"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Store Split */}
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold dark:text-white mb-6 flex items-center gap-2">
                        <BarChart2 size={18} className="text-brand-blue"/> Performance by Store
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Loading store performance...
                            </div>
                        ) : storePerformance.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No distribution data available yet
                            </div>
                        ) : (
                            storePerformance.map((item, index) => (
                                <div key={item.platform || index}>
                                    <div className="flex justify-between text-xs font-bold mb-1 dark:text-gray-300">
                                        <span>{item.platform}</span>
                                        <span>{item.percentage}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getPlatformColor(item.platform)}`}
                                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Territories */}
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col">
                    <h3 className="font-bold dark:text-white mb-2 flex items-center gap-2">
                        <Globe size={18} className="text-blue-500"/> Top Territories
                    </h3>
                    <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                        {loading ? (
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                Loading territory data...
                            </div>
                        ) : topTerritories.length === 0 ? (
                            <div className="text-center">
                                <div className="text-4xl font-extrabold text-gray-200 dark:text-gray-700 mb-2">Global</div>
                                <p className="text-sm text-gray-500">No territory data yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <div className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                                        {topTerritories[0]?.territory || 'USA'}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Top Market ({topTerritories[0]?.percentage || 0}%)
                                    </p>
                                </div>
                                {/* Territory bubbles */}
                                {topTerritories.slice(1, 4).map((territory, index) => (
                                    <div
                                        key={territory.country_code || index}
                                        className={`absolute ${getTerritoryColor(index)} ${getTerritoryTextColor(index)} text-xs font-bold px-2 py-1 rounded-full animate-bounce`}
                                        style={{
                                            top: index === 0 ? '1rem' : index === 1 ? 'auto' : '2rem',
                                            right: index === 0 ? '2rem' : 'auto',
                                            bottom: index === 1 ? '2rem' : 'auto',
                                            left: index === 2 ? '2rem' : 'auto',
                                            animationDelay: `${index * 150}ms`
                                        }}
                                    >
                                        {territory.territory}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    <div className="mt-auto pt-4 border-t dark:border-gray-700 text-right">
                        <button className="text-xs font-bold text-brand-blue flex items-center justify-end gap-1 hover:underline">
                            View Full Map <ArrowUpRight size={12}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

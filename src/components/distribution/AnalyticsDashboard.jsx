import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { BarChart2, TrendingUp, DollarSign, Music, Globe, ArrowUpRight } from 'lucide-react';
import { db, appId, getPaths } from '../../config/firebase';
import StatCard from '../shared/StatCard';

export default function AnalyticsDashboard({ user }) {
    const [stats, setStats] = useState({
        lifetimeStreams: 0,
        lifetimeEarnings: 0,
        monthlyListeners: 0
    });

    useEffect(() => {
        if (!user?.uid) return;
        
        // Listen to the Stats Document
        const unsub = onSnapshot(doc(db, getPaths(user.uid).distributionStats), (doc) => {
            if (doc.exists()) {
                setStats(doc.data());
            }
        });
        return () => unsub();
    }, [user?.uid]);

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
                        {[
                            { label: 'Spotify', val: 65, color: 'bg-green-500' },
                            { label: 'Apple Music', val: 20, color: 'bg-red-500' },
                            { label: 'TikTok', val: 10, color: 'bg-black dark:bg-white' },
                            { label: 'Others', val: 5, color: 'bg-gray-400' }
                        ].map(item => (
                            <div key={item.label}>
                                <div className="flex justify-between text-xs font-bold mb-1 dark:text-gray-300">
                                    <span>{item.label}</span>
                                    <span>{item.val}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geography Map Placeholder */}
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col">
                    <h3 className="font-bold dark:text-white mb-2 flex items-center gap-2">
                        <Globe size={18} className="text-blue-500"/> Top Territories
                    </h3>
                    <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                        <div className="text-center">
                            <div className="text-4xl font-extrabold text-gray-200 dark:text-gray-700 mb-2">USA</div>
                            <p className="text-sm text-gray-500">Top Market (45%)</p>
                        </div>
                        {/* Decorative bubbles */}
                        <div className="absolute top-4 right-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full animate-bounce">UK</div>
                        <div className="absolute bottom-8 left-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-full animate-bounce delay-75">Brazil</div>
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

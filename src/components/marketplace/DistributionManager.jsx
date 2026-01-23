import React, { useState, useEffect } from 'react';
import { Plus, Disc, Globe, AlertCircle, CheckCircle, Clock, Edit2, Trash2, X, Music } from 'lucide-react';
import ReleaseBuilder from '../distribution/ReleaseBuilder';

// Supabase has been migrated away - distribution features temporarily disabled
const supabase = null;

export default function DistributionManager({ user, userData }) {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [releases, setReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRelease, setEditingRelease] = useState(null);

    // Fetch User's Releases
    useEffect(() => {
        if (!user?.id && !user?.uid || !supabase) return;
        const userId = user?.id || user?.uid;
        
        // Query releases where the current user is the primary artist/uploader
        const channel = supabase
            .channel('distribution-releases')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'distribution_releases',
                filter: `uploader_id=eq.${userId}`
            }, (payload) => {
                loadReleases();
            })
            .subscribe();

        loadReleases();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, user?.uid]);

    const loadReleases = async () => {
        if (!supabase) return;
        const userId = user?.id || user?.uid;
        setLoading(true);
        try {
            const { data: releasesData, error } = await supabase
                .from('distribution_releases')
                .select('*')
                .eq('uploader_id', userId)
                .order('updated_at', { ascending: false });
            
            if (error) throw error;
            
            setReleases((releasesData || []).map(r => ({
                id: r.id,
                ...r,
                uploaderId: r.uploader_id,
                updatedAt: r.updated_at,
                createdAt: r.created_at
            })));
        } catch (error) {
            console.error('Error loading releases:', error);
        }
        setLoading(false);
    };

    const handleDelete = async (releaseId, title) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone if already distributed.`) || !supabase) return;
        try {
            await supabase
                .from('distribution_releases')
                .delete()
                .eq('id', releaseId);
        } catch (e) {
            console.error(e);
            alert("Failed to delete release.");
        }
    };

    const handleEdit = (release) => {
        if (release.status !== 'Draft' && release.status !== 'Action Needed') {
            return alert("Cannot edit a release that is currently processing or live. Contact support for takedowns.");
        }
        setEditingRelease(release);
        setView('create');
    };

    // --- RENDER ---

    if (view === 'create') {
        return (
            <ReleaseBuilder 
                user={user} 
                userData={userData} 
                initialData={editingRelease}
                onCancel={() => { setView('list'); setEditingRelease(null); }} 
                onSuccess={() => { setView('list'); setEditingRelease(null); }}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Globe className="text-brand-blue" /> Distribution Portal
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your catalog across Spotify, Apple Music, and 150+ stores.
                    </p>
                </div>
                <button 
                    onClick={() => setView('create')} 
                    className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition flex items-center gap-2 shadow-lg hover:shadow-blue-500/20"
                >
                    <Plus size={20} /> New Release
                </button>
            </div>

            {/* Release List */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading catalog...</div>
                ) : releases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                            <Disc size={48} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold dark:text-white">No Releases Yet</h3>
                        <p className="text-gray-500 max-w-sm mt-2 mb-6">Start your journey by uploading your first single, EP, or album to the world.</p>
                        <button onClick={() => setView('create')} className="text-brand-blue font-bold hover:underline">
                            Create First Release
                        </button>
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-700">
                        {releases.map(release => (
                            <div key={release.id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                <div className="flex items-center gap-4">
                                    {/* Artwork Thumbnail */}
                                    <div className="h-16 w-16 bg-gray-200 dark:bg-black rounded-lg shadow-sm overflow-hidden shrink-0 border dark:border-gray-700">
                                        {release.artworkUrl ? (
                                            <img src={release.artworkUrl} alt="Art" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400"><Music size={20}/></div>
                                        )}
                                    </div>
                                    
                                    {/* Meta */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                                                release.status === 'Live' ? 'bg-green-100 text-green-700 border-green-200' :
                                                release.status === 'Processing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                release.status === 'Action Needed' ? 'bg-red-100 text-red-700 border-red-200' :
                                                'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                            }`}>
                                                {release.status}
                                            </span>
                                            <span className="text-xs text-gray-400 uppercase font-bold">{release.type}</span>
                                        </div>
                                        <h4 className="font-bold text-lg dark:text-white leading-tight">{release.title || 'Untitled Release'}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {release.primaryArtist} • {release.tracks?.length || 0} Tracks
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 pl-4 md:pl-0 border-l md:border-l-0 dark:border-gray-700">
                                    <div className="text-right hidden md:block mr-4">
                                        <div className="text-xs text-gray-400 uppercase font-bold">Release Date</div>
                                        <div className="text-sm font-medium dark:text-gray-200">
                                            {release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : 'TBD'}
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleEdit(release)}
                                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                        title="Edit / View Details"
                                    >
                                        <Edit2 size={18}/>
                                    </button>
                                    
                                    {(release.status === 'Draft' || release.status === 'Action Needed') && (
                                        <button 
                                            onClick={() => handleDelete(release.id, release.title)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            title="Delete Release"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

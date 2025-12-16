import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Users, Search, UserPlus, Trash2, Shield, User } from 'lucide-react';

export default function LabelManager({ user }) {
    const [roster, setRoster] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'search'

    // 1. Fetch Roster
    useEffect(() => {
        if (!user?.id && !user?.uid || !supabase) return;
        const userId = user.id || user.uid;
        
        // Initial fetch
        supabase
            .from('label_roster')
            .select('*')
            .eq('label_id', userId)
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error fetching roster:', error);
                    return;
                }
                setRoster((data || []).map(item => ({
                    id: item.id,
                    artistId: item.artist_id,
                    name: item.name,
                    email: item.email,
                    photoURL: item.photo_url,
                    status: item.status,
                    signedAt: item.signed_at
                })));
            });

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`label-roster-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'label_roster',
                    filter: `label_id=eq.${userId}`
                },
                async () => {
                    const { data } = await supabase
                        .from('label_roster')
                        .select('*')
                        .eq('label_id', userId);
                    
                    if (data) {
                        setRoster(data.map(item => ({
                            id: item.id,
                            artistId: item.artist_id,
                            name: item.name,
                            email: item.email,
                            photoURL: item.photo_url,
                            status: item.status,
                            signedAt: item.signed_at
                        })));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, user?.uid]);

    // 2. Search for Artists to Sign
    const handleSearch = async () => {
        if (searchQuery.length < 3 || !supabase) return;
        setSearching(true);
        try {
            const userId = user?.id || user?.uid;
            const searchLower = searchQuery.toLowerCase();
            
            // Search public profiles using native Supabase
            const { data, error } = await supabase
                .from('public_profiles')
                .select('*')
                .contains('search_terms', [searchLower])
                .limit(20);

            if (error) throw error;

            // Filter out self and already signed artists
            const results = (data || [])
                .filter(u => u.id !== userId && !roster.some(r => r.artistId === u.id))
                .map(profile => ({
                    id: profile.id,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    email: profile.email,
                    photoURL: profile.avatar_url,
                    displayName: profile.display_name
                }));
            
            setSearchResults(results);
        } catch (e) {
            console.error("Search failed:", e);
        }
        setSearching(false);
    };

    // 3. "Sign" Artist (Add to Roster)
    const signArtist = async (artist) => {
        if (!supabase) {
            alert("Database unavailable.");
            return;
        }

        try {
            const userId = user?.id || user?.uid;
            
            const { error } = await supabase
                .from('label_roster')
                .insert({
                    label_id: userId,
                    artist_id: artist.id,
                    name: `${artist.firstName || ''} ${artist.lastName || ''}`.trim(),
                    email: artist.email || 'N/A',
                    photo_url: artist.photoURL || null,
                    status: 'Active'
                });

            if (error) throw error;

            alert(`Signed ${artist.firstName || artist.displayName} to roster!`);
            setSearchQuery('');
            setSearchResults([]);
            setView('list');
        } catch (e) {
            console.error("Signing failed:", e);
            alert("Failed to add artist: " + (e.message || "Unknown error"));
        }
    };

    // 4. Remove Artist
    const releaseArtist = async (rosterId, name) => {
        if (!confirm(`Release ${name} from your roster?`) || !supabase) return;
        try {
            const { error } = await supabase
                .from('label_roster')
                .delete()
                .eq('id', rosterId);

            if (error) throw error;
        } catch (e) {
            console.error(e);
            alert("Failed to release artist: " + (e.message || "Unknown error"));
        }
    };

    // --- RENDER ---
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-20">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Shield className="text-purple-600" /> Label Management
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your artist roster and bookings.
                    </p>
                </div>
                <button 
                    onClick={() => setView(view === 'list' ? 'search' : 'list')}
                    className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-2"
                >
                    {view === 'list' ? <><UserPlus size={18}/> Sign Artist</> : 'Back to Roster'}
                </button>
            </div>

            {/* View: Search */}
            {view === 'search' && (
                <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm animate-in slide-in-from-top-4">
                    <h3 className="font-bold dark:text-white mb-4">Find Talent</h3>
                    <div className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input 
                                className="w-full pl-10 p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button onClick={handleSearch} disabled={searching} className="bg-gray-900 dark:bg-white dark:text-black text-white px-6 rounded-xl font-bold">
                            {searching ? '...' : 'Search'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map(artist => (
                            <div key={artist.id} className="p-4 border dark:border-gray-700 rounded-xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        {artist.photoURL ? <img src={artist.photoURL} className="h-full w-full object-cover"/> : <User className="m-2 text-gray-400"/>}
                                    </div>
                                    <div>
                                        <div className="font-bold dark:text-white text-sm">{artist.firstName} {artist.lastName}</div>
                                        <div className="text-xs text-gray-500">{artist.accountTypes?.[0] || 'User'}</div>
                                    </div>
                                </div>
                                <button onClick={() => signArtist(artist)} className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200">
                                    Sign
                                </button>
                            </div>
                        ))}
                        {searchResults.length === 0 && searchQuery && !searching && <div className="col-span-full text-center text-gray-500 text-sm">No artists found.</div>}
                    </div>
                </div>
            )}

            {/* View: Roster List */}
            {view === 'list' && (
                <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-[#23262f] border-b dark:border-gray-700 flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-500 uppercase tracking-wide">Current Roster ({roster.length})</span>
                    </div>
                    {roster.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Users size={48} className="mx-auto mb-3 opacity-20"/>
                            <p>No artists signed yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y dark:divide-gray-700">
                            {roster.map(item => (
                                <div key={item.id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold text-lg overflow-hidden">
                                            {item.photoURL ? <img src={item.photoURL} className="h-full w-full object-cover"/> : item.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold dark:text-white text-lg">{item.name}</h4>
                                            <p className="text-xs text-gray-500">Signed: {item.signedAt?.toDate ? item.signedAt.toDate().toLocaleDateString() : 'Recent'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold">
                                            {item.status}
                                        </span>
                                        <button 
                                            onClick={() => releaseArtist(item.id, item.name)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            title="Release Artist"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

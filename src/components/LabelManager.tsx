import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Trash2, Shield, User, LucideIcon } from 'lucide-react';

// =====================================================
// TYPES
// =====================================================

interface LabelManagerProps {
  user: {
    id?: string;
    uid?: string;
    [key: string]: any;
  };
}

interface RosterItem {
  id: string;
  artistId: string;
  name: string;
  email: string;
  photoURL: string | null;
  status: string;
  signedAt?: {
    toDate?: () => Date;
  } | Date;
}

interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string | null;
  displayName: string;
  accountTypes?: string[];
}

type ViewMode = 'list' | 'search';

// =====================================================
// COMPONENT
// =====================================================

export default function LabelManager({ user }: LabelManagerProps): JSX.Element {
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [view, setView] = useState<ViewMode>('list');

  // NOTE: This component uses legacy Supabase code and needs to be migrated to Neon
  // The supabase import is missing and should be replaced with neonQueries

  // 1. Fetch Roster
  useEffect(() => {
    // TODO: Migrate to Neon database
    // This is legacy Supabase code that needs updating
    if (!user?.id && !user?.uid) return;
    const userId = user.id || user.uid;

    // Placeholder for migration - would use getLabelRoster(userId) from neonQueries
    // For now, this component is non-functional until migration is complete
    console.warn('LabelManager needs to be migrated from Supabase to Neon');
  }, [user?.id, user?.uid]);

  // 2. Search for Artists to Sign
  const handleSearch = async (): Promise<void> => {
    // TODO: Migrate to Neon database
    if (searchQuery.length < 3) return;
    setSearching(true);
    try {
      const userId = user?.id || user?.uid;
      const searchLower = searchQuery.toLowerCase();

      // Placeholder: Would use searchPublicProfiles(searchLower) from neonQueries
      console.warn('LabelManager search needs Neon migration');

      // Filter out self and already signed artists
      const results: SearchResult[] = []
        .filter(u => u.id !== userId && !roster.some(r => r.artistId === u.id));

      setSearchResults(results);
    } catch (e) {
      console.error("Search failed:", e);
    }
    setSearching(false);
  };

  // 3. "Sign" Artist (Add to Roster)
  const signArtist = async (artist: SearchResult): Promise<void> => {
    // TODO: Migrate to Neon database
    try {
      const userId = user?.id || user?.uid;

      // Placeholder: Would use addToLabelRoster() from neonQueries
      console.warn('LabelManager signArtist needs Neon migration');

      alert(`Signed ${artist.firstName || artist.displayName} to roster!`);
      setSearchQuery('');
      setSearchResults([]);
      setView('list');
    } catch (e) {
      console.error("Signing failed:", e);
      const error = e as Error;
      alert("Failed to add artist: " + (error.message || "Unknown error"));
    }
  };

  // 4. Remove Artist
  const releaseArtist = async (rosterId: string, name: string): Promise<void> => {
    if (!confirm(`Release ${name} from your roster?`)) return;
    try {
      // Placeholder: Would use removeFromLabelRoster() from neonQueries
      console.warn('LabelManager releaseArtist needs Neon migration');
    } catch (e) {
      console.error(e);
      const error = e as Error;
      alert("Failed to release artist: " + (error.message || "Unknown error"));
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

      {/* Migration Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl text-sm text-yellow-800 dark:text-yellow-200">
        <strong>Note:</strong> This component is currently being migrated from Supabase to Neon. Some features may not be available.
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
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-gray-900 dark:bg-white dark:text-black text-white px-6 rounded-xl font-bold"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map(artist => (
              <div key={artist.id} className="p-4 border dark:border-gray-700 rounded-xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {artist.photoURL ? (
                      <img src={artist.photoURL} className="h-full w-full object-cover" alt={artist.displayName}/>
                    ) : (
                      <User className="m-2 text-gray-400"/>
                    )}
                  </div>
                  <div>
                    <div className="font-bold dark:text-white text-sm">{artist.firstName} {artist.lastName}</div>
                    <div className="text-xs text-gray-500">{artist.accountTypes?.[0] || 'User'}</div>
                  </div>
                </div>
                <button
                  onClick={() => signArtist(artist)}
                  className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-200"
                >
                  Sign
                </button>
              </div>
            ))}
            {searchResults.length === 0 && searchQuery && !searching && (
              <div className="col-span-full text-center text-gray-500 text-sm">No artists found.</div>
            )}
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
                      {item.photoURL ? (
                        <img src={item.photoURL} className="h-full w-full object-cover" alt={item.name}/>
                      ) : (
                        item.name[0]
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white text-lg">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        Signed: {item.signedAt?.toDate
                          ? item.signedAt.toDate().toLocaleDateString()
                          : 'Recent'
                        }
                      </p>
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

import React, { useState, useEffect } from 'react';
import { getExternalArtists, createExternalArtist } from '../../config/neonQueries';
import { UserPlus, Mail, Music, Edit2, Trash2 } from 'lucide-react';

/**
 * External artist data interface
 */
interface ExternalArtist {
    id: string;
    name: string;
    email?: string;
    stage_name?: string;
    primary_role?: string;
    genre?: string[];
    contract_type?: string;
    status?: string;
    notes?: string;
    [key: string]: any;
}

/**
 * Form data interface
 */
interface ExternalArtistFormData {
    name: string;
    email: string;
    stage_name: string;
    primary_role: string;
    genre: string[];
    contract_type: string;
    notes: string;
}

/**
 * ExternalArtistManager props
 */
export interface ExternalArtistManagerProps {
    user?: any;
}

/**
 * ExternalArtistManager - Manage artists not yet on the platform
 *
 * Features:
 * - Add external artists with basic info
 * - View external artists list with status tracking
 * - Invitation status (invited, active, platform, terminated)
 */
export default function ExternalArtistManager({ user }: ExternalArtistManagerProps) {
    const [artists, setArtists] = useState<ExternalArtist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<ExternalArtistFormData>({
        name: '',
        email: '',
        stage_name: '',
        primary_role: '',
        genre: [],
        contract_type: '',
        notes: ''
    });

    useEffect(() => {
        loadArtists();
    }, [user?.id]);

    const loadArtists = async () => {
        setLoading(true);
        try {
            const data = await getExternalArtists(user?.id);
            setArtists((data || []) as ExternalArtist[]);
        } catch (error) {
            console.error('Error loading external artists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setSubmitting(true);
        try {
            await createExternalArtist(user.id, {
                name: formData.name,
                email: formData.email || null,
                stage_name: formData.stage_name || null,
                genre: formData.genre,
                primary_role: formData.primary_role || null,
                contract_type: formData.contract_type || null,
                signed_date: new Date().toISOString().split('T')[0]
            });

            // Reset form and reload
            setFormData({
                name: '',
                email: '',
                stage_name: '',
                primary_role: '',
                genre: [],
                contract_type: '',
                notes: ''
            });
            setShowForm(false);
            loadArtists();
        } catch (error) {
            console.error('Error creating external artist:', error);
            alert('Failed to add artist. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status?: string): string => {
        switch (status) {
            case 'invited':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'active':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'platform':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'terminated':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">External Artists</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Artists not yet on the platform
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-purple-700 transition"
                    >
                        <UserPlus size={18} />
                        Add External Artist
                    </button>
                )}
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6 shadow-sm animate-in slide-in-from-top-4">
                    <h3 className="font-bold dark:text-white mb-4 text-lg">Add External Artist</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Artist Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Legal name"
                                    value={formData.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Stage Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Performance name"
                                    value={formData.stage_name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, stage_name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email (for invitation)
                                </label>
                                <input
                                    type="email"
                                    placeholder="artist@example.com"
                                    value={formData.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Primary Role
                                </label>
                                <select
                                    value={formData.primary_role}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, primary_role: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Select role...</option>
                                    <option value="Singer">Singer</option>
                                    <option value="Rapper">Rapper</option>
                                    <option value="Producer">Producer</option>
                                    <option value="Songwriter">Songwriter</option>
                                    <option value="DJ">DJ</option>
                                    <option value="Engineer">Engineer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contract Type
                                </label>
                                <select
                                    value={formData.contract_type}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, contract_type: e.target.value })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Select contract type...</option>
                                    <option value="Recording">Recording</option>
                                    <option value="Distribution">Distribution</option>
                                    <option value="Publishing">Publishing</option>
                                    <option value="Management">Management</option>
                                    <option value="Full Service">Full Service</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Genre (comma separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Hip-Hop, R&B, Pop"
                                    value={formData.genre.join(', ')}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({
                                        ...formData,
                                        genre: e.target.value.split(',').map(g => g.trim()).filter(g => g)
                                    })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-[#1f2128] dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                type="submit"
                                disabled={submitting || !formData.name}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>Adding...</>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        Add Artist
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* External Artists List */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : artists.length === 0 ? (
                    <div className="p-12 text-center">
                        <Music size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                        <p className="text-lg font-medium dark:text-white">No external artists yet</p>
                        <p className="text-sm text-gray-500 mt-1">Add artists who aren't on the platform</p>
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-700">
                        {artists.map(artist => (
                            <div key={artist.id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 font-bold text-lg">
                                            {(artist.stage_name || artist.name)[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold dark:text-white">
                                                    {artist.stage_name || artist.name}
                                                </h4>
                                                {artist.stage_name && artist.name && artist.name !== artist.stage_name && (
                                                    <span className="text-sm text-gray-500">({artist.name})</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                                                {artist.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail size={14} />
                                                        {artist.email}
                                                    </span>
                                                )}
                                                {artist.primary_role && (
                                                    <span>• {artist.primary_role}</span>
                                                )}
                                                {artist.contract_type && (
                                                    <span>• {artist.contract_type}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(artist.status)}`}>
                                            {artist.status || 'invited'}
                                        </span>

                                        <button
                                            className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>

                                        <button
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            title="Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, Calendar, Edit3, Save, XCircle, Search, Plus, UserPlus, Users } from 'lucide-react';
import { CLIENT_TYPES } from '../../../config/constants';

/**
 * Client interface
 */
interface Client {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string | null;
    client_type?: 'vip' | 'regular' | 'prospect';
    tags?: string[];
    notes?: string;
    client_id?: string | null;
    total_bookings?: number;
    total_spent?: number;
    first_booking_date?: string | null;
    last_booking_date?: string | null;
    created_at?: string;
}

/**
 * Platform User interface for search results
 */
interface PlatformUser {
    user_id: string;
    display_name?: string;
    profile_name?: string;
    username?: string;
    email: string;
    photo_url?: string;
}

/**
 * Form data interface
 */
interface ClientFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    client_type: 'vip' | 'regular' | 'prospect';
    notes: string;
    client_id: string | null;
}

/**
 * ClientDetailsModal props
 */
export interface ClientDetailsModalProps {
    client: Client | null;
    onClose: () => void;
    onUpdate: (client: Client) => void;
    studioId?: string;
    mode?: 'view' | 'edit' | 'add';
}

/**
 * ClientDetailsModal - View and edit client details
 * Features:
 * - View full client profile
 * - Edit client information
 * - Search platform users to add as clients
 * - Add off-platform clients
 */
export default function ClientDetailsModal({ client, onClose, onUpdate, studioId, mode = 'view' }: ClientDetailsModalProps) {
    const [isEditing, setIsEditing] = useState<boolean>(mode === 'edit');
    const [isAddingNew, setIsAddingNew] = useState<boolean>(mode === 'add');
    const [searchMode, setSearchMode] = useState<'platform' | 'off-platform'>('off-platform');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<PlatformUser[]>([]);
    const [searching, setSearching] = useState<boolean>(false);
    const [formData, setFormData] = useState<ClientFormData>({
        name: '',
        email: '',
        phone: '',
        company: '',
        client_type: 'regular',
        notes: '',
        client_id: null
    });

    useEffect(() => {
        if (client && !isAddingNew) {
            setFormData({
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                company: client.company || '',
                client_type: client.client_type || 'regular',
                notes: client.notes || '',
                client_id: client.client_id || null
            });
        }
    }, [client, isAddingNew]);

    const handleSearchPlatformUsers = async () => {
        if (!searchTerm.trim() || searching) return;

        setSearching(true);
        try {
            const response = await fetch(
                `/api/studio-ops/clients/search-users?search=${encodeURIComponent(searchTerm)}&studioId=${studioId}&limit=10`
            );
            const data = await response.json();

            if (data.success) {
                setSearchResults(data.data);
            } else {
                console.error('Search failed:', data.error);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectPlatformUser = (user: PlatformUser) => {
        setFormData({
            ...formData,
            name: user.display_name || user.profile_name || user.username || '',
            email: user.email,
            client_id: user.user_id,
            company: ''
        });
        setSearchResults([]);
        setSearchTerm('');
    };

    const handleSave = async () => {
        try {
            const url = isAddingNew
                ? '/api/studio-ops/clients'
                : `/api/studio-ops/clients/${client?.id}`;

            const method = isAddingNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    studioId,
                    clientType: formData.client_type
                })
            });

            const data = await response.json();

            if (data.success) {
                onUpdate(data.data);
                onClose();
            } else {
                alert(`Error: ${data.error || 'Failed to save client'}`);
            }
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Failed to save client. Please try again.');
        }
    };

    const formatCurrency = (amount: number | undefined): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    if (isAddingNew) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <UserPlus size={20} />
                                Add New Client
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Choose how to add this client
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        >
                            <X size={20} className="dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Client Type Selection */}
                    <div className="p-6 border-b dark:border-gray-700">
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setSearchMode('off-platform')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                    searchMode === 'off-platform'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <UserPlus className="mx-auto mb-2" size={24} />
                                <div className="font-semibold dark:text-white">Off-Platform Client</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Client not registered on SeshNx
                                </div>
                            </button>

                            <button
                                onClick={() => setSearchMode('platform')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                    searchMode === 'platform'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <Users className="mx-auto mb-2" size={24} />
                                <div className="font-semibold dark:text-white">Platform User</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Search for existing SeshNx users
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Platform User Search */}
                    {searchMode === 'platform' && (
                        <div className="p-6 border-b dark:border-gray-700">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search Platform Users
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by username, email, or name..."
                                        value={searchTerm}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchPlatformUsers()}
                                        className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <button
                                    onClick={handleSearchPlatformUsers}
                                    disabled={searching || !searchTerm.trim()}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                                >
                                    {searching ? 'Searching...' : 'Search'}
                                </button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="mt-4 max-h-60 overflow-y-auto">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                                    </div>
                                    <div className="space-y-2">
                                        {searchResults.map((user) => (
                                            <button
                                                key={user.user_id}
                                                onClick={() => handleSelectPlatformUser(user)}
                                                className="w-full p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                                            >
                                                {user.photo_url ? (
                                                    <img
                                                        src={user.photo_url}
                                                        alt={user.display_name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                        {(user.display_name || user.username || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold dark:text-white truncate">
                                                        {user.display_name || user.profile_name || user.username}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                        {user.email}
                                                    </div>
                                                </div>
                                                <Plus size={18} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Client Form */}
                    <div className="p-6">
                        <div className="space-y-4">
                            {searchMode === 'platform' && formData.client_id && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                                    <User size={18} className="text-green-600 dark:text-green-400" />
                                    <span className="text-sm text-green-700 dark:text-green-300">
                                        Platform user selected: <strong>{formData.name}</strong>
                                    </span>
                                    <button
                                        onClick={() => {
                                            setFormData({ ...formData, client_id: null, name: '', email: '' });
                                        }}
                                        className="ml-auto"
                                    >
                                        <XCircle size={16} className="text-green-600 dark:text-green-400" />
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={searchMode === 'platform' && !!formData.client_id}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={searchMode === 'platform' && !!formData.client_id}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Client Type *
                                </label>
                                <select
                                    required
                                    value={formData.client_type}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, client_type: e.target.value as 'vip' | 'regular' | 'prospect' })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                >
                                    {CLIENT_TYPES.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.name}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={18} />
                                Add Client
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // View/Edit Mode
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <User size={20} />
                            {isEditing ? 'Edit Client' : 'Client Details'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {isEditing ? 'Update client information' : 'View full client profile'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Edit client"
                            >
                                <Edit3 size={18} className="dark:text-gray-400" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                        >
                            <X size={20} className="dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Client Type Badge */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {client?.client_id && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                                    <Users size={14} />
                                    Platform User
                                </div>
                            )}
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                client?.client_type === 'vip' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                client?.client_type === 'regular' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                client?.client_type === 'prospect' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                                'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                            }`}>
                                {CLIENT_TYPES.find(t => t.id === client?.client_type)?.label || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    {/* Edit Form */}
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Client Type *
                                </label>
                                <select
                                    required
                                    value={formData.client_type}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, client_type: e.target.value as 'vip' | 'regular' | 'prospect' })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                >
                                    {CLIENT_TYPES.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        if (client) {
                                            setFormData({
                                                name: client.name || '',
                                                email: client.email || '',
                                                phone: client.phone || '',
                                                company: client.company || '',
                                                client_type: client.client_type || 'regular',
                                                notes: client.notes || '',
                                                client_id: client.client_id || null
                                            });
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        // View Mode
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Mail size={18} className="text-gray-600 dark:text-gray-400" />
                                    <div className="min-w-0">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Email</div>
                                        <div className="font-medium dark:text-white truncate">{client?.email || 'Not provided'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Phone size={18} className="text-gray-600 dark:text-gray-400" />
                                    <div className="min-w-0">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Phone</div>
                                        <div className="font-medium dark:text-white">{client?.phone || 'Not provided'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Building size={18} className="text-gray-600 dark:text-gray-400" />
                                    <div className="min-w-0">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Company</div>
                                        <div className="font-medium dark:text-white truncate">{client?.company || 'Not provided'}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
                                    <div className="min-w-0">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">Client Since</div>
                                        <div className="font-medium dark:text-white">
                                            {client?.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {client?.notes && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Notes</div>
                                    <div className="text-sm dark:text-white">{client.notes}</div>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{client?.total_bookings || 0}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Bookings</div>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(client?.total_spent)}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Lifetime Value</div>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {client?.first_booking_date
                                            ? new Date(client.first_booking_date).toLocaleDateString()
                                            : 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">First Booking</div>
                                </div>
                            </div>

                            {client?.tags && client.tags.length > 0 && (
                                <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags</div>
                                    <div className="flex flex-wrap gap-2">
                                        {client.tags.map((tag, index) => (
                                            <span key={index} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

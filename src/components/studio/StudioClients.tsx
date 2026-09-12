import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { Users, Plus, Search, Mail, Phone, Building, Calendar, Edit2, Trash2, Loader2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { CLIENT_TYPES } from '../../config/constants';
import ClientDetailsModal from './clients/ClientDetailsModal';

/**
 * Client interface
 */
interface Client {
    id: string;
    _id?: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string | null;
    client_type: 'vip' | 'regular' | 'prospect';
    tags?: string[];
    notes?: string;
    total_bookings: number;
    total_spent: number;
    first_booking_date?: string | null;
    last_booking_date?: string | null;
    created_at: string;
    avatarUrl?: string;
    userId?: string;
}

/**
 * StudioClients props
 */
export interface StudioClientsProps {
    user?: any;
    userData?: any;
    studio?: any;
}

/**
 * StudioClients - Client database and CRM management
 * Powered by reactive Convex studioClients table with full CRUD
 */
export default function StudioClients({ user, userData, studio }: StudioClientsProps) {
    const studioId = studio?._id;
    const convexClients = useQuery(
        api.studioManager.getClientsByStudio,
        studioId ? { studioId } : "skip"
    );

    const createClientMutation = useMutation(api.studioManager.createClient);
    const updateClientMutation = useMutation(api.studioManager.updateClient);
    const deleteClientMutation = useMutation(api.studioManager.deleteClient);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showClientModal, setShowClientModal] = useState<boolean>(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view');

    // Normalize Convex clients
    const clients: Client[] = useMemo(() => {
        if (!convexClients) return [];
        return convexClients.map((c: any) => ({
            id: c._id,
            _id: c._id,
            name: c.name || 'Unnamed Client',
            email: c.email || '',
            phone: c.phone || '',
            company: c.company || null,
            client_type: (c.clientType?.toLowerCase() === 'vip' ? 'vip' : c.clientType?.toLowerCase() === 'prospect' ? 'prospect' : 'regular') as 'vip' | 'regular' | 'prospect',
            tags: c.tags || [],
            notes: c.notes || '',
            total_bookings: c.totalBookings || 0,
            total_spent: c.totalRevenue || 0,
            first_booking_date: c.firstBookingDate || null,
            last_booking_date: c.lastBookingDate || null,
            created_at: new Date(c.createdAt || Date.now()).toISOString(),
            avatarUrl: c.avatarUrl,
            userId: c.userId,
        }));
    }, [convexClients]);

    // Filter clients based on search and type
    const filteredClients = useMemo(() => {
        let filtered = clients;

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(client => client.client_type === filterType);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(client =>
                client.name?.toLowerCase().includes(term) ||
                client.email?.toLowerCase().includes(term) ||
                client.company?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }, [clients, searchTerm, filterType]);

    const handleAddClient = () => {
        setSelectedClient(null);
        setModalMode('add');
        setShowClientModal(true);
    };

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setModalMode('edit');
        setShowClientModal(true);
    };

    const handleDeleteClient = async (clientId: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return;
        const toastId = toast.loading('Deleting client...');
        try {
            const callerClerkId = user?.id || userData?.clerkId;
            await deleteClientMutation({
                clerkId: callerClerkId,
                clientId: clientId as Id<"studioClients">,
            });
            toast.success('Client removed', { id: toastId });
        } catch (error: any) {
            console.error('Delete client error:', error);
            toast.error(error.message || 'Failed to delete client', { id: toastId });
        }
    };

    const handleClientSave = async (formData: any) => {
        if (!studioId) {
            toast.error('No active studio found');
            return;
        }

        const toastId = toast.loading(modalMode === 'add' ? 'Adding client...' : 'Saving client...');
        try {
            const callerClerkId = user?.id || userData?.clerkId;

            if (modalMode === 'add') {
                await createClientMutation({
                    clerkId: callerClerkId,
                    studioId,
                    userId: formData.client_id ? (formData.client_id as Id<"users">) : undefined,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company,
                    clientType: formData.client_type || 'regular',
                    notes: formData.notes,
                });
                toast.success('Client added successfully!', { id: toastId });
            } else if (selectedClient) {
                await updateClientMutation({
                    clerkId: callerClerkId,
                    clientId: (selectedClient._id || selectedClient.id) as Id<"studioClients">,
                    userId: formData.client_id ? (formData.client_id as Id<"users">) : undefined,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company,
                    clientType: formData.client_type,
                    notes: formData.notes,
                });
                toast.success('Client updated successfully!', { id: toastId });
            }

            setShowClientModal(false);
            setSelectedClient(null);
        } catch (error: any) {
            console.error('Failed to save client:', error);
            toast.error(error.message || 'Failed to save client', { id: toastId });
        }
    };

    const getClientTypeColor = (type: string): string => {
        const clientType = CLIENT_TYPES.find(t => t.id === type);
        return clientType?.color || 'gray';
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const stats = {
        total: clients.length,
        vip: clients.filter(c => c.client_type === 'vip').length,
        regular: clients.filter(c => c.client_type === 'regular').length,
        prospect: clients.filter(c => c.client_type === 'prospect').length,
        totalRevenue: clients.reduce((sum, c) => sum + (c.total_spent || 0), 0)
    };

    const isLoading = convexClients === undefined;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                                <Users size={20} />
                            </div>
                            Client Database
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your client relationships and track bookings
                        </p>
                    </div>
                    <button
                        onClick={handleAddClient}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Client
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Clients</div>
                        <div className="text-2xl font-bold dark:text-white mt-1">{stats.total}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 dark:text-purple-400">VIP Clients</div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.vip}</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 dark:text-blue-400">Regular</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.regular}</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                        <div className="text-sm text-amber-600 dark:text-amber-400">Prospects</div>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.prospect}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400">Total Revenue</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {formatCurrency(stats.totalRevenue)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'vip', 'regular', 'prospect'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                                    filterType === type
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Clients List */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-purple-600 mb-3" size={32} />
                        <p className="text-gray-500 dark:text-gray-400">Loading studio clients...</p>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold dark:text-white mb-1">
                            {searchTerm || filterType !== 'all' ? 'No matching clients found' : 'No clients in database yet'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                            {searchTerm || filterType !== 'all'
                                ? 'Try adjusting your search criteria or filter to see more clients.'
                                : 'Add your first studio client or search registered platform users to start tracking lifetime value and bookings.'}
                        </p>
                        <button
                            onClick={handleAddClient}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                            Add First Client
                        </button>
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-700">
                        {filteredClients.map((client) => (
                            <div
                                key={client.id}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-bold flex items-center justify-center overflow-hidden">
                                                {client.avatarUrl ? (
                                                    <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    client.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold dark:text-white">
                                                        {client.name}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                                                        client.client_type === 'vip' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                        client.client_type === 'prospect' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    }`}>
                                                        {client.client_type}
                                                    </span>
                                                    {client.userId && (
                                                        <span className="flex items-center gap-1 text-[11px] bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full" title="Platform Member">
                                                            <UserCheck size={12} />
                                                            Verified Member
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
                                            {client.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} />
                                                    {client.email}
                                                </div>
                                            )}
                                            {client.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} />
                                                    {client.phone}
                                                </div>
                                            )}
                                            {client.company && (
                                                <div className="flex items-center gap-2">
                                                    <Building size={14} />
                                                    {client.company}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {client.total_bookings} booking{client.total_bookings !== 1 ? 's' : ''}
                                            </div>
                                        </div>

                                        {client.notes && (
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500 line-clamp-1">
                                                {client.notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <div className="text-right mr-4">
                                            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(client.total_spent)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Lifetime value</div>
                                        </div>
                                        <button
                                            onClick={() => handleEditClient(client)}
                                            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                            title="Edit client"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClient(client.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                            title="Delete client"
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

            {/* Client Details Modal */}
            {showClientModal && (
                <ClientDetailsModal
                    client={selectedClient}
                    onClose={() => {
                        setShowClientModal(false);
                        setSelectedClient(null);
                    }}
                    onUpdate={handleClientSave}
                    studioId={studioId}
                    mode={modalMode}
                />
            )}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, Building, Tag, DollarSign, Calendar, Edit2, Trash2, X } from 'lucide-react';
import { CLIENT_TYPES } from '../../config/constants';

/**
 * StudioClients - Client database and CRM management
 * Phase 1: Full CRUD functionality with search, filter, add, edit, delete
 */
export default function StudioClients({ user, userData }) {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        client_type: 'regular',
        notes: ''
    });

    // Fetch clients on mount
    useEffect(() => {
        fetchClients();
    }, []);

    // Filter clients based on search and type
    useEffect(() => {
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

        setFilteredClients(filtered);
    }, [clients, searchTerm, filterType]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/studio-ops/clients?studioId=${userData?.id}`);
            // const data = await response.json();

            // Mock data for now
            const mockClients = [
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '555-0101',
                    company: 'Doe Productions',
                    client_type: 'vip',
                    tags: ['recording', 'mixing'],
                    notes: 'Regular weekly sessions',
                    total_bookings: 24,
                    total_spent: 12000,
                    first_booking_date: '2024-01-15',
                    last_booking_date: '2025-01-10',
                    created_at: '2024-01-15T10:00:00Z'
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '555-0102',
                    company: 'Smith Music LLC',
                    client_type: 'regular',
                    tags: ['recording'],
                    notes: 'Prefers morning sessions',
                    total_bookings: 8,
                    total_spent: 3200,
                    first_booking_date: '2024-06-01',
                    last_booking_date: '2024-12-20',
                    created_at: '2024-06-01T14:30:00Z'
                },
                {
                    id: '3',
                    name: 'Bob Johnson',
                    email: 'bob@potential.com',
                    phone: '555-0103',
                    company: null,
                    client_type: 'prospect',
                    tags: ['inquiry'],
                    notes: 'Interested in booking for February',
                    total_bookings: 0,
                    total_spent: 0,
                    first_booking_date: null,
                    last_booking_date: null,
                    created_at: '2025-01-05T09:00:00Z'
                }
            ];

            setClients(mockClients);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();

        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/studio-ops/clients', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         ...formData,
            //         studio_id: userData?.id,
            //         client_id: null // New client
            //     })
            // });

            const newClient = {
                id: Date.now().toString(),
                ...formData,
                studio_id: userData?.id,
                tags: [],
                total_bookings: 0,
                total_spent: 0,
                first_booking_date: null,
                last_booking_date: null,
                created_at: new Date().toISOString()
            };

            setClients([...clients, newClient]);
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Error adding client:', error);
        }
    };

    const handleEditClient = async (e) => {
        e.preventDefault();

        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/studio-ops/clients/${selectedClient.id}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });

            const updatedClients = clients.map(client =>
                client.id === selectedClient.id
                    ? { ...client, ...formData }
                    : client
            );

            setClients(updatedClients);
            setShowEditModal(false);
            setSelectedClient(null);
            resetForm();
        } catch (error) {
            console.error('Error updating client:', error);
        }
    };

    const handleDeleteClient = async (clientId) => {
        if (!confirm('Are you sure you want to delete this client?')) return;

        try {
            // TODO: Replace with actual API call
            // await fetch(`/api/studio-ops/clients/${clientId}`, {
            //     method: 'DELETE'
            // });

            setClients(clients.filter(client => client.id !== clientId));
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const openEditModal = (client) => {
        setSelectedClient(client);
        setFormData({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            company: client.company || '',
            client_type: client.client_type || 'regular',
            notes: client.notes || ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            client_type: 'regular',
            notes: ''
        });
    };

    const getClientTypeColor = (type) => {
        const clientType = CLIENT_TYPES.find(t => t.id === type);
        return clientType?.color || 'gray';
    };

    const formatCurrency = (amount) => {
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
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Add Client
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold dark:text-white">{stats.total}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Clients</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.vip}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">VIP</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.regular}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Regular</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.prospect}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Prospects</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.totalRevenue)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search clients by name, email, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        {CLIENT_TYPES.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Client List */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                        Loading clients...
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                        {searchTerm || filterType !== 'all' ? 'No clients match your search' : 'No clients yet. Add your first client to get started.'}
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-700">
                        {filteredClients.map((client) => (
                            <div key={client.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold dark:text-white">{client.name}</h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getClientTypeColor(client.client_type)}-100 dark:bg-${getClientTypeColor(client.client_type)}-900/30 text-${getClientTypeColor(client.client_type)}-600 dark:text-${getClientTypeColor(client.client_type)}-400`}>
                                                {CLIENT_TYPES.find(t => t.id === client.client_type)?.label || 'Unknown'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                                            onClick={() => openEditModal(client)}
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

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold dark:text-white">Add New Client</h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                                <X size={20} className="dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAddClient} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
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
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    Add Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Client Modal */}
            {showEditModal && selectedClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold dark:text-white">Edit Client</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedClient(null);
                                    resetForm();
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                                <X size={20} className="dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleEditClient} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
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
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedClient(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

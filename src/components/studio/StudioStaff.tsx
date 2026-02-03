import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Mail, Phone, DollarSign, Calendar, Edit2, Trash2, X, Clock, UserCheck } from 'lucide-react';
import { STAFF_ROLES } from '../../config/constants';

/**
 * Staff data interface
 */
interface StaffMember {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: string;
    pay_rate_type: 'hourly' | 'per_session' | 'percentage' | 'salary';
    pay_rate?: number;
    skills?: string[];
    status: 'active' | 'inactive' | 'on_leave';
    hire_date?: string;
    total_shifts?: number;
    hours_worked?: number;
    total_earnings?: number;
    studio_id?: string;
    created_at?: string;
    [key: string]: any;
}

/**
 * Form data interface for staff
 */
interface StaffFormData {
    name: string;
    email: string;
    phone: string;
    role: string;
    pay_rate_type: string;
    pay_rate: string;
    skills: string[];
    status: string;
    hire_date: string;
}

/**
 * Props for StudioStaff component
 */
export interface StudioStaffProps {
    user?: any;
    userData?: any;
}

/**
 * StudioStaff - Staff management and scheduling
 * Phase 1: Full CRUD functionality with search, filter, add, edit, delete
 */
export default function StudioStaff({ user, userData }: StudioStaffProps) {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [formData, setFormData] = useState<StaffFormData>({
        name: '',
        email: '',
        phone: '',
        role: 'assistant',
        pay_rate_type: 'hourly',
        pay_rate: '',
        skills: [],
        status: 'active',
        hire_date: ''
    });

    // Fetch staff on mount
    useEffect(() => {
        fetchStaff();
    }, []);

    // Filter staff based on search and filters
    useEffect(() => {
        let filtered = staff;

        // Filter by role
        if (filterRole !== 'all') {
            filtered = filtered.filter(member => member.role === filterRole);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(member => member.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(member =>
                member.name?.toLowerCase().includes(term) ||
                member.email?.toLowerCase().includes(term) ||
                member.role?.toLowerCase().includes(term)
            );
        }

        setFilteredStaff(filtered);
    }, [staff, searchTerm, filterRole, filterStatus]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/studio-ops/staff?studioId=${userData?.id}`);
            // const data = await response.json();

            // Mock data for now
            const mockStaff: StaffMember[] = [
                {
                    id: '1',
                    name: 'Mike Chen',
                    email: 'mike@studio.com',
                    phone: '555-0201',
                    role: 'engineer',
                    pay_rate_type: 'hourly',
                    pay_rate: 75,
                    skills: ['mixing', 'mastering', 'pro-tools'],
                    status: 'active',
                    hire_date: '2023-06-15',
                    total_shifts: 156,
                    hours_worked: 1248,
                    total_earnings: 93600,
                    created_at: '2023-06-15T09:00:00Z'
                },
                {
                    id: '2',
                    name: 'Sarah Williams',
                    email: 'sarah@studio.com',
                    phone: '555-0202',
                    role: 'assistant',
                    pay_rate_type: 'hourly',
                    pay_rate: 25,
                    skills: ['setup', 'teardown', 'equipment'],
                    status: 'active',
                    hire_date: '2024-01-10',
                    total_shifts: 89,
                    hours_worked: 356,
                    total_earnings: 8900,
                    created_at: '2024-01-10T14:00:00Z'
                },
                {
                    id: '3',
                    name: 'Alex Johnson',
                    email: 'alex@studio.com',
                    phone: '555-0203',
                    role: 'producer',
                    pay_rate_type: 'per_session',
                    pay_rate: 200,
                    skills: ['production', 'songwriting', 'arrangement'],
                    status: 'active',
                    hire_date: '2023-09-01',
                    total_shifts: 45,
                    hours_worked: 180,
                    total_earnings: 9000,
                    created_at: '2023-09-01T10:30:00Z'
                },
                {
                    id: '4',
                    name: 'Jordan Lee',
                    email: 'jordan@studio.com',
                    phone: '555-0204',
                    role: 'intern',
                    pay_rate_type: 'hourly',
                    pay_rate: 15,
                    skills: ['assistant', 'learning'],
                    status: 'active',
                    hire_date: '2025-01-05',
                    total_shifts: 12,
                    hours_worked: 48,
                    total_earnings: 720,
                    created_at: '2025-01-05T11:00:00Z'
                }
            ];

            setStaff(mockStaff);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/studio-ops/staff', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         ...formData,
            //         studio_id: userData?.id,
            //         pay_rate: parseFloat(formData.pay_rate)
            //     })
            // });

            const newStaff: StaffMember = {
                id: Date.now().toString(),
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role as any,
                pay_rate_type: formData.pay_rate_type,
                pay_rate: parseFloat(formData.pay_rate),
                skills: formData.skills,
                status: formData.status,
                hire_date: formData.hire_date,
                studio_id: userData?.id,
                total_shifts: 0,
                hours_worked: 0,
                total_earnings: 0,
                created_at: new Date().toISOString()
            };

            setStaff([...staff, newStaff]);
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error('Error adding staff:', error);
        }
    };

    const handleEditStaff = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/studio-ops/staff/${selectedStaff.id}`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         ...formData,
            //         pay_rate: parseFloat(formData.pay_rate)
            //     })
            // });

            const updatedStaff = staff.map(member => {
                if (member.id === selectedStaff!.id) {
                    return {
                        ...member,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        role: formData.role as any,
                        pay_rate_type: formData.pay_rate_type,
                        pay_rate: parseFloat(formData.pay_rate),
                        skills: formData.skills,
                        status: formData.status,
                        hire_date: formData.hire_date
                    };
                }
                return member;
            });

            setStaff(updatedStaff);
            setShowEditModal(false);
            setSelectedStaff(null);
            resetForm();
        } catch (error) {
            console.error('Error updating staff:', error);
        }
    };

    const handleDeleteStaff = async (staffId: string) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return;

        try {
            // TODO: Replace with actual API call
            // await fetch(`/api/studio-ops/staff/${staffId}`, {
            //     method: 'DELETE'
            // });

            setStaff(staff.filter(member => member.id !== staffId));
        } catch (error) {
            console.error('Error deleting staff:', error);
        }
    };

    const openEditModal = (member: StaffMember) => {
        setSelectedStaff(member);
        setFormData({
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            role: member.role || 'assistant',
            pay_rate_type: member.pay_rate_type || 'hourly',
            pay_rate: member.pay_rate?.toString() || '',
            skills: member.skills || [],
            status: member.status || 'active',
            hire_date: member.hire_date || ''
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'assistant',
            pay_rate_type: 'hourly',
            pay_rate: '',
            skills: [],
            status: 'active',
            hire_date: ''
        });
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getRoleBadgeColor = (role: string): string => {
        const colors: Record<string, string> = {
            engineer: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            assistant: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            manager: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            intern: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
            technician: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
            producer: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
        };
        return colors[role] || 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    };

    const getStatusBadgeColor = (status: string): string => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
            on_leave: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
        };
        return colors[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    };

    const stats = {
        total: staff.length,
        active: staff.filter(s => s.status === 'active').length,
        onLeave: staff.filter(s => s.status === 'on_leave').length,
        totalShifts: staff.reduce((sum, s) => sum + (s.total_shifts || 0), 0),
        totalHours: staff.reduce((sum, s) => sum + (s.hours_worked || 0), 0),
        totalPayroll: staff.reduce((sum, s) => sum + (s.total_earnings || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white">
                                <Briefcase size={20} />
                            </div>
                            Staff Management
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage your team, schedule shifts, and track performance
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Add Staff
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="text-2xl font-bold dark:text-white">{stats.total}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Staff</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.onLeave}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">On Leave</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalShifts}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Shifts</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalHours}h</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Hours Worked</div>
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
                            placeholder="Search staff by name, email, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Roles</option>
                        {STAFF_ROLES.map(role => (
                            <option key={role.id} value={role.id}>{role.label}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                    </select>
                </div>
            </div>

            {/* Staff List */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                        Loading staff...
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                        {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                            ? 'No staff members match your search'
                            : 'No staff members yet. Add your first team member to get started.'}
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-700">
                        {filteredStaff.map((member) => (
                            <div key={member.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold dark:text-white">{member.name}</h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                                                {STAFF_ROLES.find(r => r.id === member.role)?.label || 'Unknown'}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(member.status)}`}>
                                                {member.status === 'on_leave' ? 'On Leave' : member.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            {member.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} />
                                                    {member.email}
                                                </div>
                                            )}
                                            {member.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} />
                                                    {member.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={14} />
                                                {member.pay_rate_type === 'hourly' && '$'}
                                                {member.pay_rate}
                                                {member.pay_rate_type === 'hourly' && '/hr'}
                                                {member.pay_rate_type === 'per_session' && '/session'}
                                                {member.pay_rate_type === 'percentage' && '%'}
                                                {member.pay_rate_type === 'salary' && '/yr'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <UserCheck size={14} />
                                                Hired {new Date(member.hire_date || '').toLocaleDateString()}
                                            </div>
                                        </div>

                                        {member.skills && member.skills.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {member.skills.map((skill, index) => (
                                                    <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <div className="text-right mr-4">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {member.total_shifts} shifts · {member.hours_worked}h
                                            </div>
                                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(member.total_earnings || 0)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openEditModal(member)}
                                            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                            title="Edit staff"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStaff(member.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                            title="Remove staff"
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

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold dark:text-white">Add Staff Member</h3>
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

                        <form onSubmit={handleAddStaff} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role *
                                    </label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        {STAFF_ROLES.map(role => (
                                            <option key={role.id} value={role.id}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status *
                                    </label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pay Rate Type *
                                    </label>
                                    <select
                                        required
                                        value={formData.pay_rate_type}
                                        onChange={(e) => setFormData({ ...formData, pay_rate_type: e.target.value })}
                                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="hourly">Hourly</option>
                                        <option value="per_session">Per Session</option>
                                        <option value="percentage">Percentage</option>
                                        <option value="salary">Salary</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pay Rate *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.pay_rate}
                                        onChange={(e) => setFormData({ ...formData, pay_rate: e.target.value })}
                                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Hire Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Add Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Staff Modal */}
            {showEditModal && selectedStaff && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold dark:text-white">Edit Staff Member</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedStaff(null);
                                    resetForm();
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                                <X size={20} className="dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleEditStaff} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role *
                                    </label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        {STAFF_ROLES.map(role => (
                                            <option key={role.id} value={role.id}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status *
                                    </label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pay Rate Type *
                                    </label>
                                    <select
                                        required
                                        value={formData.pay_rate_type}
                                        onChange={(e) => setFormData({ ...formData, pay_rate_type: e.target.value })}
                                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="hourly">Hourly</option>
                                        <option value="per_session">Per Session</option>
                                        <option value="percentage">Percentage</option>
                                        <option value="salary">Salary</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pay Rate *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.pay_rate}
                                        onChange={(e) => setFormData({ ...formData, pay_rate: e.target.value })}
                                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Hire Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedStaff(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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

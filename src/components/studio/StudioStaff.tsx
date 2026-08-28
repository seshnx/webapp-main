import React, { useState, useMemo } from 'react';
import {
  Briefcase, Plus, Search, Mail, Phone, DollarSign, Calendar,
  Edit2, Trash2, X, Clock, UserCheck, Shield, Send, CheckCircle2,
  AlertCircle, Loader2, Building2
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useClerk, useAuth } from '@clerk/react';
import { toast } from 'react-hot-toast';

export interface StudioStaffProps {
  user?: any;
  userData?: any;
  studio?: any;
}

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
  notes: string;
}

const AVAILABLE_ROLES = [
  { id: 'Manager', label: 'Studio Manager', clerkRole: 'org:admin', desc: 'Full administrative access to studio operations and team' },
  { id: 'Engineer', label: 'Audio Engineer', clerkRole: 'org:member', desc: 'Handles recording, mixing, and studio sessions' },
  { id: 'Producer', label: 'Producer', clerkRole: 'org:member', desc: 'Music production and beat creation' },
  { id: 'Assistant', label: 'Assistant / Runner', clerkRole: 'org:member', desc: 'Session setup, client support, and studio upkeep' },
  { id: 'Technician', label: 'Tech / Maintenance', clerkRole: 'org:member', desc: 'Gear repair, calibration, and maintenance' },
  { id: 'Intern', label: 'Intern', clerkRole: 'org:member', desc: 'Apprenticeship and support duties' },
];

export default function StudioStaff({ user, userData, studio }: StudioStaffProps) {
  const clerk = useClerk();
  const { getToken } = useAuth();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'Engineer',
    pay_rate_type: 'hourly',
    pay_rate: '',
    skills: [],
    status: 'active',
    hire_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const staffData = useQuery(
    api.studioManager.getStaffByStudio,
    studio?._id ? { studioId: studio._id, includeInactive: true } : 'skip'
  );

  const createStaffMutation = useMutation(api.studioManager.createStaff);
  const updateStaffMutation = useMutation(api.studioManager.updateStaff);
  const deleteStaffMutation = useMutation(api.studioManager.deleteStaff);

  const staffList = useMemo(() => staffData || [], [staffData]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((member: any) => {
      // Filter by role
      if (filterRole !== 'all' && member.role?.toLowerCase() !== filterRole.toLowerCase()) {
        return false;
      }
      // Filter by status
      if (filterStatus !== 'all') {
        const isPending = member.invitationStatus === 'pending';
        if (filterStatus === 'pending' && !isPending) return false;
        if (filterStatus === 'active' && (!member.isActive || isPending)) return false;
        if (filterStatus === 'inactive' && member.isActive) return false;
      }
      // Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const nameMatch = member.displayName?.toLowerCase().includes(term);
        const emailMatch = member.displayEmail?.toLowerCase().includes(term);
        const roleMatch = member.role?.toLowerCase().includes(term);
        return nameMatch || emailMatch || roleMatch;
      }
      return true;
    });
  }, [staffList, filterRole, filterStatus, searchTerm]);

  // Derived stats
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s: any) => s.isActive && s.invitationStatus !== 'pending').length;
  const pendingInvites = staffList.filter((s: any) => s.invitationStatus === 'pending').length;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Engineer',
      pay_rate_type: 'hourly',
      pay_rate: '',
      skills: [],
      status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studio?._id) {
      toast.error('Studio profile not found.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please provide an email address.');
      return;
    }

    setSubmitting(true);
    try {
      const clerkId = userData?.clerkId || user?.id;
      let clerkInvitationId: string | undefined = undefined;

      // If studio is linked to a Clerk Org, automatically send a Clerk Org invitation
      if (studio.clerkOrgId) {
        try {
          const token = await getToken();
          const roleConfig = AVAILABLE_ROLES.find(r => r.id === formData.role);
          const clerkRole = roleConfig?.clerkRole || 'org:member';

          const res = await fetch('/api/studio/invite-member', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              orgId: studio.clerkOrgId,
              email: formData.email.trim(),
              role: clerkRole
            })
          });

          const data = await res.json();
          if (res.ok && data.invitationId) {
            clerkInvitationId = data.invitationId;
            toast.success(`Clerk Org invite sent to ${formData.email}`);
          } else {
            console.warn('Clerk invite notice:', data.error || data.message);
          }
        } catch (inviteErr) {
          console.error('Failed to send Clerk Org invite:', inviteErr);
        }
      }

      // Create staff record in Convex
      const rateNum = formData.pay_rate ? parseFloat(formData.pay_rate) : undefined;
      await createStaffMutation({
        clerkId,
        studioId: studio._id,
        name: formData.name.trim() || undefined,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        payRateType: formData.pay_rate_type,
        hourlyRate: formData.pay_rate_type === 'hourly' ? rateNum : undefined,
        salary: formData.pay_rate_type === 'salary' ? rateNum : undefined,
        commissionRate: formData.pay_rate_type === 'percentage' ? rateNum : undefined,
        skills: formData.skills,
        hireDate: formData.hire_date,
        notes: formData.notes,
        clerkInvitationId,
        invitationStatus: clerkInvitationId ? 'pending' : 'active',
      });

      toast.success(`${formData.name || formData.email} added to studio staff!`);
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Error adding staff:', err);
      toast.error(err.message || 'Failed to add staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff?._id) return;

    setSubmitting(true);
    try {
      const clerkId = userData?.clerkId || user?.id;
      const rateNum = formData.pay_rate ? parseFloat(formData.pay_rate) : undefined;

      await updateStaffMutation({
        clerkId,
        staffId: selectedStaff._id,
        name: formData.name.trim() || undefined,
        email: formData.email.trim().toLowerCase() || undefined,
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        payRateType: formData.pay_rate_type,
        hourlyRate: formData.pay_rate_type === 'hourly' ? rateNum : undefined,
        salary: formData.pay_rate_type === 'salary' ? rateNum : undefined,
        commissionRate: formData.pay_rate_type === 'percentage' ? rateNum : undefined,
        skills: formData.skills,
        hireDate: formData.hire_date,
        notes: formData.notes,
        isActive: formData.status === 'active',
      });

      toast.success('Staff details updated successfully.');
      setShowEditModal(false);
      setSelectedStaff(null);
      resetForm();
    } catch (err: any) {
      console.error('Error updating staff:', err);
      toast.error(err.message || 'Failed to update staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: any, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your studio staff roster?`)) {
      return;
    }

    try {
      const clerkId = userData?.clerkId || user?.id;
      await deleteStaffMutation({
        clerkId,
        staffId,
      });
      toast.success(`${name} removed from studio staff.`);
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      toast.error(err.message || 'Failed to remove staff member.');
    }
  };

  const openEditModal = (member: any) => {
    setSelectedStaff(member);
    setFormData({
      name: member.displayName || '',
      email: member.displayEmail || '',
      phone: member.displayPhone || '',
      role: member.role || 'Engineer',
      pay_rate_type: member.payRateType || 'hourly',
      pay_rate: (member.hourlyRate || member.salary || member.commissionRate || '').toString(),
      skills: member.skills || [],
      status: member.isActive ? 'active' : 'inactive',
      hire_date: member.hireDate || '',
      notes: member.notes || '',
    });
    setShowEditModal(true);
  };

  if (!studio) {
    return (
      <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-8 text-center">
        <Building2 size={48} className="mx-auto text-brand-blue mb-4 opacity-70" />
        <h2 className="text-xl font-bold dark:text-white mb-2">Studio Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
          Please complete your studio profile setup to manage staff and team members.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Briefcase className="text-brand-blue" size={24} />
            Studio Staff & Team Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your studio engineers, managers, and assistants with automated Clerk Organization syncing.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm"
        >
          <Plus size={18} />
          Add Staff Member
        </button>
      </div>

      {/* Clerk Org Status Banner */}
      {studio.clerkOrgId ? (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-brand-blue shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                Clerk Organization Connected
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Staff invited here receive automated invitations to your Clerk Organization (<code className="font-mono">{studio.slug || studio.clerkOrgId}</code>).
              </p>
            </div>
          </div>
          <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-semibold px-2.5 py-1 rounded-full">
            Auto-Sync Active
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                Clerk Organization Not Linked
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Link an organization in Studio Settings to automatically manage staff authentication and permissions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Staff Roster</p>
          <p className="text-2xl font-bold dark:text-white mt-2">{totalStaff}</p>
        </div>
        <div className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Active Members</p>
          <p className="text-2xl font-bold text-emerald-500 mt-2">{activeStaff}</p>
        </div>
        <div className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Pending Invites</p>
          <p className="text-2xl font-bold text-amber-500 mt-2">{pendingInvites}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="all">All Roles</option>
            {AVAILABLE_ROLES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending Invite</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Staff Roster Grid / Table */}
      {staffData === undefined ? (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
          <Loader2 size={32} className="animate-spin text-brand-blue mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">Loading studio staff roster...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-12 text-center">
          <Briefcase size={40} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <h3 className="text-base font-semibold dark:text-white mb-1">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? 'No staff matching filters' : 'No staff members added yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs max-w-sm mx-auto mb-5">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search criteria.'
              : 'Add your team members to manage schedules, assign sessions, and send Clerk Org invites.'}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all"
          >
            <Plus size={16} />
            Add First Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member: any) => {
            const isPending = member.invitationStatus === 'pending';
            const rateLabel = member.payRateType === 'salary'
              ? `$${member.salary?.toLocaleString() || 0}/yr`
              : member.payRateType === 'percentage'
              ? `${member.commissionRate || 0}% cut`
              : `$${member.hourlyRate || 0}/hr`;

            return (
              <div
                key={member._id}
                className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 p-5 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center font-bold text-brand-blue overflow-hidden text-sm">
                        {member.user?.avatarUrl ? (
                          <img src={member.user.avatarUrl} alt={member.displayName} className="w-full h-full object-cover" />
                        ) : (
                          (member.displayName?.[0] || 'S').toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold dark:text-white text-sm">
                          {member.displayName}
                        </h4>
                        <span className="text-xs font-medium text-brand-blue bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    {isPending ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                        <Send size={10} /> Pending Invite
                      </span>
                    ) : member.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4">
                    {member.displayEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate">{member.displayEmail}</span>
                      </div>
                    )}
                    {member.displayPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-gray-400 shrink-0" />
                        <span>{member.displayPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign size={13} className="text-gray-400 shrink-0" />
                      <span>Compensation: <strong className="font-semibold dark:text-white">{rateLabel}</strong></span>
                    </div>
                    {member.hireDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-gray-400 shrink-0" />
                        <span>Joined: {new Date(member.hireDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {member.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t dark:border-gray-700/60">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1.5 text-gray-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit staff details"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(member._id, member.displayName)}
                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove from roster"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold dark:text-white mb-1 flex items-center gap-2">
              <Plus className="text-brand-blue" size={20} />
              Add Staff Member
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              An invitation to your Clerk Organization will be sent to the email address provided.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="Optional"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pay Structure</label>
                  <select
                    value={formData.pay_rate_type}
                    onChange={(e) => setFormData({ ...formData, pay_rate_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="hourly">Hourly ($/hr)</option>
                    <option value="per_session">Per Session ($)</option>
                    <option value="percentage">Commission (%)</option>
                    <option value="salary">Annual Salary ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Rate / Amount</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={formData.pay_rate}
                    onChange={(e) => setFormData({ ...formData, pay_rate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skills & Specialties (comma separated)</label>
                <input
                  type="text"
                  placeholder="Pro Tools, Vocal Tracking, SSL Console..."
                  value={formData.skills.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Invite & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold dark:text-white mb-1 flex items-center gap-2">
              <Edit2 className="text-brand-blue" size={20} />
              Edit Staff Member
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Update role, rate, and permissions for {selectedStaff.displayName}.
            </p>

            <form onSubmit={handleEditStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pay Structure</label>
                  <select
                    value={formData.pay_rate_type}
                    onChange={(e) => setFormData({ ...formData, pay_rate_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="hourly">Hourly ($/hr)</option>
                    <option value="per_session">Per Session ($)</option>
                    <option value="percentage">Commission (%)</option>
                    <option value="salary">Annual Salary ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Rate / Amount</label>
                  <input
                    type="number"
                    value={formData.pay_rate}
                    onChange={(e) => setFormData({ ...formData, pay_rate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skills & Specialties (comma separated)</label>
                <input
                  type="text"
                  value={formData.skills.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a1d21] border dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

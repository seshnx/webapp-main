import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { Id } from '@convex/dataModel';
import { UserPlus, Shield, X, Mail } from 'lucide-react';

/**
 * Staff interface
 */
interface Staff {
    id: string;
    user_id?: string;
    uid?: string;
    email?: string;
    name?: string;
    role_id?: string;
    roleId?: string;
    role_name?: string;
    roleName?: string;
    added_at?: string;
    addedAt?: string;
    [key: string]: any;
}

/**
 * Role interface
 */
interface Role {
    id: string;
    name?: string;
    color?: string;
    permissions?: string[];
    [key: string]: any;
}

/**
 * EduStaff props
 */
export interface EduStaffProps {
    schoolId?: string;
    logAction?: (action: string, details: string) => Promise<void> | void;
}
export default function EduStaff({ schoolId, logAction }: EduStaffProps) {
    // Form State
    const [newStaffEmail, setNewStaffEmail] = useState<string>('');
    const [selectedStaffRole, setSelectedStaffRole] = useState<string>('');

    // Convex Queries
    const staffData = useQuery(api.edu.getStaffBySchool,
        schoolId ? { schoolId: schoolId as Id<"schools"> } : "skip"
    );

    const rolesData = useQuery(api.edu.getSchoolRolesBySchool,
        schoolId ? { schoolId: schoolId as Id<"schools"> } : "skip"
    );

    // Convex Mutations
    const addStaffMember = useMutation(api.edu.addStaffByEmail);
    const removeStaffMember = useMutation(api.edu.removeStaff);

    const staff: Staff[] = useMemo(() => {
        if (!staffData) return [];
        return staffData.map(d => ({
            id: d._id,
            ...d,
            uid: d.userId,
            roleId: d.roleId,
            roleName: d.roleName,
            addedAt: new Date(d.addedAt).toISOString()
        }));
    }, [staffData]);

    const roles: Role[] = useMemo(() => {
        if (!rolesData) return [];
        return rolesData.map(d => ({ id: d._id, ...d }));
    }, [rolesData]);

    // --- ACTIONS ---

    const handleAddStaff = async () => {
        if (!newStaffEmail || !selectedStaffRole || !schoolId) {
            return alert("Email and Role are required.");
        }

        try {
            const roleData = roles.find(r => r.id === selectedStaffRole);

            await addStaffMember({
                schoolId: schoolId as Id<"schools">,
                email: newStaffEmail,
                roleId: selectedStaffRole as Id<"schoolRoles">,
                roleName: roleData?.name || 'Unknown'
            });

            setNewStaffEmail('');
            alert(`Staff member added.`);
            if (logAction) await logAction('Add Staff', `Added ${newStaffEmail} as ${roleData?.name}`);
        } catch (e: any) {
            console.error("Add staff error:", e);
            alert(e.message || "Failed to add staff member.");
        }
    };

    const handleRemoveStaff = async (staffId: string, name: string) => {
        if(!confirm(`Remove ${name} from staff?`)) return;

        try {
            await removeStaffMember({ staffId: staffId as Id<"staff"> });

            if (logAction) await logAction('Remove Staff', `Removed ${name}`);
        } catch (e) {
            console.error("Remove staff error:", e);
            alert("Failed to remove staff member.");
        }
    };

    if (staffData === undefined) return <div className="p-10 text-center text-gray-500">Loading Staff...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Add Staff Form */}
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                    <UserPlus size={18} className="text-indigo-600"/> Add New Staff Member
                </h3>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Mail size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input
                            className="w-full pl-10 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white"
                            placeholder="User Email Address"
                            value={newStaffEmail}
                            onChange={e => setNewStaffEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Shield size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <select
                            className="w-full pl-10 p-2.5 border rounded-lg dark:bg-black/20 dark:border-gray-600 dark:text-white appearance-none"
                            value={selectedStaffRole}
                            onChange={e => setSelectedStaffRole(e.target.value)}
                        >
                            <option value="">Select Role...</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleAddStaff}
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md"
                    >
                        Add Staff
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    * The user must already have a SeshNx account. This will grant them <strong>EDUStaff</strong> access to this school.
                </p>
            </div>

            {/* Staff List */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f]">
                    <span className="font-bold text-sm dark:text-gray-200">Authorized Personnel</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                        {staff.length} Active
                    </span>
                </div>

                <div className="divide-y dark:divide-gray-700">
                    {staff.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No staff members found.</div>
                    ) : (
                        staff.map(s => (
                            <div key={s.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                                        {s.name ? s.name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <div className="font-bold dark:text-white text-sm">{s.name}</div>
                                        <div className="text-xs text-gray-500">{s.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold border dark:border-gray-600">
                                        {s.roleName}
                                    </span>
                                    {/* Remove button placeholder */}
                                    {/* <button onClick={() => handleRemoveStaff(s.id, s.name || 'this staff')} className="text-gray-400 hover:text-red-500"><X size={16}/></button> */}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

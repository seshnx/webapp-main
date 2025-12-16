import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, X, Mail } from 'lucide-react';
import { supabase } from '../../../config/supabase';

export default function EduStaff({ schoolId, logAction }) {
    const [staff, setStaff] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [selectedStaffRole, setSelectedStaffRole] = useState('');

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!schoolId || !supabase) return;
        
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Staff List
                const { data: staffData, error: staffError } = await supabase
                    .from('school_staff')
                    .select('*')
                    .eq('school_id', schoolId);
                
                if (staffError) throw staffError;
                
                setStaff((staffData || []).map(d => ({
                    id: d.id,
                    ...d,
                    uid: d.user_id,
                    roleId: d.role_id,
                    roleName: d.role_name,
                    addedAt: d.added_at
                })));

                // 2. Fetch Available Roles (for the dropdown)
                const { data: rolesData, error: rolesError } = await supabase
                    .from('school_roles')
                    .select('*')
                    .eq('school_id', schoolId);
                
                if (rolesError) throw rolesError;
                
                setRoles((rolesData || []).map(d => ({ id: d.id, ...d })));
            } catch (e) {
                console.error("Staff load failed:", e);
            }
            setLoading(false);
        };
        loadData();
    }, [schoolId]);

    // --- ACTIONS ---

    const handleAddStaff = async () => {
        if (!newStaffEmail || !selectedStaffRole || !supabase || !schoolId) {
            return alert("Email and Role are required.");
        }
        
        try {
            // 1. Find User by Email
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, email, first_name, last_name, account_types, school_id')
                .eq('email', newStaffEmail)
                .single();
            
            if (profileError || !profileData) {
                return alert("User not found. They must sign up for SeshNx first.");
            }

            const targetUserId = profileData.id;
            const roleData = roles.find(r => r.id === selectedStaffRole);

            // 2. Create Staff Entry in School
            const { data: newStaff, error: staffError } = await supabase
                .from('school_staff')
                .insert({
                    school_id: schoolId,
                    user_id: targetUserId,
                    email: profileData.email,
                    name: `${profileData.first_name} ${profileData.last_name}`,
                    role_id: selectedStaffRole,
                    role_name: roleData?.name || 'Unknown',
                    added_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (staffError) throw staffError;

            // 3. Update User's Global Profile (Grant 'EDUStaff' Access)
            // This allows them to see the EDU dashboards
            // Note: Role is determined by being listed in school staff collection
            const currentAccountTypes = profileData.account_types || [];
            const updatedAccountTypes = currentAccountTypes.includes('EDUStaff') 
                ? currentAccountTypes 
                : [...currentAccountTypes, 'EDUStaff'];
            
            await supabase
                .from('profiles')
                .update({
                    school_id: schoolId, // Link them to this school
                    account_types: updatedAccountTypes // Grant EDUStaff access
                })
                .eq('id', targetUserId);

            // 4. Update Local State
            setStaff(prev => [...prev, {
                id: newStaff.id,
                ...newStaff,
                uid: newStaff.user_id,
                roleId: newStaff.role_id,
                roleName: newStaff.role_name,
                addedAt: newStaff.added_at
            }]);
            setNewStaffEmail('');
            alert(`${profileData.first_name} added as ${roleData?.name}.`);
            if (logAction) await logAction('Add Staff', `Added ${profileData.email} as ${roleData?.name}`);

        } catch (e) {
            console.error("Add staff error:", e);
            alert("Failed to add staff member. Check console.");
        }
    };

    const handleRemoveStaff = async (staffId, name) => {
        // Note: This removes them from the school list, but doesn't strip the 'EDUStaff' role 
        // from their main profile automatically (safer to leave manual, or add strict logic).
        // For MVP, we just remove the school record.
        if(!confirm(`Remove ${name} from staff?`) || !supabase) return;
        
        try {
            // Get staff member info before deletion
            const staffMember = staff.find(s => s.id === staffId);
            
            // Remove from school_staff table
            const { error } = await supabase
                .from('school_staff')
                .delete()
                .eq('id', staffId)
                .eq('school_id', schoolId);
            
            if (error) throw error;
            
            // In a full implementation, you might want to remove 'schoolId' from their profile too.
            // For now, we just remove the school record.
            
            setStaff(prev => prev.filter(s => s.id !== staffId));
            if (logAction) await logAction('Remove Staff', `Removed ${name}`);
        } catch (e) {
            console.error("Remove staff error:", e);
            alert("Failed to remove staff member.");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Staff...</div>;

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
                                    {/* <button onClick={() => handleRemoveStaff(s.id, s.name)} className="text-gray-400 hover:text-red-500"><X size={16}/></button> */}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

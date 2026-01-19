import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Key, Save, Check } from 'lucide-react';
import { SCHOOL_PERMISSIONS } from '../../../config/constants';

export default function EduRoles({ schoolId, logAction }) {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal / Form State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roleForm, setRoleForm] = useState({ name: '', color: '#3b82f6', permissions: [] });
    const [saving, setSaving] = useState(false);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!schoolId || !supabase) return;
        
        const fetchRoles = async () => {
            setLoading(true);
            try {
                const { data: rolesData, error } = await supabase
                    .from('school_roles')
                    .select('*')
                    .eq('school_id', schoolId);
                
                if (error) throw error;
                
                setRoles((rolesData || []).map(r => ({ id: r.id, ...r })));
            } catch (e) {
                console.error("Error loading roles:", e);
            }
            setLoading(false);
        };
        fetchRoles();
    }, [schoolId]);

    // --- ACTIONS ---

    const handleCreateRole = async () => {
        if (!roleForm.name || !supabase || !schoolId) return;
        setSaving(true);
        try {
            const { data: newRole, error } = await supabase
                .from('school_roles')
                .insert({
                    school_id: schoolId,
                    name: roleForm.name,
                    color: roleForm.color || '#3b82f6',
                    permissions: roleForm.permissions || []
                })
                .select()
                .single();
            
            if (error) throw error;
            
            setRoles(prev => [...prev, { id: newRole.id, ...newRole }]);
            if (logAction) await logAction('Create Role', `Created role: ${roleForm.name}`);
            
            // Reset
            setRoleForm({ name: '', color: '#3b82f6', permissions: [] });
            setShowCreateModal(false);
        } catch (e) {
            console.error("Create role failed:", e);
            alert("Failed to create role.");
        }
        setSaving(false);
    };

    const handleDeleteRole = async (roleId, roleName) => {
        if (!confirm(`Delete role "${roleName}"? Staff assigned to this role will lose their permissions.`) || !supabase) return;
        try {
            await supabase
                .from('school_roles')
                .delete()
                .eq('id', roleId)
                .eq('school_id', schoolId);
            
            setRoles(prev => prev.filter(r => r.id !== roleId));
            if (logAction) await logAction('Delete Role', `Deleted role: ${roleName}`);
        } catch (e) {
            console.error("Delete role failed:", e);
        }
    };

    const handleUpdatePermissions = async (roleId, newPermissions) => {
        if (!supabase || !schoolId) return;
        
        // Optimistic update
        setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: newPermissions } : r));
        try {
            await supabase
                .from('school_roles')
                .update({ permissions: newPermissions })
                .eq('id', roleId)
                .eq('school_id', schoolId);
        } catch (e) {
            console.error("Update perms failed:", e);
            // Revert would go here in a full production app
        }
    };

    const toggleFormPermission = (permId) => {
        setRoleForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permId) 
                ? prev.permissions.filter(p => p !== permId) 
                : [...prev.permissions, permId]
        }));
    };

    const toggleExistingRolePermission = (role, permId) => {
        const currentPerms = role.permissions || [];
        const newPerms = currentPerms.includes(permId)
            ? currentPerms.filter(p => p !== permId)
            : [...currentPerms, permId];
        
        handleUpdatePermissions(role.id, newPerms);
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Roles...</div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <button 
                onClick={() => setShowCreateModal(true)} 
                className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-2"
            >
                <Plus size={20}/> Create New Role
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map(role => (
                    <div key={role.id} className="bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-xl shadow-sm flex flex-col overflow-hidden">
                        {/* Role Header */}
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-800/50">
                            <div>
                                <h4 className="font-bold dark:text-white flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: role.color}}></span> 
                                    {role.name}
                                </h4>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                    {role.permissions?.length || 0} Permissions
                                </span>
                            </div>
                            <button 
                                onClick={() => handleDeleteRole(role.id, role.name)} 
                                className="text-gray-400 hover:text-red-500 transition p-1"
                                title="Delete Role"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </div>

                        {/* Permissions List */}
                        <div className="p-2 flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                            <div className="space-y-0.5">
                                {SCHOOL_PERMISSIONS.map(perm => {
                                    const isActive = role.permissions?.includes(perm.id);
                                    return (
                                        <label 
                                            key={perm.id} 
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isActive ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                                                {isActive && <Check size={10} className="text-white" strokeWidth={4}/>}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={isActive} 
                                                onChange={() => toggleExistingRolePermission(role, perm.id)} 
                                            />
                                            <div className="flex-1">
                                                <div className={`text-xs font-bold ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {perm.label}
                                                </div>
                                                <div className="text-[10px] text-gray-400 leading-tight">
                                                    {perm.description}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] w-full max-w-lg rounded-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 shadow-2xl">
                        <h3 className="font-bold text-xl dark:text-white flex items-center gap-2">
                            <Key className="text-indigo-600"/> Create New Role
                        </h3>
                        
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Role Name</label>
                                <input 
                                    className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                                    placeholder="e.g. Academic Advisor" 
                                    value={roleForm.name} 
                                    onChange={e=>setRoleForm({...roleForm, name:e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Color</label>
                                <div className="flex items-center border rounded dark:border-gray-600 p-1 dark:bg-black/20">
                                    <input 
                                        type="color" 
                                        className="h-8 w-8 rounded cursor-pointer border-none bg-transparent" 
                                        value={roleForm.color} 
                                        onChange={e=>setRoleForm({...roleForm, color:e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t dark:border-gray-700 pt-4">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Assign Initial Permissions</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {SCHOOL_PERMISSIONS.map(perm => (
                                    <label 
                                        key={perm.id} 
                                        className={`flex items-start gap-2 p-2 border rounded cursor-pointer transition ${roleForm.permissions.includes(perm.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                    >
                                        <input 
                                            type="checkbox" 
                                            className="mt-1" 
                                            checked={roleForm.permissions.includes(perm.id)} 
                                            onChange={() => toggleFormPermission(perm.id)} 
                                        />
                                        <div>
                                            <div className="text-sm font-bold dark:text-gray-200">{perm.label}</div>
                                            <div className="text-[10px] text-gray-500 leading-tight">{perm.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded font-bold text-sm">Cancel</button>
                            <button onClick={handleCreateRole} disabled={saving} className="flex-1 bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50">
                                {saving ? 'Saving...' : 'Create Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

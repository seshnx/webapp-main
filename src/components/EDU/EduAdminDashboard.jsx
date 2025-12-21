import React, { useState, useEffect } from 'react';
import { 
    Shield, Plus, MapPin, School, Activity, Users, Briefcase, Clock 
} from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useSchool } from '../../contexts/SchoolContext';
import { exportToCSV } from '../../utils/dataExport';
import { SCHOOL_PERMISSIONS } from '../../config/constants';
import { useEduAuth } from '../../contexts/EduAuthContext';
import { isGlobalAdmin } from '../../utils/eduPermissions';

// --- MODULE IMPORTS ---
import EduOverview from './modules/EduOverview';
import EduRoster from './modules/EduRoster';
import EduHours from './modules/EduHours';
import EduCourses from './modules/EduCourses';
import EduLearningPaths from './modules/EduLearningPaths';
import EduStaff from './modules/EduStaff';
import EduRoles from './modules/EduRoles';
import EduResources from './modules/EduResources';
import EduAnnouncements from './modules/EduAnnouncements';
import EduPartners from './modules/EduPartners';
import EduEvaluations from './modules/EduEvaluations';
import EduCohorts from './modules/EduCohorts';
import EduAudit from './modules/EduAudit';
import EduSettings from './modules/EduSettings';

export default function EduAdminDashboard({ user: propUser, userData: propUserData, allowedTabs, staffTitle, currentView }) {
    // Use EduAuth hook if available, otherwise fall back to props (backward compatibility)
    let eduAuth;
    try {
        eduAuth = useEduAuth();
    } catch (e) {
        // Not wrapped in EduAuthProvider, use props
        eduAuth = null;
    }
    
    const user = eduAuth?.user || propUser;
    const userData = eduAuth?.userData || propUserData;
    
    const { schoolId: contextSchoolId } = useSchool();
    
    // Parse the view from the ID (e.g., 'edu-roster' -> 'roster'), default to 'overview'
    const activeTab = currentView ? currentView.replace('edu-', '') : (allowedTabs ? allowedTabs[0] : 'overview');

    const [activeSchoolId, setActiveSchoolId] = useState(contextSchoolId || null);
    const [activeSchoolData, setActiveSchoolData] = useState(null);
    const [allSchools, setAllSchools] = useState([]); 
    
    // School Creation State (Global Admin Only)
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSchoolForm, setNewSchoolForm] = useState({ name: '', address: '', primaryColor: '#4f46e5' });

    const isGlobalAdminUser = isGlobalAdmin(userData);

    // --- 1. FETCH SCHOOLS (Global Admin) ---
    useEffect(() => {
        if (isGlobalAdminUser && supabase) {
            const fetchSchools = async () => {
                try {
                    const { data: schools, error } = await supabase
                        .from('schools')
                        .select('*')
                        .order('name');
                    
                    if (error) throw error;
                    
                    const schoolsList = schools || [];
                    setAllSchools(schoolsList);
                    
                    // Default to first school if none selected
                    if (!activeSchoolId && !contextSchoolId && schoolsList.length > 0) {
                        setActiveSchoolId(schoolsList[0].id);
                    }
                } catch (e) {
                    console.error("Error fetching schools list:", e);
                }
            };
            fetchSchools();
        }
    }, [isGlobalAdminUser, activeSchoolId, contextSchoolId]);

    // --- 2. FETCH ACTIVE SCHOOL DATA ---
    useEffect(() => {
        if (!activeSchoolId || !supabase) return;

        const loadSchoolMeta = async () => {
            try {
                const { data: school, error } = await supabase
                    .from('schools')
                    .select('*')
                    .eq('id', activeSchoolId)
                    .single();
                
                if (error) throw error;
                
                if (school) {
                    setActiveSchoolData(school);
                }
            } catch (e) { 
                console.error("Error loading school meta:", e); 
            }
        };
        loadSchoolMeta();
    }, [activeSchoolId]);

    // --- HELPER: CENTRALIZED AUDIT LOGGER ---
    const logAction = async (action, details) => {
        if (!activeSchoolId || !supabase) return;
        try {
            const userId = user?.id || user?.uid;
            await supabase
                .from('audit_logs')
                .insert({
                    school_id: activeSchoolId,
                    action,
                    details,
                    admin_id: userId,
                    admin_name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
                    created_at: new Date().toISOString()
                });
        } catch (e) {
            console.error("Failed to log action:", e);
        }
    };

    // --- ACTION: CREATE NEW SCHOOL ---
    const handleCreateSchool = async () => {
        if (!newSchoolForm.name || !supabase) return;
        
        // Double-check permissions before attempting to create
        if (!isGlobalAdminUser) {
            alert("Only SeshNx Platform Administrators can create new schools. Please contact a platform administrator.");
            setShowCreateModal(false);
            return;
        }
        
        try {
            const { data: newSchool, error: schoolError } = await supabase
                .from('schools')
                .insert({ 
                    name: newSchoolForm.name,
                    address: newSchoolForm.address || null,
                    primary_color: newSchoolForm.primaryColor || '#4f46e5',
                    required_hours: 100,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (schoolError) throw schoolError;
            
            if (!newSchool) {
                throw new Error('School creation failed - no data returned');
            }
            
            // Create Default Admin Role for new school
            const { error: roleError } = await supabase
                .from('school_roles')
                .insert({ 
                    school_id: newSchool.id,
                    name: 'Admin', 
                    color: '#dc2626', 
                    permissions: SCHOOL_PERMISSIONS.map(p => p.id) 
                });

            if (roleError) {
                console.error("Error creating default admin role:", roleError);
                // Continue anyway - role can be created later
            }

            setAllSchools(prev => [...prev, newSchool]);
            setActiveSchoolId(newSchool.id);
            setShowCreateModal(false);
            setNewSchoolForm({ name: '', address: '', primaryColor: '#4f46e5' });
            
            // Log is implied since we switch to the new school immediately
        } catch (e) {
            console.error("Error creating school:", e);
            if (e.message?.includes('permission') || e.code === 'PGRST301') {
                alert("Permission denied. Only SeshNx Platform Administrators can create new schools.");
            } else {
                alert("Failed to create school. Please try again.");
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            
            {/* --- SCHOOL IDENTITY HEADER --- */}
            <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-600 shrink-0 p-2 z-10">
                    {activeSchoolData?.logoURL ? (
                        <img src={activeSchoolData.logoURL} className="h-full w-full object-contain" alt="School Logo" />
                    ) : (
                        <School size={40} className="text-gray-400"/>
                    )}
                </div>
                
                <div className="flex-1 text-center md:text-left z-10">
                    <h1 className="text-3xl font-extrabold dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
                        {activeSchoolData?.name || 'Select School'}
                        {isGlobalAdminUser && !staffTitle && (
                            <div className="relative group">
                                <select 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    value={activeSchoolId || ''}
                                    onChange={(e) => setActiveSchoolId(e.target.value)}
                                >
                                    {allSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <div className="bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm font-bold p-1 px-2 flex items-center gap-1 pointer-events-none group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition">
                                    <span>Switch</span> <Shield size={10}/>
                                </div>
                            </div>
                        )}
                    </h1>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                        {staffTitle ? (
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide">
                                {staffTitle} Dashboard
                            </span>
                        ) : (
                            <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide">
                                Global Admin Mode
                            </span>
                        )}
                        {activeSchoolData?.address && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1"><MapPin size={12}/> {activeSchoolData.address}</span>
                            </>
                        )}
                    </div>
                </div>

                {isGlobalAdminUser && (
                    <div className="z-10">
                        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-md">
                            <Plus size={16}/> New School
                        </button>
                    </div>
                )}

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            {/* --- MODULE CONTENT AREA --- */}
            {/* Note: The Sidebar handles navigation, this component acts as the view controller */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl border dark:border-gray-700 min-h-[400px] p-4">
                {!activeSchoolId ? (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                        <School size={48} className="mb-4 opacity-20"/>
                        <p>Please select or create a school to manage.</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && <EduOverview schoolId={activeSchoolId} schoolData={activeSchoolData} />}
                        
                        {activeTab === 'roster' && <EduRoster schoolId={activeSchoolId} logAction={logAction} />}
                        
                        {activeTab === 'hours' && <EduHours schoolId={activeSchoolId} />}
                        
                        {activeTab === 'courses' && <EduCourses schoolId={activeSchoolId} logAction={logAction} />}
                        
                        {activeTab === 'learning-paths' && <EduLearningPaths schoolId={activeSchoolId} logAction={logAction} />}
                        
                        {activeTab === 'instructors' && <EduStaff schoolId={activeSchoolId} logAction={logAction} />}
                        
                        {activeTab === 'roles' && <EduRoles schoolId={activeSchoolId} logAction={logAction} />}
                        
                        {activeTab === 'resources' && <EduResources schoolId={activeSchoolId} logAction={logAction} />}
                        
                        {activeTab === 'news' && <EduAnnouncements schoolId={activeSchoolId} logAction={logAction} user={user} userData={userData} />}
                        
                        {activeTab === 'partners' && <EduPartners schoolId={activeSchoolId} logAction={logAction} />}
                        
                        {activeTab === 'evaluations' && <EduEvaluations schoolId={activeSchoolId} logAction={logAction} graderName={userData.displayName} />}
                        
                        {activeTab === 'cohorts' && <EduCohorts schoolId={activeSchoolId} logAction={logAction} />}
                        
                        {activeTab === 'audit' && <EduAudit schoolId={activeSchoolId} />}
                        
                        {activeTab === 'settings' && (
                            <EduSettings 
                                schoolId={activeSchoolId} 
                                initialData={activeSchoolData} 
                                logAction={logAction} 
                                refreshMeta={(newData) => setActiveSchoolData(prev => ({...prev, ...newData}))} 
                            />
                        )}
                    </>
                )}
            </div>

            {/* --- GLOBAL MODALS --- */}
            
            {/* Create School Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#2c2e36] w-full max-w-md rounded-xl p-6 space-y-4 animate-in zoom-in-95">
                        <h3 className="font-bold text-xl dark:text-white">Create School</h3>
                        <input 
                            className="w-full p-2 border rounded dark:bg-black/20 dark:border-gray-600 dark:text-white" 
                            placeholder="School Name" 
                            value={newSchoolForm.name} 
                            onChange={e => setNewSchoolForm({...newSchoolForm, name: e.target.value})}
                        />
                        <button onClick={handleCreateSchool} className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">Create</button>
                        <button onClick={() => setShowCreateModal(false)} className="w-full text-gray-500 text-sm hover:underline">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import {
    Shield, Plus, MapPin, School, Activity, Users, Briefcase, Clock
} from 'lucide-react';
import { useSchool } from '@/contexts/SchoolContext';
import { exportToCSV } from '@/utils/dataExport';
import { SCHOOL_PERMISSIONS } from '@/config/constants';
import { useEduAuth } from '@/contexts/EduAuthContext';
import { isGlobalAdmin } from '@/utils/eduPermissions';
import { useOrganization } from '@clerk/react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/api';
import type { Id } from '@convex/dataModel';

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

/**
 * School data interface
 */
interface SchoolData {
    id: string;
    name?: string;
    logoURL?: string;
    address?: string;
    primaryColor?: string;
    requiredHours?: number;
    [key: string]: any;
}

/**
 * New school form interface
 */
interface NewSchoolForm {
    name: string;
    address: string;
    primaryColor: string;
}

/**
 * EduAdminDashboard props
 */
export interface EduAdminDashboardProps {
    user?: any;
    userData?: any;
    allowedTabs?: string[];
    staffTitle?: string;
    currentView?: string;
}

export default function EduAdminDashboard({ user: propUser, userData: propUserData, allowedTabs, staffTitle, currentView }: EduAdminDashboardProps) {
    const { organization } = useOrganization();
    const createConvexSchool = useMutation(api.schools.create);
    const [isLinkingOrg, setIsLinkingOrg] = useState(false);

    // Use EduAuth hook (returns null if not wrapped in EduAuthProvider)
    const eduAuth = useEduAuth();

    const user = eduAuth?.user || propUser;
    const userData = eduAuth?.userData || propUserData;

    const { schoolId: contextSchoolId, schoolData: contextSchoolData, loading: contextLoading } = useSchool();

    // Parse the view from the ID (e.g., 'edu-roster' -> 'roster'), default to 'overview'
    const activeTab = currentView ? currentView.replace('edu-', '') : (allowedTabs ? allowedTabs[0] : 'overview');

    const [activeSchoolId, setActiveSchoolId] = useState<string | null | undefined>(contextSchoolId);
    
    // Convex Queries
    const schoolsData = useQuery(api.edu.getSchools);
    const logActionMutation = useMutation(api.edu.createAuditLog);

    // Sync with context school ID when it loads
    useEffect(() => {
        if (contextSchoolId !== undefined) {
            setActiveSchoolId(contextSchoolId);
        }
    }, [contextSchoolId]);

    // School Creation State (Global Admin Only)
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [newSchoolForm, setNewSchoolForm] = useState<NewSchoolForm>({ name: '', address: '', primaryColor: '#4f46e5' });

    const isGlobalAdminUser = isGlobalAdmin(userData);

    const [activeSchoolDataOverride, setActiveSchoolDataOverride] = useState<any>(null);

    const activeSchoolData = useMemo(() => {
        if (activeSchoolDataOverride) return activeSchoolDataOverride;
        if (contextSchoolId === activeSchoolId) return contextSchoolData;
        return schoolsData?.find(s => s._id === activeSchoolId);
    }, [activeSchoolId, contextSchoolId, contextSchoolData, schoolsData, activeSchoolDataOverride]);

    const allSchools = useMemo(() => schoolsData || [], [schoolsData]);

    // --- HELPER: CENTRALIZED AUDIT LOGGER ---
    const logAction = async (action: string, details: string) => {
        if (!activeSchoolId) return;
        try {
            await logActionMutation({
                userId: userData?._id as Id<"users">,
                action,
                entityType: 'school',
                entityId: activeSchoolId,
                changes: { details }
            });
        } catch (e) {
            console.error("Failed to log action:", e);
        }
    };

    // --- ACTION: CREATE NEW SCHOOL ---
    const handleLinkOrganization = async () => {
        if (!organization || !user?.id) return;
        setIsLinkingOrg(true);
        try {
            const newSchoolId = await createConvexSchool({
                clerkId: user.id,
                name: organization.name,
                slug: organization.slug || organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: 'Auto-generated school from Clerk Organization',
                clerkOrgId: organization.id
            });
            // Update active state to use Convex ID
            setActiveSchoolId(newSchoolId as string);
            alert("School successfully created and linked to your organization in Convex!");
        } catch (e) {
            console.error("Error creating Convex school:", e);
            alert("Failed to create Convex school. Please check the console.");
        } finally {
            setIsLinkingOrg(false);
        }
    };

    const handleCreateSchool = async () => {
        if (!newSchoolForm.name) return;

        // Double-check permissions before attempting to create
        if (!isGlobalAdminUser) {
            alert("Only SeshNx Platform Administrators can create new schools.");
            setShowCreateModal(false);
            return;
        }

        try {
            const result = await createConvexSchool({
                clerkId: user.id || user.uid,
                name: newSchoolForm.name,
                slug: newSchoolForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                address: newSchoolForm.address || '',
                clerkOrgId: `manual-${Date.now()}` // Fallback for manual creation
            });

            setActiveSchoolId(result as string);
            setShowCreateModal(false);
            setNewSchoolForm({ name: '', address: '', primaryColor: '#4f46e5' });
        } catch (e: any) {
            console.error("Error creating school:", e);
            alert("Failed to create school. Please try again.");
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
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setActiveSchoolId(e.target.value)}
                                >
                                    {allSchools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
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
                {activeSchoolId === undefined ? (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                        <School size={48} className="mb-4 opacity-20 animate-pulse"/>
                        <p className="animate-pulse">Loading school data...</p>
                    </div>
                ) : !activeSchoolId ? (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                        <School size={48} className="mb-4 opacity-20"/>
                        <p className="mb-4 text-center px-6">Please select or create a school to manage.<br/>No school is currently linked to your Clerk Organization.</p>
                        {organization && (
                            <button
                                onClick={handleLinkOrganization}
                                disabled={isLinkingOrg}
                                className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {isLinkingOrg ? 'Linking...' : `Link ${organization.name} to a New School`}
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {(activeTab === 'overview' || activeTab === 'edu-overview') && <EduOverview schoolId={activeSchoolId} schoolData={activeSchoolData} />}

                        {(activeTab === 'roster' || activeTab === 'edu-roster') && <EduRoster schoolId={activeSchoolId} logAction={logAction} />}

                        {(activeTab === 'hours' || activeTab === 'edu-hours') && <EduHours schoolId={activeSchoolId} />}

                        {(activeTab === 'courses' || activeTab === 'edu-courses') && <EduCourses schoolId={activeSchoolId} logAction={logAction} />}

                        {(activeTab === 'course-builder' || activeTab === 'edu-course-builder') && <EduCourseBuilder schoolId={activeSchoolId} logAction={logAction} />}

                        {(activeTab === 'learning-paths' || activeTab === 'edu-learning-paths') && <EduLearningPaths schoolId={activeSchoolId} logAction={logAction} />}

                        {(activeTab === 'instructors' || activeTab === 'staff' || activeTab === 'edu-staff') && <EduStaff schoolId={activeSchoolId} logAction={logAction} />}

                        {(activeTab === 'roles' || activeTab === 'edu-roles') && <EduRoles schoolId={activeSchoolId} logAction={logAction} />}

                        {(activeTab === 'resources' || activeTab === 'edu-resources') && <EduResources schoolId={activeSchoolId} logAction={logAction} />}

                        {(activeTab === 'news' || activeTab === 'announcements' || activeTab === 'edu-announcements') && <EduAnnouncements schoolId={activeSchoolId} logAction={logAction} user={user} userData={userData} />}

                        {(activeTab === 'partners' || activeTab === 'edu-partners') && <EduPartners schoolId={activeSchoolId} logAction={logAction} />}

                        {(activeTab === 'evaluations' || activeTab === 'edu-evaluations') && <EduEvaluations schoolId={activeSchoolId} logAction={logAction} graderName={userData?.displayName} />}

                        {(activeTab === 'cohorts' || activeTab === 'edu-cohorts') && <EduCohorts schoolId={activeSchoolId} logAction={logAction} />}

                        {(activeTab === 'audit' || activeTab === 'edu-audit') && <EduAudit schoolId={activeSchoolId} />}

                        {(activeTab === 'settings' || activeTab === 'edu-settings') && (
                            <EduSettings
                                schoolId={activeSchoolId}
                                initialData={activeSchoolData}
                                logAction={logAction}
                                refreshMeta={(newData) => setActiveSchoolDataOverride((prev: any) => ({...(prev || activeSchoolData), ...newData}))}
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

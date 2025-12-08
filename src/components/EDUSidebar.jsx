import React from 'react';
import { 
    Users, Clock, UserPlus, Key, Lock, Megaphone, 
    Briefcase, GraduationCap, Users as CohortIcon, 
    Activity, Settings, LogOut, ArrowLeft, LayoutDashboard, BookOpen
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useSchool } from '../contexts/SchoolContext';

export default function EDUSidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, eduRole = 'ADMIN', myPermissions = [] }) {

    const { eduRole: contextRole, myPermissions: contextPerms } = useSchool() || {};
    const effectiveRole = (eduRole || contextRole || 'ADMIN').toUpperCase();
    const effectivePermissions = (myPermissions && myPermissions.length > 0) ? myPermissions : (contextPerms || []);
    
    const adminLinks = [
        { id: 'edu-overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'edu-roster', icon: Users, label: 'Student Roster', required: 'VIEW_ROSTER' },
        { id: 'edu-hours', icon: Clock, label: 'Internship Hours', required: 'APPROVE_HOURS' },
        { id: 'edu-instructors', icon: UserPlus, label: 'Staff Management', required: 'MANAGE_STAFF' },
        { id: 'edu-roles', icon: Key, label: 'Role Permissions', required: 'MANAGE_ROLES' },
        { id: 'edu-resources', icon: Lock, label: 'Resource Rules', required: 'MANAGE_RESOURCES' },
        { id: 'edu-news', icon: Megaphone, label: 'Announcements' },
        { id: 'edu-partners', icon: Briefcase, label: 'Partnerships', required: 'MANAGE_PARTNERS' },
        { id: 'edu-evaluations', icon: GraduationCap, label: 'Grading & Evals', required: 'GRADE' },
        { id: 'edu-cohorts', icon: CohortIcon, label: 'Cohorts', required: 'VIEW_ROSTER' },
        { id: 'edu-audit', icon: Activity, label: 'Audit Logs', required: 'VIEW_AUDIT' },
        { id: 'edu-settings', icon: Settings, label: 'School Settings', required: 'MANAGE_SETTINGS' },
    ];

    const studentLinks = [
        { id: 'edu-overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'edu-hours', icon: Clock, label: 'My Hours' },
        { id: 'edu-news', icon: Megaphone, label: 'Announcements' },
        { id: 'edu-resources', icon: BookOpen, label: 'Resources' },
    ];

    const internLinks = [
        { id: 'edu-overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'edu-hours', icon: Clock, label: 'Internship Hours' },
        { id: 'edu-news', icon: Megaphone, label: 'Announcements' },
        { id: 'edu-resources', icon: BookOpen, label: 'Resources' },
    ];

    const isStaffMode = ['ADMIN', 'INSTRUCTOR'].includes(effectiveRole);
    const isInternMode = effectiveRole === 'INTERN';
    const filteredAdminLinks = (effectivePermissions || []).includes('ALL')
        ? adminLinks
        : adminLinks.filter(link => !link.required || effectivePermissions.includes(link.required));

    const navLinks = isStaffMode 
        ? filteredAdminLinks 
        : isInternMode 
            ? internLinks 
            : studentLinks;

    const handleNavigation = (id) => {
        setActiveTab(id);
        if (setSidebarOpen) setSidebarOpen(false);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Header / Back to Studio */}
            <div className="p-4 border-b dark:border-gray-700">
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-blue transition mb-4"
                >
                    <ArrowLeft size={14}/> Back to Studio
                </button>
                <h2 className="text-lg font-extrabold dark:text-white tracking-tight px-1">
                    {isStaffMode ? 'EDU Control' : isInternMode ? 'Internship Portal' : 'Student Portal'}
                </h2>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-4 overflow-y-auto custom-scrollbar px-3 space-y-1">
                {navLinks.map(link => (
                    <button
                        key={link.id}
                        onClick={() => handleNavigation(link.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${activeTab === link.id 
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}
                        `}
                    >
                        <link.icon size={18} />
                        {link.label}
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-[#23262f]">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        {isStaffMode ? 'EA' : isInternMode ? 'IN' : 'ST'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold dark:text-white truncate">
                            {isStaffMode ? 'EDU Staff' : isInternMode ? 'Intern' : 'Student'}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                            {isStaffMode ? 'School Management' : isInternMode ? 'Hours Tracking' : 'Learning Access'}
                        </p>
                    </div>
                    <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500">
                        <LogOut size={16}/>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:flex w-64 bg-white dark:bg-[#1f2128] border-r border-gray-200 dark:border-gray-700 flex-col h-full shrink-0 relative z-30">
                <SidebarContent />
            </aside>

            {/* MOBILE OVERLAY */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity duration-300 lg:hidden ${
                sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`} 
                onClick={() => setSidebarOpen(false)}
            />

            {/* MOBILE DRAWER */}
            <aside 
                className={`fixed inset-y-0 left-0 z-[10000] w-72 bg-white dark:bg-[#1f2128] shadow-2xl transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col h-full lg:hidden ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <SidebarContent />
            </aside>
        </>
    );
}

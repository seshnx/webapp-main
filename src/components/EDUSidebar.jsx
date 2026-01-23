import React, { useState, useEffect } from 'react';
import {
    Users, Clock, UserPlus, Key, Lock, Megaphone,
    Briefcase, GraduationCap, Users as CohortIcon,
    Activity, Settings, LogOut, ArrowLeft, LayoutDashboard,
    BookOpen, Target
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
export default function EDUSidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, isGlobalAdmin }) {
    const clerk = useClerk();
    const [isMobile, setIsMobile] = useState(false);

    // Track mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Define the specific navigation items for the EDU Panel
    const adminLinks = [
        { id: 'edu-overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'edu-roster', icon: Users, label: 'Student Roster' },
        { id: 'edu-hours', icon: Clock, label: 'Internship Hours' },
        { id: 'edu-courses', icon: BookOpen, label: 'Courses' },
        { id: 'edu-learning-paths', icon: Target, label: 'Learning Paths' },
        { id: 'edu-instructors', icon: UserPlus, label: 'Staff Management' },
        { id: 'edu-roles', icon: Key, label: 'Role Permissions' },
        { id: 'edu-resources', icon: Lock, label: 'Resource Rules' },
        { id: 'edu-news', icon: Megaphone, label: 'Announcements' },
        { id: 'edu-partners', icon: Briefcase, label: 'Partnerships' },
        { id: 'edu-evaluations', icon: GraduationCap, label: 'Grading & Evals' },
        { id: 'edu-cohorts', icon: CohortIcon, label: 'Cohorts' },
        { id: 'edu-audit', icon: Activity, label: 'Audit Logs' },
        { id: 'edu-settings', icon: Settings, label: 'School Settings' },
    ];

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
                    EDU Control
                </h2>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-4 overflow-y-auto custom-scrollbar px-3 space-y-1">
                {adminLinks.map(link => (
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
                        EA
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold dark:text-white truncate">EDU Admin</p>
                        <p className="text-[10px] text-gray-500 truncate">School Management</p>
                    </div>
                    <button onClick={async () => {
                        try {
                            console.log('=== EDU SIDEBAR LOGOUT ===');

                            // Use Clerk to sign out
                            if (clerk) {
                                await clerk.signOut();
                                console.log('✅ Clerk signOut successful');
                            }

                            console.log('✅ Logout complete, redirecting to home');

                            // Navigate to home after logout
                            window.location.href = '/';
                        } catch (err) {
                            console.error("Logout failed:", err);
                            window.location.href = '/';
                        }
                    }} className="text-gray-400 hover:text-red-500">
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
            {sidebarOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity duration-300 opacity-100 pointer-events-auto" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

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

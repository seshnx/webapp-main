import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck, 
  Settings, 
  LogOut, 
  X,
  History,
  Layers,
  Map,
  Handshake,
  ShieldCheck,
  Briefcase,
  Clock,
  UserCheck,
  Building
} from 'lucide-react';
import { useClerk, OrganizationSwitcher } from '@clerk/react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserData } from '@/types';
import { detectContextFromPath } from '@/utils/contextDetection';

// Import icons that might be missing from lucide-react if using older version
// Bell is often used for announcements if Announce is not available
import { Bell as AnnounceIcon } from 'lucide-react';

// Navigation item interface
export interface NavigationItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  highlight?: boolean;
}

// Navigation group interface
export interface NavigationGroup {
  label: string;
  icon: React.ComponentType<any>;
  items: NavigationItem[];
}

// Sidebar props interface
export interface SidebarProps {
  userData?: UserData | null;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
  handleLogout?: () => Promise<void>;
}

export function EduSidebar({
  userData,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  handleLogout
}: SidebarProps) {
  const clerk = useClerk();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Detect role
  const activeRole = userData?.activeRole || userData?.accountTypes?.[0] || 'Student';
  const isStudent = activeRole === 'Student';
  const isIntern = activeRole === 'Intern';
  const isStaff = activeRole === 'EDUStaff';
  const isAdmin = activeRole === 'EDUAdmin';
  const isManagement = isStaff || isAdmin;

  // Track mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < window.screen.width * 0.65);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Organized navigation groups for EDU
  const navGroups: NavigationGroup[] = useMemo(() => {
    const groups: NavigationGroup[] = [];

    // Dashboard / Overview
    groups.push({
      label: 'Academic',
      icon: GraduationCap,
      items: [
        { 
          id: isManagement ? 'edu-overview' : (isIntern ? 'edu-intern' : 'edu-student'), 
          icon: LayoutDashboard, 
          label: 'Overview' 
        },
        { id: 'edu-courses', icon: BookOpen, label: isManagement ? 'Courses' : 'My Courses' },
        ...(isManagement ? [
          { id: 'edu-roster', icon: Users, label: 'Student Roster' },
          { id: 'edu-cohorts', icon: Layers, label: 'Cohorts' }
        ] : [])
      ]
    });

    // Content & Resources
    groups.push({
      label: 'Learning',
      icon: FileText,
      items: [
        { id: 'edu-announcements', icon: AnnounceIcon, label: 'Announcements' },
        { id: 'edu-learning-paths', icon: Map, label: 'Learning Paths' },
        { id: 'edu-resources', icon: FileText, label: 'Resources' },
        ...(isManagement ? [
          { id: 'edu-course-builder', icon: ClipboardCheck, label: 'Course Builder' }
        ] : [])
      ]
    });

    // Administrative (Staff/Admin only)
    if (isManagement) {
      groups.push({
        label: 'Administration',
        icon: ShieldCheck,
        items: [
          { id: 'edu-staff', icon: UserCheck, label: 'Staff Management' },
          { id: 'edu-roles', icon: ShieldCheck, label: 'Role Permissions' },
          { id: 'edu-partners', icon: Handshake, label: 'Partners' },
          { id: 'edu-audit', icon: History, label: 'Audit Logs' }
        ]
      });
    }

    // Special Modules (Interns / Staff)
    if (isIntern || isManagement) {
      groups.push({
        label: 'Programs',
        icon: Briefcase,
        items: [
          { id: 'edu-hours', icon: Clock, label: isIntern ? 'My Hours' : 'Hours Tracking' },
          { id: 'edu-evaluations', icon: ClipboardCheck, label: 'Evaluations' }
        ]
      });
    }

    // Settings
    groups.push({
      label: 'System',
      icon: Settings,
      items: [
        { id: 'edu-settings', icon: Settings, label: 'EDU Settings' }
      ]
    });

    return groups;
  }, [activeRole, isManagement, isIntern]);

  const onLogout = handleLogout || (async () => {
    try {
      if (clerk) await clerk.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = '/';
    }
  });

  const handleNavigation = (id: string) => {
    const path = `/${id}`;
    setActiveTab?.(id);
    navigate(path);

    if (setSidebarOpen && isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden xl:flex w-64 bg-white dark:bg-[#1f2128] border-r border-gray-200 dark:border-gray-700 flex-col h-full shrink-0 relative z-[60]">
        <EduSidebarContent 
          navGroups={navGroups}
          activeTab={activeTab}
          handleNavigation={handleNavigation}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-all duration-300 ease-out opacity-100 pointer-events-auto"
          onClick={() => setSidebarOpen?.(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[10000] w-72 bg-white dark:bg-[#1f2128] shadow-2xl transform transition-all duration-300 ease-out flex flex-col h-full xl:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <EduSidebarContent 
          isMobile={true}
          setSidebarOpen={setSidebarOpen}
          navGroups={navGroups}
          activeTab={activeTab}
          handleNavigation={handleNavigation}
          onLogout={onLogout}
        />
      </aside>
    </>
  );
}

const EduSidebarContent = ({ 
  isMobile = false, 
  setSidebarOpen, 
  navGroups, 
  activeTab, 
  handleNavigation, 
  onLogout 
}: any) => (
  <>
    <div className="flex-1 py-4 overflow-y-auto scrollbar-hide">
      <div className="px-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-600 rounded-lg text-white">
            <GraduationCap size={20} />
          </div>
          <span className="font-bold text-lg dark:text-white">SeshNx EDU</span>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen?.(false)} className="p-2 text-gray-500">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Organization Switcher (School Selection) */}
      <div className="px-4 mb-6">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl">
          <div className="text-[10px] font-bold text-purple-500 mb-2 uppercase tracking-wider flex items-center justify-between px-1">
            <span>School / Org</span>
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
          </div>
          <OrganizationSwitcher 
            hidePersonal={false}
            appearance={{
              elements: {
                organizationSwitcherTrigger: "w-full justify-between bg-white dark:bg-[#1a1d21] border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 text-sm transition-all hover:border-purple-300",
                organizationPreviewTextContainer: "dark:text-white font-medium",
                organizationPreviewMainIdentifier: "dark:text-white"
              }
            }}
          />
        </div>
      </div>

      <nav className="space-y-6 px-2">
        {navGroups.map((group: any) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.label} className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                <GroupIcon size={14} className="text-gray-400 dark:text-gray-500" />
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {group.label}
                </span>
              </div>

              <div className="space-y-1">
                {group.items.map((link: any) => {
                  const ItemIcon = link.icon;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavigation(link.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                      ${activeTab === link.id
                          ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}
                      `}
                    >
                      <ItemIcon size={18} />
                      {link.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>

    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2128] pb-20">
      <button onClick={onLogout} className="flex items-center gap-2 text-red-500 text-sm font-medium hover:opacity-80 px-2 w-full py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
        <LogOut size={16} /> Logout
      </button>
    </div>
  </>
);

export default EduSidebar;

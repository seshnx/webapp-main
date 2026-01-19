import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Calendar, MessageCircle, Settings, Sliders, LogOut, ShoppingBag, CreditCard, X, ShieldCheck, Wrench, Briefcase, GraduationCap, Home, Briefcase as BriefcaseIcon, Zap } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useSchool } from '../contexts/SchoolContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Sidebar({ userData, activeTab, setActiveTab, sidebarOpen, setSidebarOpen, handleLogout }) {
  // Always call hook (React rules), but handle case where context might not be ready
  const schoolContext = useSchool();
  const clerk = useClerk();
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  
  // Safely extract values with fallbacks
  const isStudent = schoolContext?.isStudent ?? (userData?.accountTypes?.includes('Student') || false);
  const isStaff = schoolContext?.isStaff ?? (userData?.accountTypes?.includes('EDUStaff') || userData?.accountTypes?.includes('EDUAdmin') || false);

  // Track mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- EDU Panel Logic ---
  // Now checks for Students OR Staff (EDUStaff/EDUAdmins)
  const isIntern = userData?.accountTypes?.includes('Intern');
  
  // Determine EDU route and label
  let eduRoute = null;
  let eduLabel = 'EDU Panel';
  if (isStudent || isIntern || isStaff || userData?.accountTypes?.includes('student')) {
    if (isIntern) {
      eduRoute = 'edu-intern';
      eduLabel = 'Internship';
    } else if (isStudent) {
      eduRoute = 'edu-student';
      eduLabel = 'Student';
    } else {
      eduRoute = 'edu-overview';
      eduLabel = 'School Admin';
    }
  }

  // Check if user has business features (Studio, Label, Agent, Talent, Producer, etc.)
  const hasBusinessFeatures = userData?.accountTypes?.some(t => 
    ['Studio', 'Label', 'Agent', 'Talent', 'Producer', 'Engineer'].includes(t)
  );

  // Organized navigation groups
  const navGroups = [
    {
      label: 'Primary',
      icon: Home,
      items: [
        { id: 'dashboard', icon: Home, label: t('dashboard') },
        { id: 'feed', icon: MessageSquare, label: t('socialNx') },
        { id: 'messages', icon: MessageCircle, label: t('messages') },
      ]
    },
    {
      label: 'Work',
      icon: BriefcaseIcon,
      items: [
        { id: 'bookings', icon: Calendar, label: t('bookings') },
        { id: 'marketplace', icon: ShoppingBag, label: t('marketplace') },
        { id: 'tech', icon: Wrench, label: t('techServices') },
      ]
    },
    {
      label: 'Business',
      icon: Briefcase,
      items: [
        ...(hasBusinessFeatures ? [{ id: 'business-center', icon: Briefcase, label: t('businessCenter') }] : []),
        { id: 'profile', icon: Settings, label: t('profile') },
        { id: 'payments', icon: CreditCard, label: t('billing') },
      ]
    },
    ...(eduRoute ? [{
      label: 'Education',
      icon: GraduationCap,
      items: [
        { id: eduRoute, icon: GraduationCap, label: eduLabel, highlight: true }
      ]
    }] : [])
  ];

  const onLogout = handleLogout || (async () => {
    try {
      console.log('=== SIDEBAR LOGOUT ===');

      // Use Clerk to sign out
      if (clerk) {
        await clerk.signOut();
        console.log('✅ Clerk signOut successful');
      }

      // Also clear Supabase session if it exists (for migration)
      if (supabase) {
        await supabase.auth.signOut();
      }

      console.log('✅ Logout complete, redirecting to home');

      // Navigate to home after logout
      window.location.href = '/';
    } catch (err) {
      console.error("Logout failed:", err);
      // Force redirect even on error
      window.location.href = '/';
    }
  });

  const handleNavigation = (id) => {
    setActiveTab(id);
    // Always close sidebar after navigation (especially on mobile)
    // Check if we're on mobile screen size
    const isMobile = window.innerWidth < 1024;
    if (setSidebarOpen && (isMobile || sidebarOpen)) {
      setSidebarOpen(false);
    }
  };

  const SidebarContent = ({ isMobile }) => (
    <>
      <div className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        {isMobile && (
            <div className="px-4 mb-6 flex items-center justify-between">
                <div className="text-xs font-bold text-gray-400 uppercase">Menu</div>
                <button 
                    onClick={() => setSidebarOpen(false)} 
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    aria-label="Close menu"
                >
                    <X size={20} aria-hidden="true" />
                </button>
            </div>
        )}
        
        <nav className="space-y-6 px-2">
            {navGroups.map((group, groupIndex) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.label} className="space-y-1">
                  {/* Group Header */}
                  <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                    <GroupIcon size={14} className="text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                  
                  {/* Group Items */}
                  <div className="space-y-1">
                    {group.items.map(link => {
                      const ItemIcon = link.icon;
                      return (
                        <button
                          key={link.id}
                          onClick={() => handleNavigation(link.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                          ${activeTab === link.id 
                              ? 'bg-blue-50 text-brand-blue dark:bg-blue-900/20 dark:text-blue-400' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}
                          ${link.highlight ? 'text-amber-600 dark:text-amber-500' : ''}
                          `}
                        >
                          <ItemIcon size={18} className={link.highlight ? 'text-amber-600 dark:text-amber-500' : ''} />
                          {link.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </nav>

        <div className="mt-auto px-2 pt-4 space-y-1 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
              <ShieldCheck size={14} className="text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Resources
              </span>
            </div>
            <button onClick={() => handleNavigation('legal')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition ${activeTab === 'legal' ? 'bg-blue-50 text-brand-blue dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <ShieldCheck size={18} />
                Legal Center
            </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-[#1f2128]">
        <button onClick={onLogout} className="flex items-center gap-2 text-red-500 text-sm font-medium hover:opacity-80 px-2 w-full py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
          <LogOut size={16} /> {t('logout')}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#1f2128] border-r border-gray-200 dark:border-gray-700 flex-col h-full shrink-0 relative z-30">
         <SidebarContent isMobile={false} />
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-all duration-300 ease-out opacity-100 pointer-events-auto" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[10000] w-72 bg-white dark:bg-[#1f2128] shadow-2xl transform transition-all duration-300 ease-out flex flex-col h-full lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
         <SidebarContent isMobile={true} />
      </aside>
    </>
  );
}

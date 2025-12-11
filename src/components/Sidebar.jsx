import React from 'react';
import { User, MessageSquare, Calendar, MessageCircle, Settings, Sliders, LogOut, ShoppingBag, CreditCard, X, GraduationCap, ShieldCheck, Wrench, Briefcase } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useSchool } from '../contexts/SchoolContext';

export default function Sidebar({ userData, activeTab, setActiveTab, sidebarOpen, setSidebarOpen, handleLogout }) {
  const { isStudent, isStaff } = useSchool(); // Use Context Flags

  const links = [
    { id: 'dashboard', icon: <User size={18} />, label: 'Dashboard' },
    { id: 'feed', icon: <MessageSquare size={18} />, label: 'SocialNx' },
    { id: 'marketplace', icon: <ShoppingBag size={18} />, label: 'Marketplace' },
    { id: 'tech', icon: <Wrench size={18} />, label: 'Tech Services' }, 
    { id: 'bookings', icon: <Calendar size={18} />, label: 'Bookings' },
    { id: 'messages', icon: <MessageCircle size={18} />, label: 'Messages' },
    { id: 'payments', icon: <CreditCard size={18} />, label: 'Billing' },
    { id: 'profile', icon: <Settings size={18} />, label: 'Profile' },
  ];

  // --- UPDATED: EDU Panel Logic ---
  // Now checks for Students OR Staff (Instructors/Admins)
  const isIntern = userData?.accountTypes?.includes('Intern');
  
  if (isStudent || isIntern || isStaff || userData?.accountTypes?.includes('student')) {
      const insertIdx = links.findIndex(l => l.id === 'payments');
      
      // Determine label based on role
      let label = 'EDU Panel';
      if (isIntern) label = 'Internship';
      else if (isStaff) label = 'School Admin';

      // Determine routing ID
      let routeId = 'edu-overview'; // Default for staff/students
      if (isIntern) routeId = 'edu-intern';
      else if (isStudent) routeId = 'edu-student';

      links.splice(insertIdx, 0, { 
          id: routeId,
          icon: <GraduationCap size={18} />, 
          label: label, 
          highlight: true 
      });
  }

  // Check if user has business features (Studio, Label, Agent, Talent, Producer, etc.)
  const hasBusinessFeatures = userData?.accountTypes?.some(t => 
    ['Studio', 'Label', 'Agent', 'Talent', 'Producer', 'Engineer'].includes(t)
  );

  const onLogout = handleLogout || (() => signOut(auth));

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
        
        <nav className="space-y-1 px-2">
            {links.map(link => (
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
                {link.icon}
                {link.label}
            </button>
            ))}
        </nav>

        <div className="mt-auto px-2 pt-4 space-y-1">
            <button onClick={() => handleNavigation('legal')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition ${activeTab === 'legal' ? 'bg-blue-50 text-brand-blue dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <ShieldCheck size={18} />
                Legal Center
            </button>
            
            {/* Business Center - Show if user has business features */}
            {hasBusinessFeatures && (
                <button 
                    onClick={() => handleNavigation('business-center')} 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition ${
                        activeTab === 'business-center' 
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                            : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                    }`}
                >
                    <Briefcase size={18} />
                    Business Center
                </button>
            )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-[#1f2128]">
        <button onClick={onLogout} className="flex items-center gap-2 text-red-500 text-sm font-medium hover:opacity-80 px-2 w-full py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
          <LogOut size={16} /> Sign Out
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
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-all duration-300 ease-out lg:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

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

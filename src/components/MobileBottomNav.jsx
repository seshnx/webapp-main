import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Calendar, MessageCircle, Home } from 'lucide-react';

/**
 * Mobile Bottom Navigation
 * 
 * Provides quick access to primary navigation items on mobile devices.
 * Only visible on screens < 1024px (mobile/tablet).
 */
export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!isMobile) return null;
  
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'feed', icon: MessageSquare, label: 'Feed' },
    { id: 'bookings', icon: Calendar, label: 'Bookings' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];
  
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1f2128] border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom shadow-lg"
      aria-label="Bottom navigation"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive
                  ? 'text-brand-blue dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-blue dark:bg-blue-400 rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}


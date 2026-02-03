import React, { useState, useRef, useEffect, MouseEvent, FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, Menu, MessageCircle, Calendar, ChevronDown, RefreshCw, GraduationCap, Layout, Search as SearchIcon } from 'lucide-react';
import LogoWhite from '../assets/SeshNx-PNG cCropped white text.png';
import LogoDark from '../assets/SeshNx-PNG cCropped.png';
import UserAvatar, { UserAvatarProps } from './shared/UserAvatar';
import NotificationsPanel, { NotificationBadge } from './social/NotificationsPanel';
import { useNotifications } from '../hooks/useNotifications';
import { getDisplayRole } from '../config/constants';
import { useLanguage } from '../contexts/LanguageContext';
import { BreadcrumbNav } from './ui/breadcrumb';

// Import TypeScript types
import type { AccountType, UserData } from '../types';
import type { UINotification } from '../hooks/useNotifications';

// Include "User" and "Fan" in the extended AccountType
type ExtendedAccountType = AccountType | 'User' | 'Fan';

// =====================================================
// NAVBAR COMPONENT TYPES
// =====================================================

/**
 * Sub-profile data structure
 */
export interface SubProfile {
  displayName?: string;
  profile_data?: {
    talentSubRole?: string;
  };
  talentSubRole?: string;
}

/**
 * Extended AccountType that includes 'User' and 'Fan' which are used in the application
 */
export type AccountTypeExtended = AccountType | 'User' | 'Fan';

/**
 * Role switch callback type
 */
export type RoleSwitchCallback = (role: AccountType) => void;

/**
 * Menu click callback type
 */
export type MenuClickCallback = () => void;

/**
 * Public profile callback type
 */
export type PublicProfileCallback = (userId: string) => void;

/**
 * Navbar component props interface
 */
export interface NavbarProps {
  /** User object from authentication */
  user: {
    id?: string;
    uid?: string;
  };

  /** Complete user data object */
  userData: UserData;

  /** User's sub-profiles (role-based profiles) */
  subProfiles?: Record<AccountType, SubProfile>;

  /** Dark mode state */
  darkMode: boolean;

  /** Dark mode toggle function */
  toggleTheme: () => void;

  /** Currently active tab */
  activeTab: string;

  /** Tab activation function */
  setActiveTab: (tab: string) => void;

  /** Menu button click handler */
  onMenuClick: MenuClickCallback;

  /** Role switch handler */
  onRoleSwitch?: RoleSwitchCallback;

  /** Open public profile callback */
  openPublicProfile?: PublicProfileCallback;

  /** Whether to show breadcrumbs in search area */
  showBreadcrumbs?: boolean;
}

/**
 * Notification handler types
 */
export interface NotificationHandlers {
  onUserClick: (userId: string) => void;
  onPostClick: (postId: string) => void;
  onBookingAction: (bookingId: string, action: 'accept' | 'decline', notificationId: string) => Promise<void>;
}

// =====================================================
// NAVBAR COMPONENT IMPLEMENTATION
// =====================================================

export default function Navbar({
    user,
    userData,
    subProfiles,
    darkMode,
    toggleTheme,
    activeTab,
    setActiveTab,
    onMenuClick,
    onRoleSwitch,
    openPublicProfile,
    showBreadcrumbs = false,
}: NavbarProps): React.ReactElement {
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState<boolean>(false);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  // Use the new notifications system
  const {
    notifications,
    unreadCount,
    loading: notifsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications(user?.id || user?.uid);

  // Type guards
  const isUser = (user: any): user is { id?: string; uid?: string } => {
    return !!user?.id || !!user?.uid;
  };

  // Active role from user data
  const activeRole: AccountTypeExtended = userData?.activeProfileRole || userData?.accountTypes?.[0] || 'User';

  // Get display role - checks sub-profiles for Talent subrole
  const getDisplayRoleLocal = (role: AccountTypeExtended): string => {
    if (!role || role === 'User' || role === 'Fan') return role || 'User';

    // For Talent, check if they have a subRole set in their sub-profile
    if (role === 'Talent') {
      const talentSub = subProfiles?.['Talent'];
      const subRole = talentSub?.profile_data?.talentSubRole || talentSub?.talentSubRole;
      if (subRole && subRole !== '') return subRole;
    }

    return role;
  };

  const displayRole = getDisplayRoleLocal(activeRole);
  const roles: AccountType[] = userData?.accountTypes || [];

  const eduRoles: AccountType[] = ['Student', 'EDUStaff', 'Intern', 'EDUAdmin'];
  const hasEduAccess = roles.some(r => eduRoles.includes(r));
  const isEduTab = activeTab.startsWith('edu');

  const getDisplayName = (role: AccountTypeExtended): string => {
      if (!role || role === 'Fan' || role === 'User') {
          return userData?.effectiveDisplayName || userData?.firstName || 'User';
      }
      const sub = subProfiles?.[role];
      return sub?.displayName || userData?.effectiveDisplayName || userData?.firstName || 'User';
  };

  const currentDisplayName = getDisplayName(activeRole);

  const handleEduClick = (): void => {
      if (activeRole === 'Student') {
          setActiveTab('edu-student');
      } else if (activeRole === 'Intern') {
          setActiveTab('edu-intern');
      } else {
          setActiveTab('edu-overview');
      }
  };

  useEffect(() => {
      if (activeRole) {
          setIsSwitching(false);
          requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                  setIsSwitching(true);
              });
          });
          const timer = setTimeout(() => setIsSwitching(false), 600);
          return () => clearTimeout(timer);
      }
  }, [activeRole]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside as any);
    return () => document.removeEventListener("mousedown", handleClickOutside as any);
  }, [notifRef, roleRef]);

  const handleNotifUserClick = (userId: string): void => {
      setShowNotifs(false);
      if (openPublicProfile) {
          openPublicProfile(userId);
      }
  };

  const handleNotifPostClick = (postId: string): void => {
      setShowNotifs(false);
      setActiveTab('feed'); // Navigate to feed where the post would be
  };

  // Handler for quick booking accept/decline from notifications
  const handleBookingAction = async (
    bookingId: string,
    action: 'accept' | 'decline',
    notificationId: string
  ): Promise<void> => {
      try {
          // Dynamic import to avoid circular dependency
          const { neonClient } = await import('../config/neon');
          const supabase = neonClient;

          if (!supabase) throw new Error('Neon client not initialized');

          // Update booking status using the query function
          const { query } = await import('../config/neon');
          const { error: bookingError } = await query(
              `UPDATE bookings
               SET status = $1, responded_at = $2
               WHERE id = $3`,
              [action === 'accept' ? 'Confirmed' : 'Declined', new Date().toISOString(), bookingId]
          );

          if (bookingError) throw bookingError;

          // Mark notification as actioned
          if (notificationId && (user?.id || user?.uid)) {
              const userId = user?.id || user?.uid;
              const { error: notifError } = await query(
                  `UPDATE notifications
                   SET action_taken = $1, read = $2, updated_at = $3
                   WHERE id = $4 AND user_id = $5`,
                  [action, true, new Date().toISOString(), notificationId, userId]
              );

              if (notifError) throw notifError;
          }
      } catch (error) {
          console.error('Booking action failed:', error);
          throw error;
      }
  };

  const handleRoleSelect = (role: AccountTypeExtended): void => {
      if (onRoleSwitch) onRoleSwitch(role as AccountType);
      setShowRoleMenu(false);
  };

  // Global search submit: navigate to feed for now
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      setShowNotifs(false);
      setActiveTab('feed');
      // Placeholder: tie into actual search when backend ready
  };

  // Keyboard shortcut Ctrl/Cmd + K to focus search
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent): void => {
          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          const metaKey = isMac ? e.metaKey : e.ctrlKey;
          if (metaKey && e.key.toLowerCase() === 'k') {
              e.preventDefault();
              searchInputRef.current?.focus();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (timestamp: string | Date | number | { toMillis(): number }): string => {
      if (!timestamp) return '';

      let date: Date;
      if ('toMillis' in timestamp) {
        date = new Date((timestamp as { toMillis(): number }).toMillis());
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
  };

  // Notification handlers for the panel
  const notificationHandlers: NotificationHandlers = {
    onUserClick: handleNotifUserClick,
    onPostClick: handleNotifPostClick,
    onBookingAction: handleBookingAction,
  };

  return (
    <>
      <div
        className={`fixed top-0 bottom-0 w-full pointer-events-none z-[9999]
          bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent
          ${isSwitching ? 'left-[-100%] transition-all duration-500 ease-out' : 'left-[100%] transition-none duration-0'}
        `}
      ></div>

      <nav className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-3 min-w-[180px]">
          <button
              onClick={onMenuClick}
              className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Open navigation menu"
              aria-expanded="false"
          >
              <Menu size={24} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <img
                src={darkMode ? LogoWhite : LogoDark}
                alt="SeshNx Logo"
                className="h-8 w-auto object-contain transition-opacity duration-300"
              />
          </div>
        </div>

        {/* Global Search - desktop only */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center max-w-xl px-4 gap-1">
          {/* Breadcrumb Navigation - can be toggled in settings */}
          {showBreadcrumbs && (
            <div className="w-full flex justify-start">
              <BreadcrumbNav className="text-xs" />
            </div>
          )}

          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="flex items-center gap-2 w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-brand-blue/70">
              <SearchIcon size={16} className="text-gray-400" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="text-xs font-semibold text-white bg-brand-blue hover:bg-blue-600 rounded-full px-3 py-1 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 md:gap-4">

          {hasEduAccess && (
              <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border dark:border-gray-700">
                  <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${!isEduTab ? 'bg-white dark:bg-gray-600 shadow-sm text-brand-blue dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  >
                      <Layout size={14}/> Studio
                  </button>
                  <button
                      onClick={handleEduClick}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${isEduTab ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  >
                      <GraduationCap size={14}/> Education
                  </button>
              </div>
          )}

          {roles.length > 1 && (
              <div className="relative hidden sm:flex items-center gap-3" ref={roleRef}>
                  <button
                      onClick={() => setShowRoleMenu(!showRoleMenu)}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition border border-gray-200 dark:border-gray-700"
                  >
                      <RefreshCw size={12} className={`text-brand-blue shrink-0 transition-transform ${isSwitching ? 'rotate-180 duration-500' : ''}`}/>
                      <span>{displayRole}</span>
                      <ChevronDown size={12} className={`shrink-0 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`}/>
                  </button>

                  <div className="flex flex-col leading-tight">
                      <span className="text-[10px] text-gray-500 font-medium">Posting as</span>
                      <span className="text-xs font-bold dark:text-white truncate max-w-[150px]">{currentDisplayName}</span>
                  </div>

                  {showRoleMenu && (
                      <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-[#2c2e36] border dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-2">Switch Profile Context</span>
                          </div>
                          <div className="p-1">
                              {roles.map(role => {
                                  const name = getDisplayName(role);
                                  return (
                                      <button
                                          key={role}
                                          onClick={() => handleRoleSelect(role)}
                                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${activeRole === role ? 'bg-blue-50 dark:bg-blue-900/20 text-brand-blue' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                      >
                                          <div className="flex flex-col">
                                              <span>{name}</span>
                                              <span className="text-[10px] opacity-70 font-normal uppercase">{role}</span>
                                          </div>
                                          {activeRole === role && <div className="w-1.5 h-1.5 rounded-full bg-brand-blue"></div>}
                                      </button>
                                  );
                              })}
                          </div>
                      </div>
                  )}
              </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>

          <div className="relative" ref={notifRef}>
              <button
                  className={`relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition ${showNotifs ? 'bg-gray-100 dark:bg-gray-800 text-brand-blue' : ''}`}
                  onClick={() => setShowNotifs(!showNotifs)}
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                  aria-expanded={showNotifs}
              >
                  <Bell size={20} aria-hidden="true" />
                  <NotificationBadge count={unreadCount} />
              </button>

              {showNotifs && (
                  <NotificationsPanel
                      notifications={notifications as UINotification[]}
                      unreadCount={unreadCount}
                      loading={notifsLoading}
                      onMarkAsRead={markAsRead}
                      onMarkAllAsRead={markAllAsRead}
                      onDeleteNotification={deleteNotification}
                      onClearAll={clearAll}
                      {...notificationHandlers}
                      onClose={() => setShowNotifs(false)}
                  />
              )}
          </div>

          {/* FIX: Use UserAvatar */}
          <UserAvatar
              src={userData?.photoURL}
              name={currentDisplayName}
              size="sm"
              className="border-2 border-transparent hover:border-brand-blue transition"
              onClick={() => setActiveTab('profile')}
          />
        </div>
      </nav>
    </>
  );
}
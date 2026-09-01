import React, { useState, Suspense, lazy } from 'react';
import { X, Calendar, DollarSign, Users, Award, Briefcase, Plus, Settings, MessageSquare, ArrowUpRight, Zap, Eye, Layout, Sparkles, ChevronRight, Activity, Flame, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from './shared/UserAvatar';
import AnimatedNumber from './shared/AnimatedNumber';

const FullDashboardComponent = lazy(() => import('./Dashboard'));

interface QuickDashboardProps {
  user: any;
  userData: any;
  subProfiles?: Record<string, any>;
  onClose: () => void;
  onNavigateTab: (tab: string, path?: string) => void;
}

interface GlassStatProps {
  title: string;
  value: number;
  prefix?: string;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
}

const GlassStat: React.FC<GlassStatProps> = ({ title, value, prefix = '', icon, gradient, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`relative p-4 rounded-2xl cursor-pointer overflow-hidden shadow-lg border border-white/10 ${gradient}`}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-black/20 px-2 py-0.5 rounded-full">
        Realtime
      </span>
    </div>
    <div className="text-2xl font-black text-white tracking-tight">
      {prefix}<AnimatedNumber value={value} />
    </div>
    <div className="text-xs font-bold text-white/90 truncate">{title}</div>
  </motion.div>
);

export default function QuickDashboard({
  user,
  userData,
  subProfiles = {},
  onClose,
  onNavigateTab
}: QuickDashboardProps) {
  const [showFullDashboardView, setShowFullDashboardView] = useState(false);

  const displayName = userData?.displayName || userData?.effectiveDisplayName || user?.firstName || 'Creator';
  const photoUrl = userData?.photoURL || user?.imageUrl;
  const activeRole = userData?.activeProfileRole || userData?.accountTypes?.[0] || 'Creator';

  const bookingCount = userData?.bookingCount || 0;
  const tokenBalance = userData?.tokenBalance || 150;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-16 p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          className={`w-full ${showFullDashboardView ? 'max-w-6xl' : 'max-w-3xl'} bg-white dark:bg-[#1a1d21] rounded-3xl p-6 shadow-2xl border dark:border-gray-700 relative overflow-hidden transition-all duration-300`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header Bar matching Dashboard.tsx styling */}
          <div className="flex items-center justify-between pb-4 border-b dark:border-gray-800">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} userData={userData} name={displayName} size="md" />
              <div>
                <h3 className="font-bold text-base dark:text-white flex items-center gap-2">
                  {displayName}
                  <span className="bg-brand-blue text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                    {activeRole}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {showFullDashboardView ? 'Full Creator Dashboard' : 'Quick Dashboard Module Overview'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFullDashboardView(!showFullDashboardView)}
                className="px-3 py-1.5 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
              >
                <Layout size={14} />
                <span>{showFullDashboardView ? 'Minimize Module' : 'View Full Dashboard'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Conditional View: Full Dashboard embedded OR Quick Dashboard module */}
          {showFullDashboardView ? (
            <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
              <Suspense fallback={
                <div className="py-20 text-center text-brand-blue font-bold flex flex-col items-center gap-2">
                  <Sparkles className="animate-spin" size={32} /> Loading Complete Dashboard...
                </div>
              }>
                <FullDashboardComponent
                  user={user}
                  userData={userData}
                  subProfiles={subProfiles}
                  setActiveTab={(tab) => {
                    onNavigateTab(tab);
                    onClose();
                  }}
                  bookingCount={bookingCount}
                  tokenBalance={tokenBalance}
                />
              </Suspense>
            </div>
          ) : (
            <>
              {/* Glassmorphism Stat Cards matching Dashboard.tsx */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                <GlassStat
                  title="Bookings"
                  value={bookingCount}
                  icon={<Calendar size={18} />}
                  gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
                  onClick={() => {
                    onNavigateTab('bookings', '/bookings');
                    onClose();
                  }}
                />

                <GlassStat
                  title="Sesh Points"
                  value={tokenBalance}
                  icon={<Zap size={18} />}
                  gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                />

                <GlassStat
                  title="Total Reach"
                  value={userData?.stats?.followersCount || userData?.followersCount || 0}
                  icon={<Users size={18} />}
                  gradient="bg-gradient-to-br from-blue-600 to-cyan-700"
                  onClick={() => {
                    onNavigateTab('feed', '/feed');
                    onClose();
                  }}
                />

                <GlassStat
                  title="Creator Earnings"
                  value={userData?.earnings || 0}
                  prefix="$"
                  icon={<DollarSign size={18} />}
                  gradient="bg-gradient-to-br from-emerald-500 to-teal-700"
                />
              </div>

              {/* Quick Action Hub Shortcuts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Quick Operations Hub
                  </h4>
                  <button
                    onClick={() => setShowFullDashboardView(true)}
                    className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
                  >
                    View Full Dashboard <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onNavigateTab('bookings', '/bookings');
                      onClose();
                    }}
                    className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-100 dark:border-blue-800/40 hover:scale-[1.01] transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-brand-blue text-white rounded-xl shadow-sm">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs dark:text-white group-hover:text-brand-blue transition">Studio & Talent Bookings</h5>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Schedule studio rooms or hire talent</span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-brand-blue" />
                  </button>

                  <button
                    onClick={() => {
                      onNavigateTab('feed', '/feed');
                      onClose();
                    }}
                    className="flex items-center justify-between p-3.5 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-2xl border border-cyan-100 dark:border-cyan-800/40 hover:scale-[1.01] transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-cyan-600 text-white rounded-xl shadow-sm">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs dark:text-white group-hover:text-brand-blue transition">Social Feed & Creator Hub</h5>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Stories, shorts, audio rooms & creator circles</span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-brand-blue" />
                  </button>

                  <button
                    onClick={() => {
                      onNavigateTab('studio-manager', '/studio-manager');
                      onClose();
                    }}
                    className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 hover:scale-[1.01] transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs dark:text-white group-hover:text-emerald-500 transition">Studio Manager Ops</h5>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Manage studio rooms, staff & kiosk</span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-emerald-500" />
                  </button>

                  <button
                    onClick={() => {
                      onNavigateTab('profile', '/profile');
                      onClose();
                    }}
                    className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-2xl border border-amber-100 dark:border-amber-800/40 hover:scale-[1.01] transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
                        <Settings size={18} />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs dark:text-white group-hover:text-amber-500 transition">Profile & Preferences</h5>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">Edit profile details & preferences</span>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-amber-500" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

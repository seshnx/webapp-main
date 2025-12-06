import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, MessageCircle, Search, Edit2, Zap, Sliders, 
  ArrowRight, Bell, Music, TrendingUp, Clock, AlertTriangle, 
  CheckCircle, XCircle, ShoppingBag, ChevronRight
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';
import { db, getPaths, appId } from '../config/firebase'; 
import StatCard from './shared/StatCard';
import { PROFILE_SCHEMAS, BOOKING_THRESHOLD } from '../config/constants';

// FIX: Added default values for all props to prevent 'undefined' crashes
export default function Dashboard({ 
    user, 
    userData, 
    setActiveTab, 
    bookingCount = 0, 
    subProfiles = {}, 
    notifications = [], // FIX: Default to empty array prevents .map error
    tokenBalance = 0 
}) {
  const [recentConvos, setRecentConvos] = useState([]);
  const [trendingItem, setTrendingItem] = useState(null);
  
  const isStudio = userData?.accountTypes?.includes('Studio');
  
  // FIX: Safe access to subProfiles using optional chaining
  const studioRooms = subProfiles?.['Studio']?.rooms || [];
  const profileViews = userData?.profileViews || 0;

  // Calculate Overall Completion for Banner
  const roles = userData?.accountTypes || [];
  let totalPct = 0;
  let roleCount = 0;

  roles.forEach(role => {
      const data = subProfiles?.[role] || {};
      const schema = PROFILE_SCHEMAS[role] || [];
      // Skip empty schema (like Admin)
      if (schema.length === 0) return;

      const totalFields = schema.filter(f => !f.isToggle && f.type !== 'list').length || 1;
      const filledFields = schema.filter(f => !f.isToggle && f.type !== 'list' && data[f.key] && data[f.key].length).length;
      totalPct += (filledFields / totalFields);
      roleCount++;
  });
  
  const avgCompletion = roleCount > 0 ? Math.round((totalPct / roleCount) * 100) : 100;
  const showCompletionWarning = avgCompletion < 60;

  // 1. Fetch Recent Conversations from Convex
  // Hook must always be called, but we skip if Convex not available
  const conversationsData = useQuery(
    api.conversations.getConversations,
    user?.uid && isConvexAvailable() ? { userId: user.uid } : "skip"
  );

  useEffect(() => {
    if (!conversationsData) {
      setRecentConvos([]);
      return;
    }

    // Transform and get top 3 most recent
    const convos = conversationsData
      .map(conv => ({
        uid: conv.otherUserId || conv.chatId,
        name: conv.chatName || 'Unknown',
        lastMessage: conv.lastMessage || '',
        timestamp: conv.lastMessageTime || 0,
        isMe: conv.lastSenderId === user.uid
      }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3); // Get top 3

    setRecentConvos(convos);
  }, [conversationsData, user?.uid]);

  // 2. Fetch Trending Marketplace Item
  useEffect(() => {
      const q = query(collection(db, `artifacts/${appId}/public/data/market_items`), orderBy('timestamp', 'desc'), limit(1));
      const unsub = onSnapshot(q, (snap) => {
          if (!snap.empty) {
              setTrendingItem({ id: snap.docs[0].id, ...snap.docs[0].data() });
          }
      });
      return () => unsub();
  }, []);

  // Safe Timestamp Formatter
  const formatNotificationTime = (ts) => {
      if (!ts) return 'Just now';
      
      let date;
      if (typeof ts.toMillis === 'function') {
          date = new Date(ts.toMillis());
      } else if (typeof ts === 'number') {
          date = new Date(ts);
      } else if (ts instanceof Date) {
          date = ts;
      } else {
          return 'Just now';
      }

      if (isNaN(date.getTime())) return 'Just now';
      
      const now = new Date();
      const isToday = date.getDate() === now.getDate() && 
                      date.getMonth() === now.getMonth() && 
                      date.getFullYear() === now.getFullYear();
      
      return isToday 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white tracking-tight">Welcome, {userData?.firstName}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your creative command center.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-500 bg-white dark:bg-[#2c2e36] px-4 py-2 rounded-full border dark:border-gray-700 shadow-sm flex items-center gap-2">
                <Clock size={14} />
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
        </div>
      </div>

      {/* Completion Warning Banner */}
      {showCompletionWarning && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                  <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-full text-orange-600 dark:text-orange-400">
                      <AlertTriangle size={20} />
                  </div>
                  <div>
                      <h4 className="font-bold text-orange-800 dark:text-orange-300 text-sm">Profile Incomplete ({avgCompletion}%)</h4>
                      <p className="text-xs text-orange-700 dark:text-orange-400">Please complete your profile details before booking sessions.</p>
                  </div>
              </div>
              <button 
                  onClick={() => setActiveTab('profile')} 
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                  Complete Profile
              </button>
          </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Card */}
        <div 
            className="bg-gradient-to-br from-yellow-500 to-orange-600 p-5 rounded-xl text-white shadow-lg cursor-pointer transform transition hover:scale-[1.02] relative overflow-hidden group" 
            onClick={() => setActiveTab('payments')}
        >
            <div className="relative z-10">
                <div className="text-yellow-100 text-sm font-medium mb-1 flex items-center gap-1">
                    SeshFx Balance <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                </div>
                <div className="text-3xl font-extrabold flex items-center gap-2">
                    <Zap fill="currentColor" size={28} /> {tokenBalance}
                </div>
                <div className="text-xs text-yellow-100 mt-2 opacity-80 bg-white/20 inline-block px-2 py-0.5 rounded-full">
                    + Add Funds
                </div>
            </div>
            <Zap size={120} className="absolute -bottom-6 -right-6 text-white opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>

        {/* Sessions Card */}
        <div className="cursor-pointer transform transition hover:scale-[1.02]" onClick={() => setActiveTab('bookings')}>
            <StatCard 
                title="Pending Bookings" 
                value={bookingCount} 
                icon={<Calendar className="text-white" />} 
                bg="bg-gradient-to-br from-brand-blue to-blue-600" 
                text="text-white" 
                sub={bookingCount > 0 ? "Action Required" : "No pending requests"}
            />
        </div>
        
        {/* Messages Card */}
        <div className="cursor-pointer transform transition hover:scale-[1.02]" onClick={() => setActiveTab('messages')}>
            <StatCard 
                title="Active Chats" 
                value={recentConvos.length} 
                icon={<MessageCircle className="text-brand-blue" />} 
                sub="Check Inbox" 
            />
        </div>

        {/* Views Card */}
        <div className="cursor-pointer transform transition hover:scale-[1.02]" onClick={() => setActiveTab('profile')}>
            <StatCard 
                title="Profile Views" 
                value={profileViews} 
                icon={<TrendingUp className="text-brand-blue" />} 
                sub="Lifetime views" 
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Feeds */}
        <div className="lg:col-span-2 space-y-8">
          
            {/* Notifications / Activity Feed */}
            <div className="bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#23262f]">
                    <h3 className="font-bold dark:text-white flex items-center gap-2"><Bell size={18} className="text-gray-500"/> Activity Feed</h3>
                    {notifications && notifications.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{notifications.length} New</span>}
                </div>
                <div className="divide-y dark:divide-gray-700">
                    {(!notifications || notifications.length === 0) ? (
                        <div className="p-8 text-center">
                            <div className="bg-gray-100 dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell size={20} className="text-gray-400"/>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map((n, i) => (
                            <div key={n.id || i} className="p-4 hover:bg-gray-50 dark:hover:bg-[#25272e] transition flex justify-between items-center group cursor-pointer" onClick={() => setActiveTab('bookings')}>
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${n.type === 'booking' ? 'bg-brand-blue' : 'bg-yellow-500'}`}></div>
                                    <div>
                                        <p className="text-sm dark:text-gray-200 font-medium">{n.text}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatNotificationTime(n.timestamp)}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-300" />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Studio Overview */}
            {isStudio && (
                <div className="bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 p-5 relative overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <h3 className="font-bold dark:text-white flex items-center gap-2"><Sliders size={18} className="text-brand-blue"/> Studio Status</h3>
                        <button onClick={() => setActiveTab('studio-ops')} className="text-sm text-brand-blue hover:underline flex items-center gap-1">Manage Ops <ArrowRight size={14}/></button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        {studioRooms.length === 0 ? (
                            <div className="col-span-full text-center py-6 text-gray-400 text-sm border-2 border-dashed dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#1f2128]">
                                <div className="mb-2">No rooms configured.</div>
                                <button className="text-brand-blue font-bold hover:underline" onClick={()=>setActiveTab('studio-ops')}>+ Add Room</button>
                            </div>
                        ) : (
                            studioRooms.map((room, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-[#1f2128] p-3 rounded-lg border dark:border-gray-700 flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-sm dark:text-gray-200">{room.name}</div>
                                        <div className="text-xs text-gray-500">{room.equipment?.length || 0} items • ${room.rate}/hr</div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 ${room.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {room.active ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                                        {room.active ? 'Active' : 'Maint.'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Recent Messages */}
            <div className="bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold dark:text-white flex items-center gap-2"><MessageCircle size={18} className="text-gray-400"/> Recent Messages</h3>
                    <button onClick={()=>setActiveTab('messages')} className="text-sm text-brand-blue hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                    {recentConvos.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-4">No recent messages.</div>
                    ) : (
                        recentConvos.map((c, i) => (
                            <div key={c.uid + i} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-[#25272e] rounded-lg cursor-pointer transition" onClick={() => setActiveTab('messages')}>
                                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                    {c.name ? c.name.charAt(0) : '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold dark:text-gray-200 flex justify-between">
                                        {c.name || 'Unknown User'}
                                        <span className="text-[10px] text-gray-400 font-normal">{new Date(c.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {c.isMe ? 'You: ' : ''}{c.lastMessage}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
        
        {/* Right Column: Actions & Discovery */}
        <div className="space-y-6">
            
           {/* Quick Actions */}
           <div className="bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 p-4 shadow-sm">
             <h3 className="font-bold mb-3 dark:text-white text-sm uppercase tracking-wide text-gray-500">Quick Actions</h3>
             <div className="space-y-3">
               <button className="w-full text-left px-4 py-3 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-3 dark:text-gray-300 transition group" onClick={()=>setActiveTab('feed')}>
                   <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-brand-blue group-hover:scale-110 transition-transform"><Edit2 size={16}/></div> 
                   <span className="font-medium">Create Post</span>
               </button>
               <button className="w-full text-left px-4 py-3 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-3 dark:text-gray-300 transition group" onClick={()=>setActiveTab('bookings')}>
                   <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded text-purple-600 group-hover:scale-110 transition-transform"><Search size={16}/></div> 
                   <span className="font-medium">Find Talent</span>
               </button>
              <button className="w-full text-left px-4 py-3 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-3 dark:text-gray-300 transition group" onClick={()=>setActiveTab('marketplace')}>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded text-yellow-600 group-hover:scale-110 transition-transform"><ShoppingBag size={16}/></div> 
                  <span className="font-medium">Browse Marketplace</span>
</button>
             </div>
           </div>

           {/* Dynamic Trending Promo */}
           <div className="bg-gradient-to-br from-slate-800 to-black text-white rounded-xl p-5 relative overflow-hidden shadow-lg">
               <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2">
                       <Zap size={16} className="text-yellow-400" fill="currentColor"/>
                       <span className="text-xs font-bold text-yellow-400 uppercase">Trending on SeshFx</span>
                   </div>
                   {trendingItem ? (
                       <>
                           <h4 className="font-bold text-lg mb-1 truncate">{trendingItem.title}</h4>
                           <p className="text-xs text-gray-400 mb-4">by {trendingItem.author} • {trendingItem.price} Tokens</p>
                       </>
                   ) : (
                       <>
                           <h4 className="font-bold text-lg mb-1">Discover Sounds</h4>
                           <p className="text-xs text-gray-400 mb-4">Fresh beats & presets added daily.</p>
                       </>
                   )}
                   <button onClick={() => setActiveTab('seshfx')} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition">
                       Visit Store <ArrowRight size={12} />
                   </button>
               </div>
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-yellow-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
           </div>
           
           {/* Profile Health */}
           <div className="bg-white dark:bg-dark-card rounded-xl border dark:border-gray-700 p-4 shadow-sm">
                <h3 className="font-bold dark:text-white text-sm mb-3">Completion</h3>
                <div className="space-y-3">
                    {(userData?.accountTypes || []).map(role => {
                        // FIX: Safe access to subProfiles
                        const data = subProfiles?.[role] || {};
                        const schema = PROFILE_SCHEMAS[role] || [];
                        if (schema.length === 0) return null; // Skip if no schema

                        const total = schema.filter(f => !f.isToggle && f.type !== 'list').length || 1;
                        const filled = schema.filter(f => !f.isToggle && f.type !== 'list' && data[f.key] && data[f.key].length).length;
                        const pct = Math.round((filled/total)*100);
                        return (
                            <div 
                                key={role} 
                                className="space-y-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded transition"
                                onClick={() => setActiveTab('profile')} // Action: Open Profile Editor
                                title="Click to edit profile"
                            >
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">{role}</span>
                                    <span className={pct===100 ? "text-green-500 font-bold" : "text-gray-500"}>{pct}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ${pct>=80?'bg-green-500': pct>=40?'bg-yellow-500':'bg-red-500'}`} style={{width: `${pct}%`}}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
           </div>

        </div>
      </div>
    </div>
  );
}

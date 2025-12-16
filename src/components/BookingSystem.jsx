import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Search, Calendar, ArrowLeft, CheckCircle, Clock, DollarSign, User, MapPin } from 'lucide-react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

// Components
import SessionWizard from './SessionWizard'; 
import TalentSearch from './TalentSearch';
import BroadcastList from './BroadcastList'; 
import BroadcastRequest from './BroadcastRequest';
import BookingModal from './BookingModal';
import SessionBuilderModal from './SessionBuilderModal';
// FIX: Import SessionDetailsModal (was missing in previous file content provided, but referenced in code)
import SessionDetailsModal from './SessionDetailsModal';

export default function BookingSystem({ user, userData, openPublicProfile }) {
  const [subTab, setSubTab] = useState('search'); 
  const [bookingMode, setBookingMode] = useState('list'); 
  
  // ... (State management remains same) ...
  const [bookingView, setBookingView] = useState('outgoing');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [plannerView, setPlannerView] = useState('wizard');
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionParams, setSessionParams] = useState({
      date: '',
      time: '',
      location: null,
      radius: 25,
      urgency: 'Normal',
      venue: null 
  });
  const [sessionCart, setSessionCart] = useState([]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  // NEW: State for details modal
  const [sessionDetailsTarget, setSessionDetailsTarget] = useState(null);

  // ... (Effects and Handlers remain same) ...
  
  useEffect(() => {
      if (!user?.id && !user?.uid || !supabase) return;
      const userId = user.id || user.uid;
      setLoadingBookings(true);
      
      // Fetch outgoing bookings
      supabase
          .from('bookings')
          .select('*')
          .eq('sender_id', userId)
          .then(({ data, error }) => {
              if (!error && data) {
                  setOutgoing(data.map(d => ({
                      id: d.id,
                      ...d,
                      senderId: d.sender_id,
                      targetId: d.target_id
                  })));
              }
              setLoadingBookings(false);
          });

      // Fetch incoming bookings
      supabase
          .from('bookings')
          .select('*')
          .eq('target_id', userId)
          .then(({ data, error }) => {
              if (!error && data) {
                  setIncoming(data.map(d => ({
                      id: d.id,
                      ...d,
                      senderId: d.sender_id,
                      targetId: d.target_id
                  })));
              }
              setLoadingBookings(false);
          });

      // Subscribe to realtime changes
      const channel = supabase
          .channel(`bookings-${userId}`)
          .on(
              'postgres_changes',
              {
                  event: '*',
                  schema: 'public',
                  table: 'bookings',
                  filter: `sender_id=eq.${userId}`
              },
              async () => {
                  const { data } = await supabase
                      .from('bookings')
                      .select('*')
                      .eq('sender_id', userId);
                  
                  if (data) {
                      setOutgoing(data.map(d => ({
                          id: d.id,
                          ...d,
                          senderId: d.sender_id,
                          targetId: d.target_id
                      })));
                  }
              }
          )
          .on(
              'postgres_changes',
              {
                  event: '*',
                  schema: 'public',
                  table: 'bookings',
                  filter: `target_id=eq.${userId}`
              },
              async () => {
                  const { data } = await supabase
                      .from('bookings')
                      .select('*')
                      .eq('target_id', userId);
                  
                  if (data) {
                      setIncoming(data.map(d => ({
                          id: d.id,
                          ...d,
                          senderId: d.sender_id,
                          targetId: d.target_id
                      })));
                  }
              }
          )
          .subscribe();

      return () => {
          supabase.removeChannel(channel);
      };
  }, [user?.id, user?.uid]);

  const handleDirectBook = (target) => { setSelectedTarget(target); setShowBookingModal(true); };
  const handlePlannerNext = () => setPlannerView('talent');
  const handleAddToCart = (talent) => {
      if (sessionCart.find(t => t.id === talent.id)) return toast.error("Already added.");
      setSessionCart([...sessionCart, talent]);
      toast.success("Added to Session");
  };
  const handleRemoveFromCart = (id) => setSessionCart(sessionCart.filter(t => t.id !== id));
  const handlePlannerComplete = () => {
      setShowSessionSummary(false);
      setPlannerView('wizard');
      setSessionCart([]);
      setSessionParams({ date: '', time: '', location: null, radius: 25, urgency: 'Normal', venue: null });
      setSubTab('requests');
  };

  // Updated Render List to be clickable
  const renderBookingList = (list, type) => {
      if (list.length === 0) return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed dark:border-gray-700 rounded-2xl">
              <Calendar size={48} className="mb-4 opacity-20"/>
              <p>No {type === 'outgoing' ? 'outgoing' : 'incoming'} bookings found.</p>
          </div>
      );

      return (
          <div className="grid gap-4">
              {list.map(booking => (
                  <div 
                    key={booking.id} 
                    onClick={() => setSessionDetailsTarget(booking)} // Open Details
                    className="bg-white dark:bg-[#2c2e36] p-5 rounded-xl border dark:border-gray-700 shadow-sm hover:border-brand-blue transition group cursor-pointer"
                  >
                      <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold">
                                  {type === 'outgoing' ? booking.targetName?.[0] : booking.senderName?.[0]}
                              </div>
                              <div>
                                  <h4 className="font-bold dark:text-white text-lg">
                                      {type === 'outgoing' ? booking.targetName : booking.senderName}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{booking.serviceType || 'Session'}</span>
                                      {booking.date && <span>• {booking.date}</span>}
                                  </div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide inline-block mb-1 ${booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {booking.status}
                              </div>
                              <div className="font-mono font-bold dark:text-white">${booking.offerAmount}</div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="max-w-7xl mx-auto relative min-h-screen pb-20">
      
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-end mb-6 border-b dark:border-gray-700 gap-4">
        <div className="flex gap-6 w-full sm:w-auto">
            <button onClick={() => setSubTab('broadcasts')} className={`pb-4 px-2 font-bold text-sm transition border-b-2 flex items-center gap-2 ${subTab === 'broadcasts' ? 'border-brand-blue text-brand-blue dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><Zap size={16}/> Open Jobs</button>
            <button onClick={() => setSubTab('search')} className={`pb-4 px-2 font-bold text-sm transition border-b-2 flex items-center gap-2 ${subTab === 'search' ? 'border-brand-blue text-brand-blue dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><Search size={16}/> Talent Search</button>
        </div>
        <div className="flex gap-6 w-full sm:w-auto justify-end">
             <button onClick={() => setSubTab('planner')} className={`pb-4 px-2 font-bold text-sm transition border-b-2 flex items-center gap-2 ${subTab === 'planner' ? 'border-brand-blue text-brand-blue dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><Calendar size={16}/> Session Planner</button>
             <button onClick={() => setSubTab('requests')} className={`pb-4 px-2 font-bold text-sm transition border-b-2 flex items-center gap-2 ${subTab === 'requests' ? 'border-brand-blue text-brand-blue dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><Clock size={16}/> My Bookings</button>
        </div>
      </div>

      <div className="tab-content-wrapper">
          {subTab === 'broadcasts' && (
              <div key="broadcasts" className="tab-content">
                  {bookingMode === 'create_broadcast' ? (
                      <BroadcastRequest user={user} userData={userData} onBack={() => setBookingMode('list')} onSuccess={() => setBookingMode('list')} />
                  ) : (
                      <>
                        <div className="flex justify-end mb-4"><button onClick={() => setBookingMode('create_broadcast')} className="bg-brand-blue text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-blue-600 transition flex items-center gap-2"><Zap size={16}/> New Broadcast</button></div>
                        <BroadcastList user={user} userData={userData} />
                      </>
                  )}
              </div>
          )}

          {subTab === 'search' && (
              <div key="search" className="tab-content">
                  <TalentSearch user={user} userData={userData} openPublicProfile={openPublicProfile} onBook={handleDirectBook} mode="direct" />
              </div>
          )}

          {subTab === 'requests' && (
              <div key="requests" className="tab-content">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <div><h2 className="text-2xl font-bold dark:text-white">Booking Management</h2><p className="text-gray-500 text-sm">Track your sessions and requests.</p></div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex"><button onClick={() => setBookingView('outgoing')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${bookingView === 'outgoing' ? 'bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>I Booked</button><button onClick={() => setBookingView('incoming')} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${bookingView === 'incoming' ? 'bg-white dark:bg-[#2c2e36] text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>Booked Me</button></div>
                  </div>
                  {bookingView === 'outgoing' ? renderBookingList(outgoing, 'outgoing') : renderBookingList(incoming, 'incoming')}
              </div>
          )}

          {subTab === 'planner' && (
              <div key="planner" className="tab-content">
                  {plannerView === 'wizard' && <SessionWizard userData={userData} sessionParams={sessionParams} setSessionParams={setSessionParams} onNext={handlePlannerNext} />}
                  {plannerView === 'talent' && (
                      <div className="relative">
                          <div className="bg-white dark:bg-[#2c2e36] p-4 rounded-xl border dark:border-gray-700 mb-6 flex justify-between items-center shadow-lg sticky top-4 z-40">
                              <div><h3 className="font-bold dark:text-white flex items-center gap-2"><Calendar size={18} className="text-brand-blue"/> {sessionParams.date || 'Flexible Date'} @ {sessionParams.venue?.name || 'Remote'}</h3><p className="text-xs text-gray-500">{sessionCart.length} talent added</p></div>
                              <div className="flex gap-2"><button onClick={() => setPlannerView('wizard')} className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white px-3 py-2">Back</button><button onClick={() => setShowSessionSummary(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 shadow flex items-center gap-2"><CheckCircle size={16}/> Review Session</button></div>
                          </div>
                          <TalentSearch user={user} userData={userData} openPublicProfile={openPublicProfile} onAddToCart={handleAddToCart} sessionCartIds={sessionCart.map(t => t.id)} mode="planner" />
                      </div>
                  )}
              </div>
          )}
      </div>

      <>
        {showBookingModal && selectedTarget && <BookingModal user={user} userData={userData} target={selectedTarget} allInstruments={[]} onClose={() => setShowBookingModal(false)} />}
        {showSessionSummary && <SessionBuilderModal user={user} userData={userData} cart={[...(sessionParams.venue && sessionParams.venue.id !== 'remote' ? [{...sessionParams.venue, accountTypes: ['Studio']}] : []), ...sessionCart]} onRemoveFromCart={handleRemoveFromCart} onClose={() => setShowSessionSummary(false)} onComplete={handlePlannerComplete} />}
        {sessionDetailsTarget && <SessionDetailsModal booking={sessionDetailsTarget} user={user} onClose={() => setSessionDetailsTarget(null)} />}
      </>
    </div>
  );
}

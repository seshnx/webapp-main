import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Wrench, Settings, Search, Plus, Sparkles, Shield, Clock,
  Briefcase, Users, Cpu, FileText, CheckCircle2, ChevronRight,
  Filter, Zap, ArrowRight, MessageCircle, AlertCircle, MapPin
} from 'lucide-react';
import TechSearch from './tech/TechSearch';
import TechBookingFlow from './tech/TechBookingFlow';
import TechGearDatabase from './tech/TechGearDatabase';
import TechServiceBoard from './tech/TechServiceBoard';
import RepairTracker from './tech/RepairTracker';
import TechBroadcastBuilder from './tech/TechBroadcastBuilder';
import type { UserData } from '../types';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import UserAvatar from './shared/UserAvatar';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export type TechTab = 'search' | 'my-requests' | 'jobs' | 'database';

export interface TechServicesProps {
  user: any;
  userData: UserData | null;
  openPublicProfile?: (userId: string) => void;
  openChat?: (userId: string, userName?: string) => void;
}

export default function TechServices({ user, userData, openPublicProfile, openChat }: TechServicesProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string): TechTab => {
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'tech' && parts[1]) {
      const sub = parts[1] as TechTab;
      if (['search', 'my-requests', 'jobs', 'database'].includes(sub)) return sub;
    }
    return 'search';
  };

  const [activeTab, setActiveTab] = useState<TechTab>(() => getTabFromPath(location.pathname));
  const [selectedTechForBooking, setSelectedTechForBooking] = useState<any>(null);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [selectedTrackerBookingId, setSelectedTrackerBookingId] = useState<string | null>(null);

  useEffect(() => {
    const currentPath = `/tech/${activeTab}`;
    if (location.pathname !== currentPath) {
      navigate(currentPath, { replace: true });
    }
  }, [activeTab, navigate, location.pathname]);

  useEffect(() => {
    const tabFromPath = getTabFromPath(location.pathname);
    if (tabFromPath !== activeTab) {
      setActiveTab(tabFromPath);
    }
  }, [location.pathname]);

  const clerkId = user?.id || user?.uid || userData?.clerkId || '';
  const isTechnician = Boolean(userData?.accountTypes?.includes('Technician') || userData?.isTechnician);

  // Query user's own service requests
  const myRequests = useQuery(api.techServices.getMyServiceRequests, { requesterId: clerkId }) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Banner & Fast Dispatch Hero */}
      <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-orange-500 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-full">
                SeshNx Audio Technician Network
              </span>
              <span className="text-xs text-gray-400 font-medium">
                • Vetted Bench & On-Site Specialists
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black dark:text-white">
              Studio Equipment & Technical Services
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              Find certified audio technicians for equipment repair, vintage tube maintenance, console recapping, and acoustic tuning.
            </p>
          </div>

          {/* Quick Dispatch Action Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] shrink-0"
            >
              <Zap size={18} className="text-yellow-200 fill-yellow-200" />
              <span>Request First Available Tech</span>
            </button>

            {isTechnician && (
              <button
                onClick={() => navigate('/business-center/tech')}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold dark:text-white transition"
              >
                <Briefcase size={16} className="text-orange-500" />
                <span>Tech Business Portal</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-750'
            }`}
          >
            <Users size={15} />
            <span>Search Certified Technicians</span>
          </button>

          <button
            onClick={() => setActiveTab('my-requests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my-requests'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-750'
            }`}
          >
            <Clock size={15} />
            <span>My Service Requests ({myRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'jobs'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-750'
            }`}
          >
            <Briefcase size={15} />
            <span>Service Job Board</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'database'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-750'
            }`}
          >
            <Cpu size={15} />
            <span>Gear Schematics & DB</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'search' && (
          <TechSearch
            user={user}
            userData={userData}
            openPublicProfile={openPublicProfile}
            onRequestService={(tech) => setSelectedTechForBooking(tech)}
          />
        )}

        {activeTab === 'my-requests' && (
          <MyServiceRequests
            requests={myRequests}
            onOpenDispatchModal={() => setShowDispatchModal(true)}
            onOpenTracker={(id: string) => setSelectedTrackerBookingId(id)}
            openChat={openChat}
          />
        )}

        {activeTab === 'jobs' && (
          <TechServiceBoard user={user} userData={userData} onOpenChat={openChat} />
        )}

        {activeTab === 'database' && (
          <TechGearDatabase user={user} userData={userData} />
        )}
      </div>

      {/* Repair Tracker & Diagnostic Inspection Modal */}
      {selectedTrackerBookingId && (
        <div className="fixed inset-0 z-[9990] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedTrackerBookingId(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition z-10"
              aria-label="Close Repair Tracker"
            >
              <X size={18} />
            </button>
            <RepairTracker bookingId={selectedTrackerBookingId} currentUser={user} />
          </div>
        </div>
      )}

      {/* Request Service to First Available Tech Modal */}
      <AnimatePresence>
        {showDispatchModal && (
          <FastDispatchServiceModal
            clerkId={clerkId}
            onClose={() => setShowDispatchModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Tech Direct Booking Flow */}
      {selectedTechForBooking && (
        <TechBookingFlow
          user={user}
          userData={userData}
          technician={selectedTechForBooking}
          onClose={() => setSelectedTechForBooking(null)}
        />
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: MY SERVICE REQUESTS (CLIENT TRACKER)
// =============================================================================

function MyServiceRequests({ requests, onOpenDispatchModal, onOpenTracker, openChat }: { requests: any[]; onOpenDispatchModal: () => void; onOpenTracker?: (id: string) => void; openChat?: (id: string, name?: string) => void }) {
  if (requests.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto">
          <Clock size={28} />
        </div>
        <div>
          <h3 className="text-lg font-bold dark:text-white">No active service requests</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
            You haven't requested any technical repairs or studio calibrations yet.
          </p>
        </div>
        <button
          onClick={onOpenDispatchModal}
          className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs hover:bg-orange-600 transition"
        >
          Request Service Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base dark:text-white">
          Active Technical Tickets ({requests.length})
        </h3>
        <button
          onClick={onOpenDispatchModal}
          className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:underline"
        >
          <Plus size={14} /> New Request
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req) => (
          <div
            key={req._id}
            className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    req.status === 'open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                    req.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {req.status === 'open' ? 'Awaiting Technician' : req.status === 'in_progress' ? 'In Repair' : 'Completed'}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">{req.category}</span>
                </div>
                <h4 className="font-bold text-sm dark:text-white">{req.title}</h4>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base font-black text-orange-500">${req.budget}</span>
                <p className="text-[10px] text-gray-400">Budget</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#252830] p-3 rounded-2xl text-xs space-y-1 text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span>Equipment:</span>
                <span className="font-bold">{req.equipmentBrand ? `${req.equipmentBrand} ${req.equipmentModel || ''}` : 'Custom Hardware'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Urgency:</span>
                <span className="font-semibold text-orange-500 uppercase">{req.urgency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Proposals Received:</span>
                <span className="font-bold text-brand-blue">{req.proposalsCount || 0}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {req.issueDescription}
            </p>

            {onOpenTracker && (
              <button
                onClick={() => onOpenTracker(req._id || req.id)}
                className="w-full mt-2 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Wrench size={13} /> View Ticket Progress & Diagnostic Logs
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: FAST DISPATCH SERVICE MODAL
// =============================================================================

function FastDispatchServiceModal({ clerkId, onClose }: { clerkId: string; onClose: () => void }) {
  const createServiceMutation = useMutation(api.techServices.createServiceRequest);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Tube & Amp Repair');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState('urgent_24h');
  const [logistics, setLogistics] = useState('on_site');
  const [location, setLocation] = useState('Austin, TX');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budget || isNaN(Number(budget))) {
      toast.error('Please enter a title and budget');
      return;
    }

    setSubmitting(true);
    try {
      await createServiceMutation({
        requesterId: clerkId,
        title,
        category,
        equipmentBrand: brand || undefined,
        equipmentModel: model || undefined,
        budget: Number(budget),
        urgency,
        logistics,
        location: location || 'Austin, TX',
        issueDescription: description || 'Immediate technician dispatch requested.',
      });

      toast.success('Service request dispatched to available technicians!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to dispatch request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#1f2128] rounded-3xl max-w-lg w-full border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-2xl my-8 relative"
      >
        <div className="flex items-center justify-between pb-3 border-b dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-orange-500 text-xs font-black uppercase">
              <Zap size={14} className="fill-orange-500" />
              Rapid Tech Dispatch
            </div>
            <h3 className="text-lg font-bold dark:text-white mt-0.5">
              Request Service to First Available Tech
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Service Needed *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vintage Tube Amp Buzzing / Urgent Microphone Sputter"
              className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white"
              >
                <option value="Tube & Amp Repair">Tube & Amp Repair</option>
                <option value="Console & Outboard">Console & Outboard</option>
                <option value="Acoustics & Tuning">Acoustics & Room Tuning</option>
                <option value="Patchbay & Wiring">Patchbay & Studio Wiring</option>
                <option value="Tape & Vintage">Tape & Vintage Recorders</option>
                <option value="Microphone Restoration">Microphone Restoration</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Urgency Level *</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white font-semibold text-orange-500"
              >
                <option value="urgent_24h">🚨 Urgent (Within 24 Hours)</option>
                <option value="standard">Standard (3-5 Days)</option>
                <option value="scheduled">Scheduled Studio Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Neumann"
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. U87"
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Budget ($) *</label>
              <input
                type="number"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="300"
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Logistics *</label>
              <select
                value={logistics}
                onChange={(e) => setLogistics(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white"
              >
                <option value="on_site">On-Site Studio Visit</option>
                <option value="bench_dropoff">Bench Drop-off / Shipping</option>
                <option value="remote">Remote Calibration / Support</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Austin, TX"
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Issue Symptoms *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe symptoms, noise, power supply issues, distortion..."
              className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-3 text-xs dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl border dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition shadow-xs flex items-center justify-center gap-1.5"
            >
              {submitting ? 'Dispatching...' : 'Dispatch Request'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

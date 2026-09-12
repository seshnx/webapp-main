import React, { useState, useMemo } from 'react';
import {
  Briefcase, Clock, MapPin, DollarSign, Calendar, Filter, Wrench,
  Search, Shield, User, ChevronRight, AlertCircle, CheckCircle2,
  Sparkles, Plus, ExternalLink, MessageCircle
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import UserAvatar from '../shared/UserAvatar';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export interface TechServiceBoardProps {
  user?: any;
  userData?: any;
  onOpenPostModal?: () => void;
  onOpenChat?: (userId: string, name?: string) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Jobs' },
  { id: 'Tube & Amp Repair', label: 'Tube & Amp' },
  { id: 'Console & Outboard', label: 'Console & Outboard' },
  { id: 'Acoustics & Tuning', label: 'Acoustics & Tuning' },
  { id: 'Patchbay & Wiring', label: 'Studio Wiring' },
  { id: 'Tape & Vintage', label: 'Tape & Vintage' },
];

const URGENCIES = [
  { id: 'all', label: 'All Urgencies' },
  { id: 'urgent_24h', label: 'Urgent (24h)' },
  { id: 'standard', label: 'Standard' },
  { id: 'scheduled', label: 'Scheduled' },
];

export default function TechServiceBoard({ user, userData, onOpenPostModal, onOpenChat }: TechServiceBoardProps) {
  const clerkId = user?.id || user?.uid || userData?.clerkId || '';
  const isTechnician = Boolean(userData?.accountTypes?.includes('Technician') || userData?.isTechnician);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [selectedJobForProposal, setSelectedJobForProposal] = useState<any>(null);
  const [proposalMessage, setProposalMessage] = useState('');

  const requests = useQuery(api.techServices.getOpenServiceRequests, {
    searchQuery: searchQuery || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    urgency: selectedUrgency !== 'all' ? selectedUrgency : undefined,
    limit: 50,
  }) || [];

  const expressInterest = useMutation(api.techServices.expressInterestInJob);

  const handleApply = async () => {
    if (!selectedJobForProposal) return;
    try {
      await expressInterest({
        requestId: selectedJobForProposal._id,
        techId: clerkId,
        message: proposalMessage || undefined,
      });
      toast.success('Your proposal has been submitted to the studio!');
      setSelectedJobForProposal(null);
      setProposalMessage('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit proposal');
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent_24h':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">Urgent 24h</span>;
      case 'scheduled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">Scheduled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Standard</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Refinements Bar */}
      <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repair requests by gear, symptoms, or studio (e.g. Neumann, SSL, calibration)..."
              className="w-full bg-gray-50 dark:bg-[#252830] border border-gray-200 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3 text-xs dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="bg-gray-50 dark:bg-[#252830] border dark:border-gray-700 text-xs rounded-2xl px-3.5 py-3 font-semibold dark:text-white"
            >
              {URGENCIES.map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-1">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Board Feed */}
      {requests.length === 0 ? (
        <div className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto">
            <Briefcase size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold dark:text-white">No active service requests</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
              There are currently no open service tickets in this category. Be the first to post a repair request.
            </p>
          </div>
          {onOpenPostModal && (
            <button
              onClick={onOpenPostModal}
              className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs hover:bg-orange-600 transition"
            >
              Post Service Request
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requests.map((job: any) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1f2128] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between gap-4 shadow-xs hover:border-orange-500/40 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {getUrgencyBadge(job.urgency)}
                      <span className="text-xs font-bold text-gray-400">{job.category}</span>
                    </div>
                    <h3 className="text-base font-black dark:text-white leading-snug">
                      {job.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-black text-orange-500">
                      ${job.budget}
                    </span>
                    <p className="text-[10px] text-gray-400">Budget</p>
                  </div>
                </div>

                {/* Equipment & Logistics strip */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-[#252830] p-3 rounded-2xl text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <Wrench size={13} className="text-orange-500 shrink-0" />
                    <span className="truncate">{job.equipmentBrand ? `${job.equipmentBrand} ${job.equipmentModel || ''}` : 'Custom Hardware'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-brand-blue shrink-0" />
                    <span>{job.location || 'Austin, TX'}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                  {job.issueDescription}
                </p>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800 text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  <UserAvatar src={job.requesterAvatar} name={job.requesterName} size="xs" />
                  <span className="truncate text-gray-600 dark:text-gray-300 font-medium">{job.requesterName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">
                    {job.proposalsCount || 0} proposals
                  </span>
                  {job.requesterId && (
                    <button
                      onClick={() => {
                        if (onOpenChat) {
                          onOpenChat(job.requesterId, job.requesterName);
                        } else {
                          toast.success(`Opening conversation with ${job.requesterName}`);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition flex items-center gap-1.5"
                      title="Direct message client"
                    >
                      <MessageCircle size={13} />
                      <span className="hidden sm:inline">Message</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedJobForProposal(job)}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition shadow-xs"
                  >
                    Submit Proposal
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit Proposal Modal */}
      <AnimatePresence>
        {selectedJobForProposal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1f2128] rounded-3xl max-w-md w-full border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold dark:text-white">Submit Service Proposal</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl space-y-1">
                <p className="text-xs font-bold dark:text-white">{selectedJobForProposal.title}</p>
                <p className="text-xs text-orange-500 font-semibold">Budget: ${selectedJobForProposal.budget}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Proposal & Estimated Turnaround
                </label>
                <textarea
                  rows={4}
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  placeholder="Describe your technical approach, bench availability, estimated component cost, and diagnostic procedure..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-3 text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setSelectedJobForProposal(null)}
                  className="py-2.5 rounded-xl border dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition"
                >
                  Send Proposal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

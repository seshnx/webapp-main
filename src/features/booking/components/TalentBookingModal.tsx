import React, { useState } from 'react';
import {
  X, CalendarCheck, Clock, MapPin, DollarSign,
  Music, MessageSquare, Loader2, CheckCircle, User, AlertTriangle
} from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@convex/api';
import toast from 'react-hot-toast';

interface TalentProfile {
  id?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  accountTypes?: string[];
  rate?: number;
  hourly_rate?: number;
  city?: string;
  state?: string;
  subProfilesList?: any[];
}

interface TalentBookingModalProps {
  talentClerkId: string;
  talentProfile: TalentProfile;
  clientClerkId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const SERVICE_TYPES = [
  'Recording Session',
  'Live Performance',
  'Feature / Collaboration',
  'Mix & Master',
  'Beat / Production',
  'Vocal Coaching',
  'Songwriting',
  'Podcast / Voice Over',
  'Other',
];

const DURATIONS = [
  { label: '1 Hour', value: 1 },
  { label: '2 Hours', value: 2 },
  { label: '3 Hours', value: 3 },
  { label: '4 Hours', value: 4 },
  { label: 'Half Day (5h)', value: 5 },
  { label: 'Full Day (8h)', value: 8 },
  { label: 'Custom', value: 0 },
];

/**
 * TalentBookingModal — Booking request modal for direct talent hiring.
 * Uses brand-blue colour scheme consistent with the rest of the app.
 */
export default function TalentBookingModal({
  talentClerkId,
  talentProfile,
  clientClerkId,
  onClose,
  onSuccess,
}: TalentBookingModalProps) {
  const createBooking = useMutation(api.bookings.createBooking);

  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [location, setLocation] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

  // Multi-role handling
  let roles = Array.from(new Set([
    ...(talentProfile?.subProfilesList?.map(sp => sp.role) || []),
    ...(talentProfile?.accountTypes || [])
  ])).filter(role => role && role !== 'Creative' && role !== 'Fan' && role !== 'Studio' && role !== 'Label');

  if (roles.length === 0) roles = ['Talent'];

  const [selectedRole, setSelectedRole] = useState(roles[0]);

  const isRoleComplete = (role: string) => talentProfile?.subProfilesList?.some((sp: any) => sp.role === role);

  // Derived suggested rate based on selected role
  const suggestedRate = React.useMemo(() => {
    if (talentProfile?.subProfilesList) {
      const sp = talentProfile.subProfilesList.find(sp => sp.role === selectedRole);
      if (sp && (sp.hourlyRate || sp.rate)) return sp.hourlyRate || sp.rate;
    }
    return talentProfile?.rate || talentProfile?.hourly_rate;
  }, [selectedRole, talentProfile]);

  const talentName = talentProfile?.displayName
    || `${talentProfile?.firstName || ''} ${talentProfile?.lastName || ''}`.trim()
    || 'Talent';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isRoleComplete(selectedRole) && !showIncompleteWarning) {
      setShowIncompleteWarning(true);
      return;
    }

    if (!serviceType) {
      toast.error('Please select a service type');
      return;
    }

    const duration = selectedDuration === 0 ? parseFloat(customDuration) : selectedDuration;
    if (!duration || isNaN(duration) || duration <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        talentClerkId,
        clientClerkId,
        serviceType: `[${selectedRole}] ${serviceType}`,
        date: date || undefined,
        time: time || undefined,
        duration,
        location: location || undefined,
        offerAmount: offerAmount ? parseFloat(offerAmount) : undefined,
        message: message || undefined,
      });

      setSubmitted(true);
      toast.success(`Booking request sent to ${talentName}!`);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to send booking request');
    } finally {
      setSubmitting(false);
    }
  };

  // Input style — neutral dark, blue focus ring
  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition';

  const labelClass = 'block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5';

  // Success screen
  if (submitted) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-[#1e2028] rounded-2xl shadow-2xl p-10 max-w-sm w-full text-center border border-white/10">
          <div className="w-20 h-20 rounded-full bg-[#3D84ED] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Request Sent! 🎉</h2>
          <p className="text-white/60 text-sm mb-8">
            Your booking request has been sent to <span className="text-white font-semibold">{talentName}</span>. You'll
            be notified when they respond.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#3D84ED] hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#1e2028] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-[#3D84ED]/20 border border-[#3D84ED]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {talentProfile?.photoURL ? (
                <img src={talentProfile.photoURL} alt={talentName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-[#3D84ED]" />
              )}
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-0.5">Book Session With</p>
              <h2 className="text-xl font-extrabold text-white leading-tight">{talentName}</h2>
              <div className="flex gap-1 mt-1 flex-wrap">
                {roles.slice(0, 3).map((role: string, i: number) => {
                  const complete = isRoleComplete(role);
                  return (
                    <span
                      key={i}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        complete 
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/20'
                          : 'bg-red-500/15 text-red-300 border-red-500/20'
                      }`}
                    >
                      {role}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Role Selection */}
          {roles.length > 0 && (
            <div>
              <label className={labelClass}>
                <User size={12} className="inline mr-1" /> Booking Role *
              </label>
              <div className="flex flex-wrap gap-2">
                {roles.map(role => {
                   const complete = isRoleComplete(role);
                   return (
                     <button
                       key={role}
                       type="button"
                       onClick={() => {
                         setSelectedRole(role);
                         setShowIncompleteWarning(false);
                       }}
                       className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                         selectedRole === role
                           ? complete
                             ? 'bg-[#3D84ED] border-blue-400 text-white shadow-md shadow-blue-500/20'
                             : 'bg-red-600 border-red-500 text-white shadow-md shadow-red-500/20'
                           : complete
                             ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                             : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                       }`}
                     >
                       {role} {!complete && <span className="opacity-70 font-normal text-[10px] hidden sm:inline">(Incomplete)</span>}
                     </button>
                   );
                })}
              </div>
            </div>
          )}

          {/* Service Type */}
          <div>
            <label className={labelClass}>
              <Music size={12} className="inline mr-1" /> Service Type *
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
              className={inputClass + ' cursor-pointer'}
            >
              <option value="" className="bg-[#1e2028]">Select a service...</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s} className="bg-[#1e2028]">{s}</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                <CalendarCheck size={12} className="inline mr-1" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Clock size={12} className="inline mr-1" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className={labelClass}>
              <Clock size={12} className="inline mr-1" /> Duration
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDuration(d.value)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedDuration === d.value
                      ? 'bg-[#3D84ED] border-blue-400 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {selectedDuration === 0 && (
              <input
                type="number"
                min="0.5"
                step="0.5"
                placeholder="Enter hours (e.g. 1.5)"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className={inputClass + ' mt-2'}
              />
            )}
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>
              <MapPin size={12} className="inline mr-1" /> Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Studio address, city, or 'Remote / Online'"
              className={inputClass}
            />
          </div>

          {/* Offer Amount */}
          <div>
            <label className={labelClass}>
              <DollarSign size={12} className="inline mr-1" /> Offer Amount (USD)
              {suggestedRate && (
                <span className="ml-2 text-blue-400 normal-case">
                  Suggested: ${suggestedRate}/hr
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
              <input
                type="number"
                min="0"
                step="5"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="0.00"
                className={inputClass + ' pl-8'}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className={labelClass}>
              <MessageSquare size={12} className="inline mr-1" /> Message / Notes
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Tell ${talentName} about your project...`}
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

        </form>

        {/* Warning Box */}
        {showIncompleteWarning && !isRoleComplete(selectedRole) && (
          <div className="mx-6 mb-4 mt-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
             <div className="p-2 bg-red-500/20 rounded-full shrink-0">
               <AlertTriangle size={20} className="text-red-400" />
             </div>
             <div>
               <h4 className="text-red-400 font-bold text-[13px] mb-1">Incomplete Profile Alert</h4>
               <p className="text-red-400/80 text-[11px] font-semibold leading-relaxed">
                 {talentName} has not fully set up their portfolio or hourly rates for the <strong>{selectedRole}</strong> role. Are you sure you still want to send a booking request?
               </p>
             </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-bold text-sm transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !serviceType}
            className={`flex-[2] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              showIncompleteWarning && !isRoleComplete(selectedRole)
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20' 
                : 'bg-[#3D84ED] hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Sending Request...</>
            ) : (showIncompleteWarning && !isRoleComplete(selectedRole)) ? (
              <><AlertTriangle size={16} /> Yes, Send Anyway</>
            ) : (
              <><CalendarCheck size={16} /> Send Booking Request</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

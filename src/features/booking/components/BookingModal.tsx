import React from 'react';
import { X, Calendar, Clock, DollarSign, MessageSquare, Loader2, Music, AlertCircle, User, Briefcase, FileText } from 'lucide-react';
import { GENRE_DATA } from '@/config/constants';
import type { AccountType, TalentSubRole } from '@/types';
import { useBookingForm } from '../hooks/useBookingForm';

// =====================================================
// INTERFACES AND TYPES
// =====================================================

export interface BookingModalProps {
  user?: {
    id: string;
    uid?: string;
  };
  userData: {
    id: string;
    firstName?: string;
    lastName?: string;
    accountTypes?: AccountType[];
    talentSubRole?: TalentSubRole;
  };
  target: {
    id: string;
    firstName?: string;
    name?: string;
    rate?: number;
    accountTypes?: AccountType[];
    talentSubRole?: TalentSubRole;
  };
  onClose: () => void;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function BookingModal({ user, userData, target, onClose }: BookingModalProps) {
    const {
        form,
        updateForm,
        handleDurationChange,
        handleSubmit,
        loading,
        roster,
        bookOnBehalf,
        setBookOnBehalf,
        isAgentOrLabel,
        serviceTypes
    } = useBookingForm({ user, userData, target, onClose });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white dark:bg-[#2c2e36] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">

                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f]">
                    <div>
                        <h3 className="font-bold text-lg dark:text-white">Book Session</h3>
                        <p className="text-xs text-gray-500">with <span className="text-brand-blue font-bold">{target.firstName || target.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500 dark:text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-5">
                    {/* PROXY SELECTOR */}
                    {isAgentOrLabel && roster.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800">
                            <label className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase mb-1 flex items-center gap-1">
                                <Briefcase size={12}/> Booking On Behalf Of:
                            </label>
                            <select
                                className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-purple-800/50 dark:text-white text-sm font-bold"
                                value={bookOnBehalf}
                                onChange={e => setBookOnBehalf(e.target.value)}
                            >
                                <option value="me">Myself ({userData?.firstName || 'User'})</option>
                                {roster.map(r => (
                                    <option key={r.artistId} value={r.artistId}>
                                        Artist: {r.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Standard Rates Info */}
                    {target.rate && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                            <AlertCircle size={14}/>
                            <span>Standard Rate: <strong>${target.rate}/hr</strong></span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                <input
                                    type="date"
                                    className="w-full pl-10 p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    value={form.date}
                                    onChange={e => updateForm({ date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                                <input
                                    type="time"
                                    className="w-full pl-10 p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    value={form.time}
                                    onChange={e => updateForm({ time: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Duration (Hrs)</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm font-bold"
                                value={form.duration}
                                onChange={handleDurationChange}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Total Offer ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 text-green-500" size={16}/>
                                <input
                                    type="number"
                                    className="w-full pl-9 p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm font-bold text-green-600"
                                    value={form.offerAmount}
                                    onChange={e => updateForm({ offerAmount: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Service Type</label>
                        <select
                            className="w-full p-2.5 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                            value={form.serviceType}
                            onChange={e => updateForm({ serviceType: e.target.value })}
                        >
                            {serviceTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Project Details Section - Helps talent understand the gig */}
                    <div className="bg-gray-50 dark:bg-[#23262f] p-4 rounded-xl border dark:border-gray-700 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
                            <FileText size={14} /> Project Details (Optional)
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Project Type</label>
                                <select
                                    className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    value={form.projectType}
                                    onChange={e => updateForm({ projectType: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    <option>Single Release</option>
                                    <option>EP / Album</option>
                                    <option>Live Performance</option>
                                    <option>Cover Song</option>
                                    <option>Demo Recording</option>
                                    <option>Commercial / Jingle</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Genre</label>
                                <select
                                    className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                    value={form.projectGenre}
                                    onChange={e => updateForm({ projectGenre: e.target.value })}
                                >
                                    <option value="">Select...</option>
                                    {GENRE_DATA.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Reference Links (YouTube, Spotify, etc.)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
                                placeholder="Paste links to reference tracks..."
                                value={form.referenceLinks}
                                onChange={e => updateForm({ referenceLinks: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Message / Requirements</label>
                        <textarea
                            className="w-full p-3 border rounded-xl dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm min-h-[100px] resize-none"
                            placeholder="Describe what you need, any specific style, key references..."
                            value={form.message}
                            onChange={e => updateForm({ message: e.target.value })}
                        />
                    </div>
                </div>

                <div className="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-[#23262f]">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : "Send Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}

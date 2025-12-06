import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign, CheckCircle, Play, Mic2, Car, FileText, User, ChevronRight } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Tracker Steps Configuration
const TRACKER_STEPS = [
    { id: 'Pending', label: 'Created', icon: Calendar },
    { id: 'Confirmed', label: 'Deposit', icon: DollarSign },
    { id: 'En Route', label: 'En Route', icon: Car },
    { id: 'In Progress', label: 'Started', icon: Mic2 },
    { id: 'Completed', label: 'Done', icon: CheckCircle }
];

export default function SessionDetailsModal({ booking, user, onClose }) {
    const [status, setStatus] = useState(booking.status);
    const [loading, setLoading] = useState(false);

    const isProvider = user.uid === booking.targetId; // The person who was booked (Talent/Studio)
    const isClient = user.uid === booking.senderId; // The person who booked

    // Helper to get current step index (0-4)
    const getCurrentStepIndex = (currentStatus) => {
        const idx = TRACKER_STEPS.findIndex(s => s.id === currentStatus);
        return idx === -1 ? 0 : idx;
    };

    const currentStepIndex = getCurrentStepIndex(status);

    const updateStatus = async (newStatus) => {
        setLoading(true);
        try {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/bookings`, booking.id), {
                status: newStatus,
                [`statusTimestamps.${newStatus}`]: serverTimestamp()
            });
            setStatus(newStatus);
            toast.success(`Session ${newStatus}`);
        } catch (e) {
            console.error("Update failed:", e);
            toast.error("Failed to update status");
        }
        setLoading(false);
    };

    // Calculate progress bar width (0% to 100%)
    const progressPercent = (currentStepIndex / (TRACKER_STEPS.length - 1)) * 100;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[90] p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#2c2e36] w-full max-w-3xl rounded-2xl shadow-2xl border dark:border-gray-700 flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f]">
                    <div>
                        <h2 className="text-xl font-extrabold dark:text-white flex items-center gap-2">
                            Session Details <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium">#{booking.id.slice(-6).toUpperCase()}</span>
                        </h2>
                        <p className="text-sm text-gray-500">With {isClient ? booking.targetName : booking.senderName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={20}/></button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8">
                    
                    {/* --- PIZZA TRACKER --- */}
                    <div className="relative pt-4 pb-8 px-4">
                        {/* Connecting Bar Background */}
                        <div className="absolute top-8 left-0 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full -z-10"></div>
                        
                        {/* Connecting Bar Progress */}
                        <div 
                            className="absolute top-8 left-0 h-1.5 bg-brand-blue rounded-full -z-10 transition-all duration-700 ease-in-out" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>

                        <div className="flex justify-between">
                            {TRACKER_STEPS.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                
                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2">
                                        <div 
                                            className={`
                                                w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                                ${isCompleted ? 'bg-brand-blue border-white dark:border-[#2c2e36] text-white' : 'bg-gray-200 dark:bg-gray-700 border-white dark:border-[#2c2e36] text-gray-400'}
                                                ${isCurrent ? 'scale-125 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50' : ''}
                                            `}
                                        >
                                            <step.icon size={isCurrent ? 18 : 16} fill={isCompleted ? "currentColor" : "none"} />
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isCompleted ? 'text-brand-blue' : 'text-gray-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status Actions (Only for Provider) */}
                    {isProvider && status !== 'Completed' && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Update Session Status</h4>
                                <p className="text-xs text-blue-600 dark:text-blue-400">Keep the client informed.</p>
                            </div>
                            <div className="flex gap-2">
                                {status === 'Pending' && (
                                    <button onClick={() => updateStatus('Confirmed')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition shadow-sm">Accept & Confirm</button>
                                )}
                                {status === 'Confirmed' && (
                                    <button onClick={() => updateStatus('En Route')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition shadow-sm flex items-center gap-1"><Car size={14}/> I'm En Route</button>
                                )}
                                {status === 'En Route' && (
                                    <button onClick={() => updateStatus('In Progress')} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-purple-700 transition shadow-sm flex items-center gap-1"><Play size={14}/> Start Session</button>
                                )}
                                {status === 'In Progress' && (
                                    <button onClick={() => updateStatus('Completed')} className="bg-gray-900 dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg font-bold text-xs hover:opacity-90 transition shadow-sm flex items-center gap-1"><CheckCircle size={14}/> Complete Session</button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase border-b dark:border-gray-700 pb-2">Logistics</h3>
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><Calendar size={20} className="text-brand-blue"/></div>
                                <div><div className="text-xs text-gray-500 uppercase font-bold">Date</div><div className="dark:text-white font-medium">{booking.date}</div></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><Clock size={20} className="text-brand-blue"/></div>
                                <div><div className="text-xs text-gray-500 uppercase font-bold">Time</div><div className="dark:text-white font-medium">{booking.time} ({booking.duration} hrs)</div></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><MapPin size={20} className="text-brand-blue"/></div>
                                <div><div className="text-xs text-gray-500 uppercase font-bold">Location</div><div className="dark:text-white font-medium">{booking.venue?.name || 'Remote / TBD'}</div></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase border-b dark:border-gray-700 pb-2">Financials</h3>
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><DollarSign size={20} className="text-green-600"/></div>
                                <div><div className="text-xs text-gray-500 uppercase font-bold">Total Value</div><div className="dark:text-white font-mono font-bold text-lg">${booking.offerAmount}</div></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><FileText size={20} className="text-gray-500"/></div>
                                <div><div className="text-xs text-gray-500 uppercase font-bold">Agreement</div><div className="text-brand-blue text-xs font-bold cursor-pointer hover:underline">View Contract</div></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Message / Note */}
                    {booking.message && (
                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border dark:border-gray-700">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Notes</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{booking.message}"</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

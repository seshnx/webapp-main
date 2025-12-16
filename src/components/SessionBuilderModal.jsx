import React, { useState } from 'react';
import { X, Calendar, Clock, DollarSign, Users, Trash2, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';

const sessionSchema = z.object({
    sessionName: z.string().min(3, "Session name must be at least 3 chars"),
    // Removed strict date/time validation to allow empty/flexible
    date: z.string().optional(),
    time: z.string().optional(),
    duration: z.number().min(1).max(24),
});

export default function SessionBuilderModal({ user, userData, cart, onRemoveFromCart, onClose, onComplete }) {
    const [loading, setLoading] = useState(false);
    
    const { 
        register, 
        handleSubmit, 
        watch, 
        formState: { errors, isValid } 
    } = useForm({
        resolver: zodResolver(sessionSchema),
        defaultValues: {
            sessionName: `${userData.lastName} Session`,
            duration: 4,
            date: '',
            time: ''
        },
        mode: "onChange"
    });

    const watchedDuration = watch('duration') || 0;

    const calculateTotals = () => {
        let subtotal = 0;
        const safeDuration = parseInt(watchedDuration) || 0;

        const lineItems = cart.map(item => {
            const hourlyRate = item.rate || 0;
            const itemTotal = hourlyRate * safeDuration;
            subtotal += itemTotal;
            return { ...item, itemTotal, hourlyRate };
        });

        const shouldDiscount = cart.length >= 3;
        const discountAmount = shouldDiscount ? (subtotal * 0.10) : 0;
        const finalTotal = subtotal - discountAmount;

        return { subtotal, discountAmount, finalTotal, lineItems, shouldDiscount };
    };

    const { subtotal, discountAmount, finalTotal, lineItems, shouldDiscount } = calculateTotals();

    const onSubmit = async (data) => {
        setLoading(true);
        const toastId = toast.loading('Initializing Session...');

        try {
            // TEMPORARILY DISABLED: Firebase Functions not available
            // Payment functionality disabled - sessions can still be created without payment
            let paymentIntentId = null;
            
            /* const functions = getFunctions();
            // Optional: Check if payment is needed (if total > 0)
            
            if (finalTotal > 0) {
                const createSplitPayment = httpsCallable(functions, 'createSplitPayment');
                const paymentPayload = {
                    totalAmount: finalTotal,
                    description: `Session: ${data.sessionName}`,
                    transfers: lineItems.map(item => ({
                        recipientId: item.id,
                        amount: item.itemTotal * (shouldDiscount ? 0.9 : 1.0),
                        role: item.accountTypes?.[0] || 'Creative'
                    }))
                };
                const { data: paymentResult } = await createSplitPayment(paymentPayload);
                if (!paymentResult.clientSecret) throw new Error("Payment initialization failed");
                paymentIntentId = paymentResult.paymentIntentId;
            } */

            if (!supabase) throw new Error('Supabase not initialized');
            
            const userId = user?.id || user?.uid;
            const groupId = `session_${Date.now()}`;
            const bookingPromises = lineItems.map(item => {
                return supabase
                    .from('bookings')
                    .insert({
                        group_id: groupId,
                        session_name: data.sessionName,
                        sender_id: userId,
                        sender_name: `${userData.firstName} ${userData.lastName}`,
                        target_id: item.id,
                        target_name: `${item.firstName} ${item.lastName}`,
                        service_type: item.accountTypes?.[0] || 'Session',
                        date: data.date || 'Flexible',
                        time: data.time || 'Flexible',
                        duration: data.duration,
                        offer_amount: item.itemTotal * (shouldDiscount ? 0.9 : 1.0),
                        status: 'Pending',
                        payment_intent_id: paymentIntentId,
                        timestamp: new Date().toISOString(),
                        type: 'GroupSession'
                    });
            });

            await Promise.all(bookingPromises);

            toast.success(`Session Created!`, { id: toastId });
            onComplete(); 

        } catch (error) {
            console.error("Booking Error:", error);
            toast.error("Failed: " + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (error) => twMerge(
        "w-full p-2 border rounded-lg dark:bg-black/20 dark:text-white transition-colors focus:ring-2 focus:ring-brand-blue outline-none",
        error ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-600"
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in">
            <form 
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white dark:bg-[#2c2e36] w-full max-w-2xl rounded-2xl shadow-2xl border dark:border-gray-700 flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#23262f] rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-extrabold dark:text-white flex items-center gap-2">
                            <Users className="text-brand-blue"/> Session Builder
                        </h2>
                        <p className="text-xs text-gray-500">{cart.length} Members Selected</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Session Name</label>
                                <input {...register("sessionName")} className={inputClass(errors.sessionName)} placeholder="e.g. My Album Recording" />
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date (Optional)</label>
                                    <input type="date" {...register("date")} className={inputClass(errors.date)} />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Time (Optional)</label>
                                    <input type="time" {...register("time")} className={inputClass(errors.time)} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Duration (Hours)</label>
                                <input type="number" {...register("duration", { valueAsNumber: true })} className={inputClass(errors.duration)} />
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border dark:border-gray-700">
                            <h3 className="text-sm font-bold dark:text-white mb-3">Session Roster</h3>
                            <div className="space-y-2">
                                {cart.map((member) => (
                                    <div key={member.id} className="flex justify-between items-center bg-white dark:bg-[#2c2e36] p-2 rounded-lg border dark:border-gray-600 shadow-sm animate-in slide-in-from-right-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{member.firstName[0]}</div>
                                            <div>
                                                <div className="text-xs font-bold dark:text-white">{member.firstName} {member.lastName}</div>
                                                <div className="text-[10px] text-gray-500">{member.accountTypes?.[0]}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono">${member.rate}/hr</span>
                                            <button type="button" onClick={() => onRemoveFromCart(member.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                                {cart.length === 0 && <div className="text-center text-xs text-gray-400 py-4 italic">No members added yet.</div>}
                            </div>
                        </div>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2"><DollarSign size={20}/> Cost Breakdown</h3>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 transition-all">
                            <div className="space-y-2 mb-4 text-sm">
                                {lineItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-blue-900 dark:text-blue-100">
                                        <span>{item.firstName} ({item.accountTypes[0]}) x {watchedDuration}hrs</span>
                                        <span className="font-mono">${item.itemTotal.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-blue-200 dark:border-blue-700 pt-2 flex justify-between items-center">
                                <span className="text-blue-800 dark:text-blue-300 font-bold">Subtotal</span>
                                <span className="text-blue-800 dark:text-blue-300 font-bold font-mono">${subtotal.toFixed(2)}</span>
                            </div>

                            {shouldDiscount && (
                                <div className="flex justify-between items-center text-green-600 dark:text-green-400 font-bold mt-2 animate-in slide-in-from-right-2">
                                    <span className="flex items-center gap-1"><Zap size={14} fill="currentColor"/> Bundle Discount (10%)</span>
                                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4 text-2xl font-black dark:text-white">
                                <span>Total Due</span>
                                <span className="font-mono">${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-[#23262f] rounded-b-2xl">
                    <button 
                        type="submit"
                        disabled={loading || cart.length === 0 || !isValid}
                        className={clsx(
                            "w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2",
                            loading || cart.length === 0 || !isValid
                                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-brand-blue text-white hover:bg-blue-600 hover:scale-[1.01]"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin"/> : <><CheckCircle size={20}/> Confirm & Book</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

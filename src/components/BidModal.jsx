import React, { useState } from 'react';
import { X, DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
export default function BidModal({ user, userData, broadcast, onClose }) {
    const [bidRate, setBidRate] = useState(Math.floor((broadcast.offer_amount || broadcast.offerAmount) / (broadcast.duration || 1)));
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate total based on rate * duration
    const totalBid = bidRate * (broadcast.duration || 1);
    const maxBudget = broadcast.offer_amount || broadcast.offerAmount; 
    const isOverBudget = totalBid > maxBudget;

    const handleSubmit = async () => {
        if (!bidRate || !message) return alert("Please enter a rate and a message.");
        if (isOverBudget) return alert("Your bid exceeds the client's budget.");

        if (!supabase) {
            alert("Database unavailable.");
            return;
        }

        setIsSubmitting(true);
        try {
            const userId = user?.id || user?.uid;
            
            // Save as a standard booking request in Supabase
            // This ensures it uses existing permissions and appears in the 
            // broadcaster's "Incoming Requests" dashboard automatically.
            const { error } = await supabase
                .from('bookings')
                .insert({
                    type: 'Bid', // Distinguish this from a regular 'Direct' booking
                    broadcast_id: broadcast.id, // Reference the original broadcast
                    
                    // Routing: Send this TO the broadcaster
                    target_id: broadcast.sender_id || broadcast.senderId, 
                    target_name: broadcast.sender_name || broadcast.senderName,
                    
                    // Sender Info (The Pro bidding)
                    sender_id: userId,
                    sender_name: userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User' : 'User',
                    
                    // Details
                    service_type: `Bid: ${broadcast.service_type || broadcast.serviceType || 'Session'}`,
                    offer_amount: totalBid,
                    rate_per_hour: parseInt(bidRate),
                    message: message,
                    
                    // Metadata
                    status: 'Pending',
                    date: 'Flexible', // Bids on broadcasts usually imply flexibility
                    timestamp: new Date().toISOString()
                });

            if (error) throw error;

            alert("Bid submitted successfully! The client has been notified.");
            onClose();
        } catch (e) {
            console.error("Error submitting bid:", e);
            alert("Failed to submit bid: " + (e.message || "Unknown error"));
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-[#2c2e36] rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95">
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white">Place Your Bid</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-white"/></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Client's Budget</div>
                        <div className="text-2xl font-extrabold dark:text-white">${maxBudget} <span className="text-sm font-normal text-gray-500">Total ({broadcast.duration} hrs)</span></div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">Your Hourly Rate ($)</label>
                        <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                            <input 
                                type="number" 
                                className={`w-full pl-8 p-3 border rounded-xl font-bold text-lg outline-none dark:bg-[#1f2128] dark:text-white ${isOverBudget ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-brand-blue'}`}
                                value={bidRate}
                                onChange={e => setBidRate(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-2 text-sm">
                            <span className="text-gray-500">Total Bid:</span>
                            <span className={`font-bold ${isOverBudget ? 'text-red-500' : 'text-green-600'}`}>${totalBid}</span>
                        </div>
                        {isOverBudget && <div className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> Bid exceeds budget. Consider lowering your rate.</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">Message to Client</label>
                        <textarea 
                            className="w-full p-3 border rounded-xl text-sm dark:bg-[#1f2128] dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                            rows="3"
                            placeholder="Introduce yourself and your gear..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || isOverBudget}
                        className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin"/> : "Submit Proposal"}
                    </button>
                </div>
            </div>
        </div>
    );
}

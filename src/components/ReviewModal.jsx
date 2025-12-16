import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabase';
import StarRating from './shared/StarRating';

export default function ReviewModal({ user, targetId, targetName, onClose, bookingId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) return alert("Please write a comment.");
    if (!supabase) {
      alert("Database unavailable.");
      return;
    }
    setSubmitting(true);
    
    try {
      const userId = user?.id || user?.uid;
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: userId,
          reviewer_name: user.displayName || "Verified User",
          target_id: targetId,
          booking_id: bookingId || null,
          rating: rating,
          comment: comment,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      onClose();
      alert("Review submitted!");
    } catch (e) {
      console.error("Review error:", e);
      alert("Failed to submit review.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-[#2c2e36] rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg dark:text-white">Review {targetName}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        
        <div className="flex flex-col items-center mb-6 space-y-2">
          <label className="text-sm text-gray-500">Rate your experience</label>
          <StarRating rating={rating} setRating={setRating} interactive={true} size={32} />
        </div>

        <textarea 
          className="w-full p-3 border rounded-lg mb-4 dark:bg-[#1f2128] dark:border-gray-600 dark:text-white text-sm"
          rows="4"
          placeholder={`How was working with ${targetName}?`}
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="w-full bg-brand-blue text-white py-2.5 rounded-lg font-bold hover:bg-blue-600 transition disabled:opacity-50 flex justify-center"
        >
          {submitting ? <Loader2 className="animate-spin" /> : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

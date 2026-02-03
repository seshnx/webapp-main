import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import StarRating from './shared/StarRating';

/**
 * User interface for current user
 */
interface ReviewUser {
    id?: string;
    uid?: string;
    displayName?: string;
}

/**
 * Props for ReviewModal component
 */
export interface ReviewModalProps {
    /** Current authenticated user */
    user: ReviewUser | null;
    /** ID of the user being reviewed */
    targetId: string;
    /** Name of the user being reviewed */
    targetName: string;
    /** Optional booking ID associated with the review */
    bookingId?: string;
    /** Callback when modal is closed */
    onClose: () => void;
}

/**
 * ReviewModal Component
 *
 * Allows users to submit reviews for other users after a booking or interaction.
 *
 * @example
 * <ReviewModal
 *   user={currentUser}
 *   targetId="123"
 *   targetName="John Doe"
 *   bookingId="booking-456"
 *   onClose={() => setShowModal(false)}
 * />
 */
export default function ReviewModal({
    user,
    targetId,
    targetName,
    onClose,
    bookingId
}: ReviewModalProps) {
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    const handleSubmit = async (): Promise<void> => {
        if (!comment.trim()) return alert("Please write a comment.");

        setSubmitting(true);

        try {
            const userId = user?.id || user?.uid;

            // TODO: Implement Neon review submission
            // Example: await submitReview({ reviewerId: userId, targetId, rating, comment, bookingId })

            // For now, simulate submission
            await new Promise(resolve => setTimeout(resolve, 1000));

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
                    rows={4}
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

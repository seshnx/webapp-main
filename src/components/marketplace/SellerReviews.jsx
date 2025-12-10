import { useState } from 'react';
import { 
    Star, ThumbsUp, Flag, Trash2, ChevronDown, ChevronUp,
    User, ShieldCheck, AlertCircle, Loader2
} from 'lucide-react';
import { useSellerReviews, useSellerRating } from '../../hooks/useSellerReviews';

/**
 * Star Rating Display Component
 */
export function StarRating({ rating, size = 16, showValue = true }) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} size={size} fill="#facc15" className="text-yellow-400" />
                ))}
                {hasHalf && (
                    <div className="relative">
                        <Star size={size} className="text-gray-300" />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                            <Star size={size} fill="#facc15" className="text-yellow-400" />
                        </div>
                    </div>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} size={size} className="text-gray-300" />
                ))}
            </div>
            {showValue && (
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

/**
 * Interactive Star Rating Input
 */
export function StarRatingInput({ value, onChange, size = 24 }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        size={size}
                        fill={(hover || value) >= star ? '#facc15' : 'none'}
                        className={(hover || value) >= star ? 'text-yellow-400' : 'text-gray-300'}
                    />
                </button>
            ))}
        </div>
    );
}

/**
 * Seller Rating Badge (compact display for listings)
 */
export function SellerRatingBadge({ sellerId, size = 'default' }) {
    const { rating, reviewCount, loading } = useSellerRating(sellerId);

    if (loading || !rating) return null;

    const sizeClasses = {
        small: 'text-xs px-1.5 py-0.5',
        default: 'text-sm px-2 py-1',
        large: 'text-base px-3 py-1.5'
    };

    return (
        <div className={`flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full ${sizeClasses[size]}`}>
            <Star size={size === 'small' ? 10 : size === 'large' ? 16 : 12} fill="#facc15" className="text-yellow-400" />
            <span className="font-bold text-gray-700 dark:text-gray-200">{rating.toFixed(1)}</span>
            <span className="text-gray-400">({reviewCount})</span>
        </div>
    );
}

/**
 * Review Submission Form
 */
export function ReviewForm({ sellerId, userId, userName, userPhoto, orderId, itemId, itemTitle, onSuccess, onCancel }) {
    const { submitReview } = useSellerReviews(sellerId);
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setSubmitting(true);
        const success = await submitReview({
            reviewerId: userId,
            reviewerName: userName,
            reviewerPhoto: userPhoto,
            rating,
            title,
            comment,
            orderId,
            itemId,
            itemTitle
        });
        setSubmitting(false);

        if (success && onSuccess) {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#2c2e36] rounded-xl p-6 border dark:border-gray-700">
            <h3 className="text-lg font-bold dark:text-white mb-4">Write a Review</h3>

            <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    Your Rating
                </label>
                <StarRatingInput value={rating} onChange={setRating} />
            </div>

            <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Review Title (Optional)
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white"
                />
            </div>

            <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Your Review
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this seller..."
                    rows={4}
                    className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white resize-none"
                />
            </div>

            <div className="flex gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={rating === 0 || submitting}
                    className="flex-1 bg-brand-blue hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Review'}
                </button>
            </div>
        </form>
    );
}

/**
 * Single Review Card
 */
function ReviewCard({ review, currentUserId, onMarkHelpful, onReport, onDelete }) {
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const isOwnReview = review.reviewerId === currentUserId;
    const formattedDate = review.createdAt instanceof Date 
        ? review.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Unknown date';

    return (
        <div className="bg-white dark:bg-[#2c2e36] rounded-xl p-4 border dark:border-gray-700">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {review.reviewerPhoto ? (
                        <img 
                            src={review.reviewerPhoto} 
                            alt={review.reviewerName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User size={20} className="text-gray-400" />
                        </div>
                    )}
                    <div>
                        <div className="font-medium dark:text-white flex items-center gap-2">
                            {review.reviewerName}
                            {review.verified && (
                                <ShieldCheck size={14} className="text-green-500" title="Verified Purchase" />
                            )}
                        </div>
                        <div className="text-xs text-gray-500">{formattedDate}</div>
                    </div>
                </div>
                <StarRating rating={review.rating} size={14} showValue={false} />
            </div>

            {/* Content */}
            {review.title && (
                <h4 className="font-bold dark:text-white mb-1">{review.title}</h4>
            )}
            {review.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{review.comment}</p>
            )}
            {review.itemTitle && (
                <div className="text-xs text-gray-500 mb-3">
                    Purchased: {review.itemTitle}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 text-xs">
                <button
                    onClick={() => onMarkHelpful(review.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition"
                >
                    <ThumbsUp size={12} />
                    Helpful ({review.helpful || 0})
                </button>

                {isOwnReview ? (
                    <button
                        onClick={() => onDelete(review.id, currentUserId)}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition"
                    >
                        <Trash2 size={12} />
                        Delete
                    </button>
                ) : (
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition"
                    >
                        <Flag size={12} />
                        Report
                    </button>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
                    <div className="bg-white dark:bg-[#2c2e36] rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-500" />
                            Report Review
                        </h3>
                        <select
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full p-3 border rounded-lg dark:bg-[#1f2128] dark:border-gray-600 dark:text-white mb-4"
                        >
                            <option value="">Select a reason...</option>
                            <option value="spam">Spam or fake review</option>
                            <option value="offensive">Offensive content</option>
                            <option value="irrelevant">Not relevant to the seller</option>
                            <option value="other">Other</option>
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="flex-1 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onReport(review.id, reportReason);
                                    setShowReportModal(false);
                                }}
                                disabled={!reportReason}
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                            >
                                Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Full Seller Reviews Section
 */
export default function SellerReviews({ sellerId, currentUserId }) {
    const { reviews, stats, loading, markHelpful, reportReview, deleteReview } = useSellerReviews(sellerId);
    const [expanded, setExpanded] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    const displayedReviews = expanded ? reviews : reviews.slice(0, 3);

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            <div className="bg-white dark:bg-[#2c2e36] rounded-xl p-4 border dark:border-gray-700">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold dark:text-white">{stats.averageRating.toFixed(1)}</div>
                        <StarRating rating={stats.averageRating} size={14} showValue={false} />
                        <div className="text-xs text-gray-500 mt-1">{stats.totalReviews} reviews</div>
                    </div>
                    
                    {/* Rating Distribution */}
                    <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = stats.ratingDistribution[star] || 0;
                            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                    <span className="w-4 text-gray-500">{star}</span>
                                    <Star size={10} fill="#facc15" className="text-yellow-400" />
                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-yellow-400 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-gray-400 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Star size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>No reviews yet</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {displayedReviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                currentUserId={currentUserId}
                                onMarkHelpful={markHelpful}
                                onReport={reportReview}
                                onDelete={deleteReview}
                            />
                        ))}
                    </div>

                    {reviews.length > 3 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full py-2 text-sm font-medium text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition flex items-center justify-center gap-1"
                        >
                            {expanded ? (
                                <>Show Less <ChevronUp size={16} /></>
                            ) : (
                                <>Show All {reviews.length} Reviews <ChevronDown size={16} /></>
                            )}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

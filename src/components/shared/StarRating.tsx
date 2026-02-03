import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Star rating component props
 */
export interface StarRatingProps {
  /** Current rating (0-5) */
  rating?: number;
  /** Rating change handler (required if interactive) */
  setRating?: (rating: number) => void;
  /** Enable interactive rating (click to rate) */
  interactive?: boolean;
  /** Star size in pixels */
  size?: number;
}

/**
 * Star Rating Component
 *
 * Displays a 5-star rating with optional interactive rating functionality.
 *
 * @param props - Star rating props
 * @returns Star rating component
 *
 * @example
 * // Static display
 * <StarRating rating={4} />
 *
 * @example
 * // Interactive rating
 * <StarRating rating={3} setRating={(r) => console.log(r)} interactive />
 *
 * @example
 * // Custom size
 * <StarRating rating={5} size={24} />
 */
export default function StarRating({
  rating = 0,
  setRating,
  interactive = false,
  size = 16
}: StarRatingProps): React.ReactElement {
  const [hover, setHover] = useState<number>(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`transition-colors ${interactive ? 'cursor-pointer' : ''} ${
            (interactive ? hover || rating : rating) >= star
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
          fill={(interactive ? hover || rating : rating) >= star ? "currentColor" : "none"}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && setRating?.(star)}
        />
      ))}
    </div>
  );
}

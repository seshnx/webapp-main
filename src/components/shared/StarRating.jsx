import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, setRating, interactive = false, size = 16 }) {
  const [hover, setHover] = useState(0);

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
          onClick={() => interactive && setRating(star)}
        />
      ))}
    </div>
  );
}

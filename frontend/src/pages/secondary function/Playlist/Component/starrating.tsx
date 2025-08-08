import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }
function StarRating( {rating, onRatingChange, readonly = false,  size = 'md'}: StarRatingProps) {

    const [hoveredRating, setHoveredRating] = useState<number>(0);
  
        const sizeClasses = {
            sm: 'w-4 h-4',
            md: 'w-6 h-6',
            lg: 'w-8 h-8'
        };

        const handleClick = (starRating: number) => {
            if (!readonly && onRatingChange) {
            onRatingChange(starRating);
            }
        };

        const handleMouseEnter = (starRating: number) => {
            if (!readonly) {
            setHoveredRating(starRating);
            }
        };

        const handleMouseLeave = () => {
            if (!readonly) {
            setHoveredRating(0);
            }
        };

    return(
        <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} 
              transition-all duration-200 
              ${!readonly ? 'focus:outline-none ' : ''}
            `}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                ${star <= (hoveredRating || rating) 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
                }
                transition-colors duration-200
              `}
            />
          </button>
        ))}
      </div>
    )
}
export default StarRating
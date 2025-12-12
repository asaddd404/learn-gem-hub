import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function RatingDisplay({ 
  rating, 
  size = 'md', 
  showLabel = false,
  className 
}: RatingDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div 
        className={cn(
          'flex items-center gap-2 font-display font-bold text-rating-purple',
          sizeClasses[size]
        )}
      >
        <Star 
          size={iconSizes[size]} 
          className="fill-rating-purple text-rating-purple"
        />
        <span>{rating.toLocaleString()}</span>
      </div>
      {showLabel && (
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Рейтинг
        </span>
      )}
    </div>
  );
}

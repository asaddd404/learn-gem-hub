import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};

export function CoinDisplay({ 
  amount, 
  size = 'md', 
  showLabel = false, 
  animate = false,
  className 
}: CoinDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div 
        className={cn(
          'flex items-center gap-2 font-display font-bold text-gradient-coin',
          sizeClasses[size],
          animate && 'animate-coin-bounce'
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-coin rounded-full blur-md opacity-40 animate-pulse-glow" />
          <Coins 
            size={iconSizes[size]} 
            className="relative text-coin-gold drop-shadow-lg"
          />
        </div>
        <span>{amount.toLocaleString()}</span>
      </div>
      {showLabel && (
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          EduCoins
        </span>
      )}
    </div>
  );
}

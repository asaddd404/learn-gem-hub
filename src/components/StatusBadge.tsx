import { cn } from '@/lib/utils';

type StatusType = 'waiting' | 'ready' | 'completed';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  waiting: {
    label: 'Ждем подтверждения',
    className: 'status-waiting',
  },
  ready: {
    label: 'Можно забирать!',
    className: 'status-ready',
  },
  completed: {
    label: 'Получено',
    className: 'status-completed',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.waiting;
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?:   'line' | 'circle' | 'card' | 'stat';
  lines?:     number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'card',
  lines   = 3,
}) => {
  if (variant === 'circle') return (
    <div className={cn('skeleton rounded-full', className)} />
  );

  if (variant === 'line') return (
    <div className={cn('skeleton h-3 rounded', className)} />
  );

  if (variant === 'stat') return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="line" className="w-20" />
        <div className="skeleton w-4 h-4 rounded" />
      </div>
      <Skeleton variant="line" className="w-28 h-6" />
      <Skeleton variant="line" className="w-12" />
    </div>
  );

  // card
  return (
    <div className={cn('card space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="line" className="w-3/4" />
          <Skeleton variant="line" className="w-1/2" />
        </div>
      </div>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} variant="line" className={i % 2 === 0 ? 'w-full' : 'w-4/5'} />
      ))}
    </div>
  );
};

export const StatSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} variant="stat" />
    ))}
  </div>
);

export const AgentCardSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} variant="card" lines={4} />
    ))}
  </div>
);

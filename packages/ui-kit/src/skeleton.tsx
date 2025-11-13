import { cn } from './utils';

type SkeletonProps = {
  readonly className?: string;
  readonly variant?: 'text' | 'circular' | 'rectangular';
};

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-800/60',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4',
        className
      )}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  readonly lines?: number;
  readonly className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={`skeleton-line-${i}`}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

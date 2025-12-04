import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshContainerProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({
  children,
  onRefresh,
  className,
}) => {
  const { pullDistance, isRefreshing, handlers } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    maxPull: 120,
  });

  const showIndicator = pullDistance > 0 || isRefreshing;
  const indicatorProgress = Math.min(pullDistance / 80, 1);

  return (
    <div className={cn('relative', className)}>
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-0 right-0 flex items-center justify-center transition-all duration-200 overflow-hidden z-10',
          showIndicator ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: showIndicator ? Math.max(pullDistance, isRefreshing ? 40 : 0) : 0,
          top: 0,
        }}
      >
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md border border-gray-200',
            isRefreshing && 'animate-pulse'
          )}
        >
          <RefreshCw
            className={cn(
              'w-5 h-5 text-gray-600 transition-transform',
              isRefreshing && 'animate-spin'
            )}
            style={{
              transform: isRefreshing
                ? undefined
                : `rotate(${indicatorProgress * 360}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content container */}
      <div
        className={cn(
          'overflow-y-auto transition-transform duration-200',
          className
        )}
        style={{
          transform: showIndicator ? `translateY(${pullDistance}px)` : undefined,
        }}
        {...handlers}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefreshContainer;

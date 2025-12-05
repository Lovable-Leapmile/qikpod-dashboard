import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface MobileCardSkeletonProps {
  variant?: 'default' | 'location' | 'pod' | 'reservation' | 'log' | 'notification';
  count?: number;
}

const DefaultSkeleton = () => (
  <Card className="bg-white shadow-sm rounded-xl border-gray-200">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </CardContent>
  </Card>
);

const LocationSkeleton = () => (
  <Card className="bg-white shadow-sm rounded-xl border-gray-200">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-12 mb-1" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-full max-w-[200px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const PodSkeleton = () => (
  <Card className="bg-white shadow-sm rounded-xl border-gray-200">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 flex items-center space-x-3">
          <Skeleton className="h-5 w-5 rounded" />
          <div>
            <Skeleton className="h-4 w-12 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </CardContent>
  </Card>
);

const ReservationSkeleton = () => (
  <Card className="bg-white shadow-sm rounded-xl border-gray-200">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </CardContent>
  </Card>
);

const LogSkeleton = () => (
  <Card className="bg-white shadow-sm rounded-xl border-gray-200">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </CardContent>
  </Card>
);

const NotificationSkeleton = () => (
  <Card className="bg-white shadow-sm rounded-xl border-gray-200">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-14 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const skeletonMap = {
  default: DefaultSkeleton,
  location: LocationSkeleton,
  pod: PodSkeleton,
  reservation: ReservationSkeleton,
  log: LogSkeleton,
  notification: NotificationSkeleton,
};

export const MobileCardSkeleton: React.FC<MobileCardSkeletonProps> = ({
  variant = 'default',
  count = 5,
}) => {
  const SkeletonComponent = skeletonMap[variant];
  
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};

export default MobileCardSkeleton;

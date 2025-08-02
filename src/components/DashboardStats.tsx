import React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { MapPin, Package, Users, Calendar } from 'lucide-react';
import { usePodStats } from '@/hooks/usePodStats';

interface DashboardStatsProps {
  dashboardStats: {
    locations: number;
    pods: number;
    users: number;
    reservations: number;
  };
  statsLoading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  dashboardStats,
  statsLoading,
}) => {
  const { podStats } = usePodStats();

  const statsData = [
    {
      title: 'LOCATIONS',
      value: dashboardStats.locations.toString(),
      icon: MapPin,
    },
    {
      title: 'PODS',
      value: podStats.total_pods.toString(),
      icon: Package,
    },
    {
      title: 'USERS',
      value: dashboardStats.users.toString(),
      icon: Users,
    },
    {
      title: 'RESERVATIONS',
      value: dashboardStats.reservations.toString(),
      icon: Calendar,
    },
  ];

  return (
    <div className="h-auto flex flex-col gap-3">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-center text-center"
        >
          <div className="flex flex-col items-center justify-center gap-1">
            <stat.icon className="h-5 w-5 text-gray-700 mb-1" />
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {stat.title}
            </span>
            <div className="text-xl font-bold text-gray-900">
              {statsLoading ? '...' : stat.value}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;

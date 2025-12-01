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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg border border-gray-200 px-4 py-3 flex flex-col items-center justify-center text-center"
        >
          <div className="flex items-center gap-2 mb-1 justify-center">
            <stat.icon className="h-4 w-4 text-gray-800" />
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {stat.title}
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {statsLoading ? '...' : stat.value}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;

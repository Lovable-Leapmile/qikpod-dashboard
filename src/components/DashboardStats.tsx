
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const DashboardStats: React.FC<DashboardStatsProps> = ({ dashboardStats, statsLoading }) => {
  const { podStats } = usePodStats();
  
  const statsData = [
    {
      title: 'LOCATIONS',
      value: dashboardStats.locations.toString(),
      icon: MapPin
    },
    {
      title: 'PODS',
      value: podStats.total_pods.toString(),
      icon: Package
    },
    {
      title: 'USERS',
      value: dashboardStats.users.toString(),
      icon: Users
    },
    {
      title: 'RESERVATIONS',
      value: dashboardStats.reservations.toString(),
      icon: Calendar
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-3.5 w-3.5 text-gray-800" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-bold text-gray-900">
              {statsLoading ? '...' : stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;

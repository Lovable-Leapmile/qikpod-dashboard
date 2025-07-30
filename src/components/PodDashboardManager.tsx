import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePodStats } from '@/hooks/usePodStats';

const PodDashboardManager: React.FC = () => {
  const { podStats, loading } = usePodStats();

  if (loading) {
    return (
      <Card className="bg-white shadow-sm rounded-lg">
        <CardHeader className="pb-2 pt-3 px-4 rounded-t-lg bg-gray-50">
          <CardTitle className="text-base font-semibold text-gray-900 text-center">
            Pod Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm rounded-lg">
      <CardHeader className="pb-2 pt-3 px-4 rounded-t-lg bg-gray-50">
        <CardTitle className="text-base font-semibold text-gray-900 text-center">
          Pod Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Alert Pods</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {podStats.alert_pods}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Reservation</span>
              <span className="text-xs text-gray-600">{podStats.reservation_pods}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Ignore</span>
              <span className="text-xs text-gray-600">{podStats.ignore_pods}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Unregistered</span>
              <span className="text-xs text-gray-600">{podStats.unregistered_pods}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Certified</span>
              <span className="text-xs text-gray-600">{podStats.certified_pods}</span>
            </div>
          </div>

          {/* Center Column */}
          <div className="text-center space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Total Pods</p>
              <p className="text-2xl text-gray-900 font-semibold">{podStats.total_pods}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Field Pods</p>
              <p className="text-2xl text-gray-900 font-semibold">{podStats.field_pods}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Green</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {podStats.green_pods}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Red</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {podStats.red_pods}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Yellow</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {podStats.yellow_pods}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Active</span>
              <span className="text-xs text-gray-600">{podStats.active_pods}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">Inactive</span>
              <span className="text-xs text-gray-600">{podStats.inactive_pods}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PodDashboardManager;
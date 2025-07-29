import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePodStats } from '@/hooks/usePodStats';

const PodDashboardManager: React.FC = () => {
  const { podStats, loading } = usePodStats();

  if (loading) {
    return (
      <Card className="bg-white shadow-sm rounded-xl">
        <CardHeader className="pb-4 pt-6 rounded-t-xl bg-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-900 text-center">
            Pod Dashboard Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm rounded-xl">
      <CardHeader className="pb-4 pt-6 rounded-t-xl bg-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-900 text-center">
          Pod Dashboard Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Alert Pods</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {podStats.alert_pods}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Reservation Pods</span>
              <span className="text-sm text-gray-600 mx-[12px]">{podStats.reservation_pods}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Ignore Pods</span>
              <span className="text-sm text-gray-600 mx-[12px]">{podStats.ignore_pods}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Unregistered</span>
              <span className="text-sm text-gray-600 mx-[12px]">{podStats.unregistered_pods}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Certified</span>
              <span className="text-sm text-gray-600 mx-[12px]">{podStats.certified_pods}</span>
            </div>
          </div>

          {/* Center Column */}
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Total Pods</p>
              <p className="text-4xl text-gray-900 font-thin">{podStats.total_pods}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Field Pods</p>
              <p className="text-4xl text-gray-900 font-thin">{podStats.field_pods}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Green</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {podStats.green_pods}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Red</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {podStats.red_pods}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Yellow</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {podStats.yellow_pods}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Active</span>
              <span className="text-sm text-gray-600 mx-[12px]">{podStats.active_pods}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Inactive</span>
              <span className="text-sm text-gray-600 mx-[12px]">{podStats.inactive_pods}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PodDashboardManager;
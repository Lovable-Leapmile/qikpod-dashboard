import React from "react";
import { Card } from "@/components/ui/card";
import { Package, AlertTriangle, Calendar, FileX, CheckCircle, Database, Wrench } from "lucide-react";
import { usePodStats } from "@/hooks/usePodStats";

const PodStatsSection: React.FC = () => {
  const { podStats, loading } = usePodStats();

  const statsCards = [
    {
      title: "Total Pods",
      value: podStats.total_pods,
      icon: Database,
      color: "border-blue-200 text-blue-700",
      iconColor: "text-blue-600",
    },
    {
      title: "Alert Pods",
      value: podStats.alert_pods,
      icon: AlertTriangle,
      color: "border-red-200 text-red-700",
      iconColor: "text-red-600",
    },
    {
      title: "Reservation Pods",
      value: podStats.reservation_pods,
      icon: Calendar,
      color: "border-purple-200 text-purple-700",
      iconColor: "text-purple-600",
    },
    {
      title: "Field Pods",
      value: podStats.field_pods,
      icon: Wrench,
      color: "border-orange-200 text-orange-700",
      iconColor: "text-orange-600",
    },
    {
      title: "Ignore Pods",
      value: podStats.ignore_pods,
      icon: FileX,
      color: "border-gray-200 text-gray-700",
      iconColor: "text-gray-600",
    },
    {
      title: "Certified Pods",
      value: podStats.certified_pods,
      icon: CheckCircle,
      color: "border-green-200 text-green-700",
      iconColor: "text-green-600",
    },
    {
      title: "Unregistered Pods",
      value: podStats.unregistered_pods,
      icon: Package,
      color: "border-yellow-200 text-yellow-700",
      iconColor: "text-yellow-600",
    },
  ];

  const healthCards = [
    {
      title: "Green Pods",
      value: podStats.green_pods,
      color: "border-green-300 text-green-800",
      iconColor: "bg-green-500",
    },
    {
      title: "Yellow Pods",
      value: podStats.yellow_pods,
      color: "border-yellow-300 text-yellow-800",
      iconColor: "bg-yellow-500",
    },
    {
      title: "Red Pods",
      value: podStats.red_pods,
      color: "border-red-300 text-red-800",
      iconColor: "bg-red-500",
    },
    {
      title: "Active Pods",
      value: podStats.active_pods,
      color: "border-teal-300 text-teal-800",
      iconColor: "bg-teal-500",
    },
    {
      title: "Inactive Pods",
      value: podStats.inactive_pods,
      color: "border-slate-300 text-slate-800",
      iconColor: "bg-slate-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Pod Stats Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Pod Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {statsCards.map((stat, index) => (
            <Card
              key={index}
              className={`${stat.color} border-2 px-3 py-3 flex flex-col items-center justify-center text-center rounded-lg shadow-sm hover:shadow-md transition-shadow`}
            >
              <stat.icon className={`h-5 w-5 mb-2 ${stat.iconColor}`} />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs font-medium mt-1">{stat.title}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Pod Health Indicators */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Pod Health Indicators</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {healthCards.map((stat, index) => (
            <Card
              key={index}
              className={`${stat.color} border-2 px-3 py-3 flex flex-col items-center justify-center text-center rounded-lg shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${stat.iconColor}`}></div>
              </div>
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs font-medium mt-1">{stat.title}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PodStatsSection;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Upload, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BatchReservationPopup from '@/components/BatchReservationPopup';

const Partner = () => {
  const navigate = useNavigate();
  const [showBatchPopup, setShowBatchPopup] = useState(false);

  // Mock data for dashboard stats
  const dashboardStats = {
    pickupPending: 20,
    pickupCompleted: 20,
    rtoPending: 20,
    rtoCompleted: 50,
    dropPending: 50
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Partner</h1>
        <p className="text-gray-600 mt-1">Manage partner operations and batch reservations</p>
      </div>

      {/* Partner Dashboard */}
      <Card className="bg-white shadow-sm rounded-xl mb-6">
        <CardHeader className="pb-4 pt-6 rounded-t-xl bg-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-900 text-center">
            Partner Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Pickup Pending</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-300">
                  {dashboardStats.pickupPending}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Pickup Completed</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                  {dashboardStats.pickupCompleted}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">RTO Pending</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-300">
                  {dashboardStats.rtoPending}
                </span>
              </div>
            </div>

            {/* Center Column */}
            <div className="text-center space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Reservations</p>
                <p className="text-4xl text-gray-900 font-thin">
                  {dashboardStats.pickupPending + dashboardStats.pickupCompleted + dashboardStats.rtoPending + dashboardStats.rtoCompleted + dashboardStats.dropPending}
                </p>
              </div>
              <Button
                onClick={() => setShowBatchPopup(true)}
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto"
              >
                <Upload className="w-4 h-4" />
                <span>Run Batch Application</span>
              </Button>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">RTO Completed</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                  {dashboardStats.rtoCompleted}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Drop Pending</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-300">
                  {dashboardStats.dropPending}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Reservation Popup */}
      <BatchReservationPopup
        isOpen={showBatchPopup}
        onClose={() => setShowBatchPopup(false)}
      />
    </div>
  );
};

export default Partner;

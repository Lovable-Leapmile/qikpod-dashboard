
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Activity, ArrowLeft } from 'lucide-react';
import BatchReservationModal from '@/components/BatchReservationModal';

const Partner = () => {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [duplicateCount] = useState(0); // This can be fetched from API

  const handleRunBatchApplication = () => {
    setShowBatchModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Fixed Top Navigation */}
      <nav className="bg-[#FDDC4E] fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  src="https://leapmile-website.blr1.cdn.digitaloceanspaces.com/Qikpod/Images/q70.png" 
                  alt="QikPod Logo" 
                  className="h-7 w-auto" 
                />
              </div>
            </div>

            {/* Back Button */}
            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              className="h-10 text-black hover:text-black bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content with top padding for fixed header */}
      <main className="w-full py-6 px-4 sm:px-6 lg:px-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Activity className="w-4 h-4 mr-2" />
            Users & Network / Partner
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Partner</h1>
        </div>

        {/* Partner Dashboard */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl border-gray-200 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#FDDC4E]" />
              Partner Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Duplicate Records Count */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Duplicate Records</h3>
                  <p className="text-2xl font-bold text-gray-900">{duplicateCount}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Run Batch Application Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleRunBatchApplication}
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black font-semibold px-8 py-3 text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Run Batch Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Batch Reservation Modal */}
      <BatchReservationModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
      />
    </div>
  );
};

export default Partner;

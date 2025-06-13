
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Play } from 'lucide-react';
import BatchReservationPopup from './BatchReservationPopup';

const PartnerDashboard = () => {
  const [showBatchPopup, setShowBatchPopup] = useState(false);

  // Mock data for duplicate records count
  const duplicateRecordsCount = 142;

  return (
    <>
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl border-gray-200 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-[#FDDC4E]" />
            Partner Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Duplicate Records Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                DUPLICATE RECORDS
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {duplicateRecordsCount}
              </div>
            </div>

            {/* Run Batch Application Button */}
            <div className="flex items-center justify-center md:col-span-2 lg:col-span-2">
              <Button
                onClick={() => setShowBatchPopup(true)}
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Run Batch Application
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <BatchReservationPopup 
        isOpen={showBatchPopup}
        onClose={() => setShowBatchPopup(false)}
      />
    </>
  );
};

export default PartnerDashboard;

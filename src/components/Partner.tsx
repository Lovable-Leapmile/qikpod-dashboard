import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Download, Upload, X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PartnerReservationsAgGrid from './PartnerReservationsAgGrid';
import { usePartnerStats } from '@/hooks/usePartnerStats';
interface PartnerProps {
  onBack: () => void;
}
const Partner: React.FC<PartnerProps> = ({
  onBack
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    stats: dashboardStats,
    loading: statsLoading
  } = usePartnerStats();
  const downloadSampleCSV = () => {
    const jsonDataList = [{
      created_by_phone: 9999999999,
      drop_by_phone: 9999999999,
      pickup_by_phone: 9999999999,
      reservation_awbno: "AWB_RESERVATION_NO",
      location_id: "001",
      length: 440,
      width: 380,
      height: 150,
      payment_mode: "prepaid",
      payment_amount: null,
      payment_method: null
    }];
    if (!jsonDataList || jsonDataList.length === 0) {
      console.log("JSON list is null or empty.");
      return;
    }
    const headers = Object.keys(jsonDataList[0]);
    let csvData = headers.join(",") + "\n";
    jsonDataList.forEach(obj => {
      const values = headers.map(header => obj[header] !== null ? obj[header] : "");
      csvData += values.join(",") + "\n";
    });
    const now = new Date();
    const formattedDateTime = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);
    const fileName = `sample_csv_${formattedDateTime}.csv`;
    const blob = new Blob([csvData], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    const formData = new FormData();
    formData.append('in_file', selectedFile);
    try {
      const response = await fetch('https://stagingv3.leapmile.com/podcore/upload_csv/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkwMDczNDA0MH0.pHhmwwEsMIO-5nyxOvw4G2ntQ7-H2A6hyFdQSci8OCY'
        },
        body: formData
      });
      if (response.ok) {
        alert('File uploaded successfully!');
        setShowModal(false);
        setCurrentStep(1);
        setSelectedFile(null);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };
  const resetModal = () => {
    setCurrentStep(1);
    setSelectedFile(null);
  };
  return <div className="space-y-6 w-full max-w-screen-xl mx-auto px-0 sm:px-[37px]">
      {/* Header with Back button and Run Batch button */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <Button onClick={onBack} variant="outline" size="sm" className="flex items-center gap-2 h-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button onClick={() => setShowModal(true)} className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-2 h-9 px-3">
          <Play className="w-4 h-4" />
          Run Batch Application
        </Button>
      </div>

      {/* Partner Dashboard */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-900">Partner Dashboard</h2>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {dashboardStats.map((stat, index) => <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 min-w-0">
                <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis mb-1 sm:mb-0">
                  {stat.title}
                </span>
                <span className={`text-xs sm:text-sm font-bold ${stat.color} bg-white px-2 py-1 rounded-full border sm:ml-2 min-w-[40px] text-center`}>
                  {statsLoading ? <div className="w-3 h-3 sm:w-4 sm:h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mx-auto"></div> : stat.value}
                </span>
              </div>)}
          </div>
        </CardContent>
      </div>

      {/* Partner Reservations AG Grid Table */}
      <div className="w-full">
        <PartnerReservationsAgGrid />
      </div>

      {/* Batch Reservation Modal */}
      <Dialog open={showModal} onOpenChange={open => {
      setShowModal(open);
      if (!open) resetModal();
    }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Batch Reservation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step Header */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Step {currentStep}
              </h3>
            </div>

            {currentStep === 1 ? (/* Step 1 Content */
          <div className="space-y-4">
                <div className="text-sm text-gray-600 leading-relaxed">
                  Enter details of parcels to be delivered to QikPod into a CSV file.
                  You may wish to download a blank CSV template file to get started.
                </div>

                <div className="flex justify-center">
                  <Button onClick={downloadSampleCSV} variant="outline" className="flex items-center gap-2 h-9">
                    <Download className="w-4 h-4" />
                    Click here to Download
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Once parcel details are entered into the CSV file, click next to upload it.
                </div>
              </div>) : (/* Step 2 Content */
          <div className="space-y-4">
                <div className="text-sm text-gray-600 leading-relaxed">
                  Upload the CSV file you updated with parcel details.
                </div>

                <div className="flex flex-col items-center gap-3">
                  <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="csv-upload" />
                  <label htmlFor="csv-upload">
                    <Button variant="outline" className="flex items-center gap-2 cursor-pointer h-9" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                        Click here to upload a file
                      </span>
                    </Button>
                  </label>

                  {selectedFile && <div className="text-sm text-green-600">
                      Selected: {selectedFile.name}
                    </div>}
                </div>
              </div>)}

            {/* Modal Footer Buttons */}
            <div className="flex justify-between pt-4 border-t">
              {currentStep === 1 ? <>
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex items-center gap-2 h-9">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button onClick={() => setCurrentStep(2)} className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-2 h-9">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </> : <>
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex items-center gap-2 h-9">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button onClick={handleUpload} className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-2 h-9" disabled={!selectedFile}>
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Partner;
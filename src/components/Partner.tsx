
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Download, Upload, X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PartnerProps {
  onBack: () => void;
}

const Partner: React.FC<PartnerProps> = ({ onBack }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock dashboard data
  const dashboardStats = [
    { title: 'Pickup Pending', value: 20, color: 'text-orange-600' },
    { title: 'Pickup Completed', value: 20, color: 'text-green-600' },
    { title: 'RTO Pending', value: 20, color: 'text-orange-600' },
    { title: 'RTO Completed', value: 50, color: 'text-green-600' },
    { title: 'Drop Pending', value: 50, color: 'text-orange-600' },
    { title: 'Duplicate Records', value: 0, color: 'text-red-600' }
  ];

  const downloadSampleCSV = () => {
    const jsonDataList = [
      {
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
      }
    ];

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

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
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
      const response = await fetch('https://robotmanagerv1test.qikpod.com:8989/upload_csv/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NTc1Njg1Mzd9.00FEXZbI7rsMGvJR2R8Z89zd-A69nuQmFYwJvUd7Ttw'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={onBack} 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Partner Dashboard */}
      <Card className="bg-white shadow-sm rounded-xl border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">
              Partner Dashboard
            </CardTitle>
            <Button 
              onClick={() => setShowModal(true)}
              className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run Batch Application
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{stat.title}</span>
                <span className={`text-lg font-bold ${stat.color} bg-white px-3 py-1 rounded-full border`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batch Reservation Modal */}
      <Dialog open={showModal} onOpenChange={(open) => {
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

            {currentStep === 1 ? (
              /* Step 1 Content */
              <div className="space-y-4">
                <div className="text-sm text-gray-600 leading-relaxed">
                  Enter details of parcels to be delivered to QikPod into a CSV file.
                  You may wish to download a blank CSV template file to get started.
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={downloadSampleCSV}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Click here to Download
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  Once parcel details are entered into the CSV file, click next to upload it.
                </div>
              </div>
            ) : (
              /* Step 2 Content */
              <div className="space-y-4">
                <div className="text-sm text-gray-600 leading-relaxed">
                  Upload the CSV file you updated with parcel details.
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2 cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4" />
                        Click here to upload a file
                      </span>
                    </Button>
                  </label>
                  
                  {selectedFile && (
                    <div className="text-sm text-green-600">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer Buttons */}
            <div className="flex justify-between pt-4 border-t">
              {currentStep === 1 ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-2"
                    disabled={!selectedFile}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Partner;

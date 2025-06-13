
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BatchReservationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const BatchReservationPopup: React.FC<BatchReservationPopupProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuth();

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
      },
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
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !accessToken) {
      console.error('No file selected or no access token');
      return;
    }

    const formData = new FormData();
    formData.append('in_file', selectedFile);

    try {
      const response = await fetch('https://robotmanagerv1test.qikpod.com:8989/upload_csv/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        console.log('File uploaded successfully');
        onClose();
        setCurrentStep(1);
        setSelectedFile(null);
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setSelectedFile(null);
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Batch Reservation
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* Step Header */}
          <div className="mb-6">
            <div className="text-lg font-medium text-gray-900 mb-2">
              Step {currentStep}
            </div>
            
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Enter details of parcels to be delivered to QikPod into a CSV file. You may wish to download a blank CSV template file to get started.
                </p>
                
                <Button
                  onClick={downloadSampleCSV}
                  variant="outline"
                  className="w-full border-[#FDDC4E] text-black hover:bg-[#FDDC4E] hover:text-black transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Click here to Download
                </Button>
                
                <p className="text-gray-600 text-sm">
                  Once parcel details are entered into the CSV file, click next to upload it.
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Upload the CSV file you updated with parcel details.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FDDC4E] transition-colors">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-[#FDDC4E] text-black hover:bg-[#FDDC4E] hover:text-black transition-colors flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Click here to upload a file
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            {currentStep === 1 && (
              <>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchReservationPopup;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, ArrowLeft, ArrowRight, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BatchReservationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const BatchReservationPopup: React.FC<BatchReservationPopupProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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

    toast({
      title: "Success",
      description: "Sample CSV file downloaded successfully",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
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
        toast({
          title: "Success",
          description: "CSV file uploaded successfully!",
        });
        handleClose();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload CSV file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    onClose();
  };

  const handleNext = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Batch Reservation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 1 ? (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-green-800">
                  Step 1
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Enter details of parcels to be delivered to QikPod into a CSV file. You may wish to download a blank CSV template file to get started.
                </p>
                
                <div className="flex justify-center">
                  <Button
                    onClick={downloadSampleCSV}
                    className="bg-[#FDDC4E] hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-lg flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Click here to Download</span>
                  </Button>
                </div>

                <p className="text-xs text-gray-600 text-center mt-4">
                  Once parcel details are entered into the CSV file, click next to upload it.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-blue-800">
                  Step 2
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Upload the CSV file you updated with parcel details.
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="csv-upload"
                      />
                      <Button
                        className="bg-[#FDDC4E] hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-lg flex items-center space-x-2"
                        asChild
                      >
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <FileText className="w-4 h-4" />
                          <span>Click here to upload a file</span>
                        </label>
                      </Button>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="text-center">
                      <p className="text-sm text-green-600 font-medium">
                        Selected: {selectedFile.name}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bottom Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            {currentStep === 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </Button>
                <Button
                  onClick={uploadFile}
                  disabled={!selectedFile || isUploading}
                  className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center space-x-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </>
                  )}
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

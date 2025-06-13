
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, X, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BatchReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BatchReservationModal: React.FC<BatchReservationModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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

    toast({
      title: "Download Complete",
      description: "Sample CSV template has been downloaded successfully."
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file.",
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('in_file', selectedFile);

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
          title: "Upload Successful",
          description: "Your CSV file has been uploaded and processed successfully."
        });
        handleClose();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
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
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold">Batch Reservation</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Step Indicator */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-[#FDDC4E] text-black' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 ${
                currentStep >= 2 ? 'bg-[#FDDC4E]' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-[#FDDC4E] text-black' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Download Template</span>
              <span>Upload File</span>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Step 1</h3>
                <div className="w-16 h-16 bg-[#FDDC4E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-black" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Enter details of parcels to be delivered to QikPod into a CSV file.
                  You may wish to download a blank CSV template file to get started.
                </p>
                
                <Button
                  onClick={downloadSampleCSV}
                  className="bg-[#FDDC4E] hover:bg-yellow-400 text-black font-medium px-6 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Click here to Download
                </Button>
                
                <p className="text-sm text-gray-600 mt-4">
                  Once parcel details are entered into the CSV file, click next to upload it.
                </p>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Step 2</h3>
                <div className="w-16 h-16 bg-[#FDDC4E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-black" />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Upload the CSV file you updated with parcel details.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#FDDC4E] transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-600">Click here to upload a file</span>
                    {selectedFile && (
                      <span className="text-sm text-[#FDDC4E] font-medium">
                        Selected: {selectedFile.name}
                      </span>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="bg-[#FDDC4E] hover:bg-yellow-400 text-black flex items-center disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchReservationModal;

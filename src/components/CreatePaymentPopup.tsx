import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreatePaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreatePaymentPopup: React.FC<CreatePaymentPopupProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    clientReferenceId: '',
    awbNo: '',
    amount: '',
    paymentMethod: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return formData.clientReferenceId && 
           formData.awbNo && 
           formData.amount && 
           formData.paymentMethod;
  };

  const handlePayNow = () => {
    if (!isFormValid()) return;
    
    // Here you would typically make an API call to create the payment
    console.log('Creating payment with:', formData);
    
    // For now, just close the modal and refresh
    onSuccess();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientReferenceId: '',
      awbNo: '',
      amount: '',
      paymentMethod: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientReferenceId">Client Reference ID</Label>
            <Input
              id="clientReferenceId"
              placeholder="Enter Client Reference ID"
              value={formData.clientReferenceId}
              onChange={(e) => handleInputChange('clientReferenceId', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="awbNo">AWB No</Label>
            <Input
              id="awbNo"
              placeholder="Enter AWB No"
              value={formData.awbNo}
              onChange={(e) => handleInputChange('awbNo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter Amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paytm">Paytm</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayNow} 
              disabled={!isFormValid()}
            >
              Pay Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePaymentPopup;
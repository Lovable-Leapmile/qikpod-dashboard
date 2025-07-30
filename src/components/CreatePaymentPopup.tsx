import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign, Hash, Package } from 'lucide-react';

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

  const [isSubmitting, setIsSubmitting] = useState(false);

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
           formData.paymentMethod &&
           parseFloat(formData.amount) > 0;
  };

  const handlePayNow = async () => {
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      console.log('Creating payment with:', formData);
      
      // Here you would typically make an API call to create the payment
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setIsSubmitting(false);
    }
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
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Create New Payment
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to create a new payment request
          </p>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="clientReferenceId" className="text-sm font-medium flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              Client Reference ID
            </Label>
            <Input
              id="clientReferenceId"
              placeholder="Enter Client Reference ID"
              value={formData.clientReferenceId}
              onChange={(e) => handleInputChange('clientReferenceId', e.target.value)}
              className="bg-background border-border focus:border-primary transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="awbNo" className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              AWB No
            </Label>
            <Input
              id="awbNo"
              placeholder="Enter AWB No"
              value={formData.awbNo}
              onChange={(e) => handleInputChange('awbNo', e.target.value)}
              className="bg-background border-border focus:border-primary transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter Amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="bg-background border-border focus:border-primary transition-colors"
              disabled={isSubmitting}
            />
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <p className="text-xs text-muted-foreground">
                Amount: ₹{parseFloat(formData.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Method
            </Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="bg-background border-border focus:border-primary">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paytm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    Paytm
                  </div>
                </SelectItem>
                <SelectItem value="razorpay">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    Razorpay
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
              className="hover:scale-105 transition-transform"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayNow} 
              disabled={!isFormValid() || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePaymentPopup;
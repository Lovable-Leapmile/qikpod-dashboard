import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, DollarSign, Hash, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    clientReferenceId: '',
    awbNo: '',
    amount: '',
    paymentMethod: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [paymentData, setPaymentData] = useState<{
    payment_reference_id?: string;
    payment_vendor?: string;
    payment_url?: string;
  }>({});
  const [showPendingButton, setShowPendingButton] = useState(false);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const paymentWindowRef = useRef<Window | null>(null);

  // Payment vendor logos
  const paymentLogos = {
    paytm: 'https://pwebassets.paytm.com/commonwebassets/paytmweb/footer/images/paytmLogo.svg',
    razorpay: 'https://app.qikpod.com/assets/assets/images/1545306239_rzp-glyph-positive_1.png'
  };

  // Clear polling on component unmount or when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
        paymentWindowRef.current.close();
        paymentWindowRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isOpen]);

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

  const checkPaymentStatus = async (paymentReferenceId: string, paymentVendor: string) => {
    try {
      const response = await fetch(
        `https://stagingv3.leapmile.com/payments/payments/get_payment_status/?payment_reference_id=${paymentReferenceId}&payment_vendor=${paymentVendor}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.status || data.payment_status || 'pending';
      }
      return 'pending';
    } catch (error) {
      console.error('Error checking payment status:', error);
      return 'pending';
    }
  };

  const startPaymentStatusPolling = (paymentReferenceId: string, paymentVendor: string) => {
    // Clear existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      const status = await checkPaymentStatus(paymentReferenceId, paymentVendor);

      if (status === 'success' || status === 'completed' || status === 'paid') {
        setPaymentStatus('success');
        setShowPendingButton(false);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        toast.success('Payment completed successfully!');
        onSuccess();
        handleClose();
      } else if (status === 'failed' || status === 'cancelled') {
        setPaymentStatus('failed');
        setShowPendingButton(true);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        toast.error('Payment failed. You can retry the payment.');
      }
    }, 3000); // Poll every 3 seconds
  };

  const createPayment = async () => {
    try {
      const response = await fetch(
        `https://stagingv3.leapmile.com/payments/payments/create_payment/?payment_client_awbno=${encodeURIComponent(formData.awbNo)}&amount=${encodeURIComponent(formData.amount)}&payment_client_reference_id=${encodeURIComponent(formData.clientReferenceId)}&payment_vendor=${encodeURIComponent(formData.paymentMethod)}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.payment_url) {
        setPaymentData({
          payment_reference_id: data.payment_reference_id,
          payment_vendor: data.payment_vendor,
          payment_url: data.payment_url
        });

        // Set payment redirect flag in localStorage for return detection
        localStorage.setItem('payment_redirect', 'true');
        localStorage.setItem('payment_id', data.payment_reference_id);
        localStorage.setItem('payment_vendor', data.payment_vendor);

        // Use window.location.href for navigation (this will redirect the entire page)
        window.location.href = data.payment_url;
      } else {
        throw new Error('No payment URL received from the server');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create payment. Please try again.');
      throw error;
    }
  };

  // Check if we're returning from a payment gateway when component mounts
  useEffect(() => {
    const checkPaymentReturn = async () => {
      const paymentRedirect = localStorage.getItem('payment_redirect');
      const paymentId = localStorage.getItem('payment_id');
      const paymentVendor = localStorage.getItem('payment_vendor');

      if (paymentRedirect === 'true' && paymentId && paymentVendor) {
        // We returned from a payment gateway, check the status
        localStorage.removeItem('payment_redirect');
        localStorage.removeItem('payment_id');
        localStorage.removeItem('payment_vendor');

        // Show loading status
        setPaymentStatus('pending');

        // Wait a moment for the backend to process the payment
        setTimeout(async () => {
          const status = await checkPaymentStatus(paymentId, paymentVendor);

          if (status === 'success' || status === 'completed' || status === 'paid') {
            setPaymentStatus('success');
            toast.success('Payment completed successfully!');
            onSuccess();
            handleClose();
          } else {
            setPaymentStatus('failed');
            setShowPendingButton(true);
            toast.error('Payment failed or is still pending. Please check your payment status.');
          }
        }, 2000);
      }
    };

    checkPaymentReturn();
  }, [onSuccess]);

  const handlePayNow = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    setShowPendingButton(false);

    try {
      await createPayment();
    } catch (error) {
      console.error('Error in payment flow:', error);
      setIsSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    if (paymentData.payment_url) {
      setIsSubmitting(true);
      try {
        // Set payment redirect flag in localStorage for return detection
        localStorage.setItem('payment_redirect', 'true');
        localStorage.setItem('payment_id', paymentData.payment_reference_id || '');
        localStorage.setItem('payment_vendor', paymentData.payment_vendor || '');

        // Use window.location.href for navigation
        window.location.href = paymentData.payment_url;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to retry payment.');
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clientReferenceId: '',
      awbNo: '',
      amount: '',
      paymentMethod: '',
    });
    setPaymentStatus('idle');
    setPaymentData({});
    setShowPendingButton(false);

    // Clear polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
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
                    <img src={paymentLogos.paytm} alt="Paytm" className="w-6 h-6 object-contain" />
                    Paytm
                  </div>
                </SelectItem>
                <SelectItem value="razorpay">
                  <div className="flex items-center gap-2">
                    <img src={paymentLogos.razorpay} alt="Razorpay" className="w-6 h-6 object-contain" />
                    Razorpay
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Indicator */}
          {paymentStatus !== 'idle' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              {paymentStatus === 'pending' && (
                <>
                  <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Payment in progress...</span>
                </>
              )}
              {paymentStatus === 'success' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Payment completed successfully!</span>
                </>
              )}
              {paymentStatus === 'failed' && (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">Payment failed. Please retry.</span>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-6 border-t">
            {/* Primary buttons row */}
            <div className="flex justify-end gap-3">
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

            {/* Pending payment retry button */}
            {showPendingButton && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleRetryPayment}
                  disabled={isSubmitting}
                  variant="secondary"
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Retrying...
                    </div>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Retry Pending Payment
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePaymentPopup;
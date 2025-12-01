import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface PaymentModePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: number;
  initialValue: string;
  onSuccess: () => void;
}

const PaymentModePopup: React.FC<PaymentModePopupProps> = ({
  open,
  onOpenChange,
  locationId,
  initialValue,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [paymentMode, setPaymentMode] = useState(initialValue || "free");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentModeOptions = ["free", "paid"];

  const handleSubmit = async () => {
    if (!accessToken) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`https://productionv36.qikpod.com/podcore/locations/${locationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          payment_mode: paymentMode,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment mode updated successfully",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error("Failed to update payment mode");
      }
    } catch (error) {
      console.error("Error updating payment mode:", error);
      toast({
        title: "Error",
        description: "Failed to update payment mode",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Payment Mode</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Mode</label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                {paymentModeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#FDDC4E] hover:bg-yellow-400 text-black"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModePopup;

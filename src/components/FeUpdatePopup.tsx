
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dashboardApi } from '@/services/dashboardApi';
import { Upload } from 'lucide-react';

interface FeUpdatePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  podId: number;
  onSuccess: () => void;
}

const FeUpdatePopup: React.FC<FeUpdatePopupProps> = ({
  open,
  onOpenChange,
  podId,
  onSuccess
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [feTag, setFeTag] = useState('');
  const [feDetails, setFeDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feTagOptions = [
    'OK - Fully Operational',
    'ALERT - Service Call Needed',
    'IGNORE - Relocating Pod',
    'IGNORE - No Power Connection',
    'IGNORE - Not Activated Yet',
    'IGNORE - Network Issue',
    'IGNORE - Extra Locker Added',
    'WORKING - Inactive',
    'WIFI Pods',
    'WiFi to be enabled',
    'IGNORE - BD issue',
    'None'
  ];

  const handleSubmit = async () => {
    if (!accessToken) return;

    if (!feTag) {
      toast({
        title: "Error",
        description: "Please select an FE Tag",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await dashboardApi.updatePodFe(accessToken, podId, {
        fe_tag: feTag,
        fe_details: feDetails
      });

      if (success) {
        toast({
          title: "Success",
          description: "FE update completed successfully",
        });
        onSuccess();
        onOpenChange(false);
        setFeTag('');
        setFeDetails('');
      } else {
        throw new Error('FE update failed');
      }
    } catch (error) {
      console.error('Error updating FE:', error);
      toast({
        title: "Error",
        description: "Failed to update FE details",
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
          <DialogTitle>FE Update</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fe-tag">FE Tag</Label>
            <Select value={feTag} onValueChange={setFeTag}>
              <SelectTrigger>
                <SelectValue placeholder="Select FE Tag" />
              </SelectTrigger>
              <SelectContent>
                {feTagOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fe-details">FE Details</Label>
            <Textarea
              id="fe-details"
              value={feDetails}
              onChange={(e) => setFeDetails(e.target.value)}
              placeholder="Enter FE details..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#FDDC4E] hover:bg-yellow-400 text-black"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeUpdatePopup;

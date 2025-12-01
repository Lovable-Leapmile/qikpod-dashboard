
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';

interface FEUpdatePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  podId: number;
  initialValues?: {
    fe_tag?: string;
    fe_details?: string;
  };
  onSuccess: () => void;
}

const FEUpdatePopup: React.FC<FEUpdatePopupProps> = ({
  open,
  onOpenChange,
  podId,
  initialValues,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [feTag, setFeTag] = useState(initialValues?.fe_tag || '');
  const [feDetails, setFeDetails] = useState(initialValues?.fe_details || '');
  const [loading, setLoading] = useState(false);

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
    'None',
  ];

  const handleSubmit = async () => {
    if (!accessToken || !feTag) return;

    setLoading(true);
    try {
      await dashboardApi.updatePodFE(accessToken, podId, {
        fe_tag: feTag,
        fe_details: feDetails,
      });
      
      toast({
        title: "Success",
        description: "FE details updated successfully",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating FE details:', error);
      toast({
        title: "Error",
        description: "Failed to update FE details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>FE Update</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FE Tag
            </label>
            <Select value={feTag} onValueChange={setFeTag}>
              <SelectTrigger>
                <SelectValue placeholder="Select FE tag" />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={feDetails}
              onChange={(e) => setFeDetails(e.target.value)}
              placeholder="Enter FE details..."
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !feTag}
              className="flex items-center space-x-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FEUpdatePopup;

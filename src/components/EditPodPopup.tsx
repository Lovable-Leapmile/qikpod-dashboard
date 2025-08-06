import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PodDetail } from '@/services/dashboardApi';

interface EditPodPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  podData: PodDetail;
  onSuccess: () => void;
}

interface PodUpdateData {
  status: string;
  pod_name: string;
  pod_flag_maintenance: string | null;
  pod_state: string;
  pod_connection_method: string;
  pod_mode: string;
}

const EditPodPopup: React.FC<EditPodPopupProps> = ({
  open,
  onOpenChange,
  podData,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<PodUpdateData>({
    status: '',
    pod_name: '',
    pod_flag_maintenance: null,
    pod_state: '',
    pod_connection_method: '',
    pod_mode: '',
  });

  // Pre-fill form data when popup opens or pod data changes
  useEffect(() => {
    if (podData) {
      setFormData({
        status: podData.status || '',
        pod_name: podData.pod_name || '',
        pod_flag_maintenance: podData.pod_flag_maintenance || null,
        pod_state: podData.pod_state || '',
        pod_connection_method: podData.pod_connection_method || '',
        pod_mode: podData.pod_mode || '',
      });
    }
  }, [podData]);

  const handleSubmit = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://stagingv3.leapmile.com/podcore/pods/?record_id=${podData.id}&order_by_field=updated_at&order_by_type=DESC`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Pod updated successfully",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error('Failed to update pod');
      }
    } catch (error) {
      console.error('Error updating pod:', error);
      toast({
        title: "Error",
        description: "Failed to update pod. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormField = (field: keyof PodUpdateData, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Pod Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Column 1: Pod Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Pod Status</h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormField('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Column 2: Pod Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Pod Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="pod_name">Pod Name</Label>
              <Input
                id="pod_name"
                value={formData.pod_name}
                onChange={(e) => updateFormField('pod_name', e.target.value)}
                placeholder="Enter pod name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pod_flag_maintenance">Flag Maintenance</Label>
              <Select
                value={formData.pod_flag_maintenance || 'null'}
                onValueChange={(value) => updateFormField('pod_flag_maintenance', value === 'null' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select flag maintenance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">N/A</SelectItem>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pod_state">Pod State</Label>
              <Select
                value={formData.pod_state}
                onValueChange={(value) => updateFormField('pod_state', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pod state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reboot">Reboot</SelectItem>
                  <SelectItem value="Certified">Certified</SelectItem>
                  <SelectItem value="Un-registered">Un-registered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Column 3: Pod Connection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Pod Connection</h3>
            
            <div className="space-y-2">
              <Label htmlFor="pod_connection_method">Pod Connection Method</Label>
              <Select
                value={formData.pod_connection_method}
                onValueChange={(value) => updateFormField('pod_connection_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select connection method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Wifi">Wifi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pod_mode">Pod Mode</Label>
              <Select
                value={formData.pod_mode}
                onValueChange={(value) => updateFormField('pod_mode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pod mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Adhoc">Adhoc</SelectItem>
                  <SelectItem value="Static">Static</SelectItem>
                  <SelectItem value="Dynamic">Dynamic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Save/Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPodPopup;
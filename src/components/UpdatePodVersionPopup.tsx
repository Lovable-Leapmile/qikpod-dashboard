
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/services/dashboardApi';
import { useToast } from '@/hooks/use-toast';

interface UpdatePodVersionPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  podId: number;
  onSuccess: () => void;
}

const UpdatePodVersionPopup: React.FC<UpdatePodVersionPopupProps> = ({
  open,
  onOpenChange,
  podId,
  onSuccess,
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [configurationVersion, setConfigurationVersion] = useState('');
  const [productionVersion, setProductionVersion] = useState('');
  const [rootVersion, setRootVersion] = useState('');
  const [loading, setLoading] = useState('');

  const handleUpdate = async (type: 'configuration' | 'production' | 'root') => {
    if (!accessToken) return;

    const versionValue = type === 'configuration' ? configurationVersion : 
                        type === 'production' ? productionVersion : rootVersion;

    if (!versionValue) return;

    setLoading(type);
    try {
      const versionData = type === 'configuration' ? 
        { pod_configuration_version_update_to: versionValue } :
        type === 'production' ? 
        { pod_production_version_update_to: versionValue } :
        { pod_root_version_update_to: versionValue };

      await dashboardApi.updatePodVersion(accessToken, podId, versionData);
      
      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} version updated successfully`,
      });
      
      // Clear the field after successful update
      if (type === 'configuration') setConfigurationVersion('');
      else if (type === 'production') setProductionVersion('');
      else setRootVersion('');
      
      onSuccess();
    } catch (error) {
      console.error(`Error updating ${type} version:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${type} version`,
        variant: "destructive",
      });
    } finally {
      setLoading('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Pod Version</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Configuration Version */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Configuration
              </label>
              <Input
                value={configurationVersion}
                onChange={(e) => setConfigurationVersion(e.target.value)}
                placeholder="Enter configuration version"
              />
            </div>
            <Button 
              onClick={() => handleUpdate('configuration')}
              disabled={loading === 'configuration' || !configurationVersion}
              className="flex items-center space-x-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>{loading === 'configuration' ? 'Updating...' : 'Update'}</span>
            </Button>
          </div>

          {/* Production Version */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Production
              </label>
              <Input
                value={productionVersion}
                onChange={(e) => setProductionVersion(e.target.value)}
                placeholder="Enter production version"
              />
            </div>
            <Button 
              onClick={() => handleUpdate('production')}
              disabled={loading === 'production' || !productionVersion}
              className="flex items-center space-x-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>{loading === 'production' ? 'Updating...' : 'Update'}</span>
            </Button>
          </div>

          {/* Root Version */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Root Version
              </label>
              <Input
                value={rootVersion}
                onChange={(e) => setRootVersion(e.target.value)}
                placeholder="Enter root version"
              />
            </div>
            <Button 
              onClick={() => handleUpdate('root')}
              disabled={loading === 'root' || !rootVersion}
              className="flex items-center space-x-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>{loading === 'root' ? 'Updating...' : 'Update'}</span>
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePodVersionPopup;

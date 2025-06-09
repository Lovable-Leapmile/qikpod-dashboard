
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dashboardApi } from '@/services/dashboardApi';
import { Upload } from 'lucide-react';

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
  onSuccess
}) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [configVersion, setConfigVersion] = useState('');
  const [productionVersion, setProductionVersion] = useState('');
  const [rootVersion, setRootVersion] = useState('');
  const [isUpdating, setIsUpdating] = useState({ config: false, production: false, root: false });

  const handleUpdate = async (type: 'config' | 'production' | 'root') => {
    if (!accessToken) return;

    let versionData;
    let version;

    switch (type) {
      case 'config':
        version = configVersion;
        versionData = { pod_configuration_version_update_to: configVersion };
        break;
      case 'production':
        version = productionVersion;
        versionData = { pod_production_version_update_to: productionVersion };
        break;
      case 'root':
        version = rootVersion;
        versionData = { pod_root_version_update_to: rootVersion };
        break;
    }

    if (!version.trim()) {
      toast({
        title: "Error",
        description: "Please enter a version value",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(prev => ({ ...prev, [type]: true }));

    try {
      const success = await dashboardApi.updatePodVersion(accessToken, podId, versionData);
      
      if (success) {
        toast({
          title: "Success",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} version updated successfully`,
        });
        
        // Clear the input
        switch (type) {
          case 'config':
            setConfigVersion('');
            break;
          case 'production':
            setProductionVersion('');
            break;
          case 'root':
            setRootVersion('');
            break;
        }
        
        onSuccess();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error(`Error updating ${type} version:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${type} version`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Pod Version</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="config-version">Update Configuration</Label>
            <div className="flex space-x-2">
              <Input
                id="config-version"
                value={configVersion}
                onChange={(e) => setConfigVersion(e.target.value)}
                placeholder="Enter configuration version"
                className="flex-1"
              />
              <Button
                onClick={() => handleUpdate('config')}
                disabled={isUpdating.config}
                size="sm"
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black"
              >
                <Upload className="w-4 h-4 mr-1" />
                {isUpdating.config ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="production-version">Update Production</Label>
            <div className="flex space-x-2">
              <Input
                id="production-version"
                value={productionVersion}
                onChange={(e) => setProductionVersion(e.target.value)}
                placeholder="Enter production version"
                className="flex-1"
              />
              <Button
                onClick={() => handleUpdate('production')}
                disabled={isUpdating.production}
                size="sm"
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black"
              >
                <Upload className="w-4 h-4 mr-1" />
                {isUpdating.production ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="root-version">Update Root Version</Label>
            <div className="flex space-x-2">
              <Input
                id="root-version"
                value={rootVersion}
                onChange={(e) => setRootVersion(e.target.value)}
                placeholder="Enter root version"
                className="flex-1"
              />
              <Button
                onClick={() => handleUpdate('root')}
                disabled={isUpdating.root}
                size="sm"
                className="bg-[#FDDC4E] hover:bg-yellow-400 text-black"
              >
                <Upload className="w-4 h-4 mr-1" />
                {isUpdating.root ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdatePodVersionPopup;

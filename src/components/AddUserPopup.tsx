import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useApiUrl } from '@/hooks/useApiUrl';

interface AddUserPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface LocationOption {
  id: number;
  location_name: string;
  location_address: string;
}

interface UserFormData {
  user_name: string;
  user_type: string;
  user_phone: string;
  user_email: string;
  user_flatno: string;
  user_address: string;
  location_id: string;
}

const AddUserPopup: React.FC<AddUserPopupProps> = ({ open, onOpenChange, onSuccess }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const { podcore } = useApiUrl();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    user_name: '',
    user_type: '',
    user_phone: '',
    user_email: '',
    user_flatno: '',
    user_address: '',
    location_id: '',
  });

  const userTypeOptions = [
    'QPStaff',
    'Customer',
    'SiteSecurity',
    'SiteAdmin',
    'DeliveryExec',
  ];

  // Fetch locations when popup opens
  useEffect(() => {
    if (open && accessToken) {
      fetchLocations();
    }
  }, [open, accessToken]);

  const fetchLocations = async () => {
    if (!accessToken) return;
    setLoadingLocations(true);
    try {
      const response = await fetch(
        `${podcore}/locations/?order_by_field=updated_at&order_by_type=DESC`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setLocations(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmailChange = (value: string) => {
    // Auto-add @gmail.com if user is typing and doesn't have @ symbol
    let emailValue = value;
    if (value && !value.includes('@') && value.length > 0) {
      // Don't auto-add while user is still typing
      if (value.endsWith(' ')) {
        emailValue = value.trim() + '@gmail.com';
      }
    }
    handleInputChange('user_email', emailValue);
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '');
    handleInputChange('user_phone', numericValue);
  };

  const handleFlatNoChange = (value: string) => {
    // Only allow alphanumeric input
    const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '');
    handleInputChange('user_flatno', alphanumericValue);
  };

  const isFormValid = () => {
    return (
      formData.user_name.trim() &&
      formData.user_type &&
      formData.user_phone.trim() &&
      formData.user_email.trim() &&
      formData.user_flatno.trim() &&
      formData.location_id
    );
  };

  const handleSubmit = async () => {
    if (!accessToken || !isFormValid()) return;

    setLoading(true);
    try {
      const payload = {
        user_name: formData.user_name,
        user_type: formData.user_type,
        user_phone: formData.user_phone,
        user_email: formData.user_email.includes('@') ? formData.user_email : `${formData.user_email}@gmail.com`,
        user_flatno: formData.user_flatno,
        user_address: formData.user_address,
      };

      const response = await fetch(`${podcore}/users/locations/${formData.location_id}`, {
        method: 'PATCH',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        onSuccess();
        // Reset form
        setFormData({
          user_name: '',
          user_type: '',
          user_phone: '',
          user_email: '',
          user_flatno: '',
          user_address: '',
          location_id: '',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Location */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Location *
            </Label>
            <Select 
              value={formData.location_id} 
              onValueChange={(value) => handleInputChange('location_id', value)}
              disabled={loadingLocations}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingLocations ? "Loading locations..." : "Select location"} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.location_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Type */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              User Type
            </Label>
            <Select value={formData.user_type} onValueChange={(value) => handleInputChange('user_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                {userTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Name
            </Label>
            <Input
              placeholder="Enter full name"
              value={formData.user_name}
              onChange={(e) => handleInputChange('user_name', e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Email
            </Label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.user_email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Hint: Adds @gmail.com suffix while typing</p>
          </div>

          {/* Phone */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Phone
            </Label>
            <Input
              placeholder="Enter phone number"
              value={formData.user_phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
            />
          </div>

          {/* Flat No */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Flat No
            </Label>
            <Input
              placeholder="Enter flat number"
              value={formData.user_flatno}
              onChange={(e) => handleFlatNoChange(e.target.value)}
            />
          </div>

          {/* Address */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Address
            </Label>
            <Input
              placeholder="Enter address"
              value={formData.user_address}
              onChange={(e) => handleInputChange('user_address', e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !isFormValid()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Submit'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserPopup;

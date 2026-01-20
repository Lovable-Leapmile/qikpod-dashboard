import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useApiUrl } from "@/hooks/useApiUrl";
import { dashboardApi, Location } from "@/services/dashboardApi";

interface AddPodPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PodFormData {
  id: string;
  pod_name: string;
  status: string;
  pod_numtotaldoors: string;
  location_id: string;
  pod_health: string;
  pod_state: string;
  pod_power_status: string;
  pod_production_version: string;
  pod_production_version_update_to: string;
  pod_configuration_version: string;
  pod_configuration_version_update_to: string;
  pod_root_version: string;
  pod_root_version_update_to: string;
}

const AddPodPopup: React.FC<AddPodPopupProps> = ({ open, onOpenChange, onSuccess }) => {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const apiUrl = useApiUrl();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  const [formData, setFormData] = useState<PodFormData>({
    id: "",
    pod_name: "",
    status: "active",
    pod_numtotaldoors: "6",
    location_id: "",
    pod_health: "Yellow",
    pod_state: "Certified",
    pod_power_status: "Raw",
    pod_production_version: "",
    pod_production_version_update_to: "",
    pod_configuration_version: "",
    pod_configuration_version_update_to: "",
    pod_root_version: "",
    pod_root_version_update_to: "",
  });

  useEffect(() => {
    const fetchLocations = async () => {
      if (!accessToken) return;
      try {
        const data = await dashboardApi.getLocations(accessToken, 100);
        setLocations(data || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    if (open) {
      fetchLocations();
    }
  }, [open, accessToken]);

  const handleInputChange = (field: keyof PodFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      id: "",
      pod_name: "",
      status: "active",
      pod_numtotaldoors: "6",
      location_id: "",
      pod_health: "Yellow",
      pod_state: "Certified",
      pod_power_status: "Raw",
      pod_production_version: "",
      pod_production_version_update_to: "",
      pod_configuration_version: "",
      pod_configuration_version_update_to: "",
      pod_root_version: "",
      pod_root_version_update_to: "",
    });
  };

  const handleSubmit = async () => {
    if (!accessToken) return;

    if (!formData.id || !formData.pod_name || !formData.location_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in Pod ID, Pod Name, and Location.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: parseInt(formData.id),
        pod_name: formData.pod_name,
        status: formData.status,
        pod_numtotaldoors: parseInt(formData.pod_numtotaldoors) || 6,
        location_id: parseInt(formData.location_id),
        pod_health: formData.pod_health,
        pod_state: formData.pod_state,
        pod_power_status: formData.pod_power_status,
        pod_production_version: formData.pod_production_version || null,
        pod_production_version_update_to: formData.pod_production_version_update_to || null,
        pod_configuration_version: formData.pod_configuration_version || null,
        pod_configuration_version_update_to: formData.pod_configuration_version_update_to || null,
        pod_root_version: formData.pod_root_version || null,
        pod_root_version_update_to: formData.pod_root_version_update_to || null,
      };

      const response = await fetch(`${apiUrl.podcore}/pods/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Pod created successfully!",
        });
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create pod",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating pod:", error);
      toast({
        title: "Error",
        description: "Failed to create pod. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Pod</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Required Fields */}
          <div className="space-y-2">
            <Label htmlFor="id">Pod ID *</Label>
            <Input
              id="id"
              type="number"
              value={formData.id}
              onChange={(e) => handleInputChange("id", e.target.value)}
              placeholder="Enter Pod ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_name">Pod Name *</Label>
            <Input
              id="pod_name"
              value={formData.pod_name}
              onChange={(e) => handleInputChange("pod_name", e.target.value)}
              placeholder="Enter Pod Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_id">Location *</Label>
            <Select
              value={formData.location_id}
              onValueChange={(value) => handleInputChange("location_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.location_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_numtotaldoors">Total Doors</Label>
            <Input
              id="pod_numtotaldoors"
              type="number"
              value={formData.pod_numtotaldoors}
              onChange={(e) => handleInputChange("pod_numtotaldoors", e.target.value)}
              placeholder="6"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_health">Health</Label>
            <Select
              value={formData.pod_health}
              onValueChange={(value) => handleInputChange("pod_health", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Green">Green</SelectItem>
                <SelectItem value="Yellow">Yellow</SelectItem>
                <SelectItem value="Red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_state">State</Label>
            <Select
              value={formData.pod_state}
              onValueChange={(value) => handleInputChange("pod_state", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Certified">Certified</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Testing">Testing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_power_status">Power Status</Label>
            <Select
              value={formData.pod_power_status}
              onValueChange={(value) => handleInputChange("pod_power_status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Raw">Raw</SelectItem>
                <SelectItem value="ON">ON</SelectItem>
                <SelectItem value="OFF">OFF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Version Fields */}
          <div className="space-y-2">
            <Label htmlFor="pod_production_version">Production Version</Label>
            <Input
              id="pod_production_version"
              value={formData.pod_production_version}
              onChange={(e) => handleInputChange("pod_production_version", e.target.value)}
              placeholder="e.g., 3.2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_production_version_update_to">Production Version Update To</Label>
            <Input
              id="pod_production_version_update_to"
              value={formData.pod_production_version_update_to}
              onChange={(e) => handleInputChange("pod_production_version_update_to", e.target.value)}
              placeholder="e.g., 4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_configuration_version">Configuration Version</Label>
            <Input
              id="pod_configuration_version"
              value={formData.pod_configuration_version}
              onChange={(e) => handleInputChange("pod_configuration_version", e.target.value)}
              placeholder="e.g., 123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_configuration_version_update_to">Config Version Update To</Label>
            <Input
              id="pod_configuration_version_update_to"
              value={formData.pod_configuration_version_update_to}
              onChange={(e) => handleInputChange("pod_configuration_version_update_to", e.target.value)}
              placeholder="e.g., 1234"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_root_version">Root Version</Label>
            <Input
              id="pod_root_version"
              value={formData.pod_root_version}
              onChange={(e) => handleInputChange("pod_root_version", e.target.value)}
              placeholder="e.g., 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pod_root_version_update_to">Root Version Update To</Label>
            <Input
              id="pod_root_version_update_to"
              value={formData.pod_root_version_update_to}
              onChange={(e) => handleInputChange("pod_root_version_update_to", e.target.value)}
              placeholder="e.g., 2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#FDDC4E] hover:bg-yellow-400 text-black"
          >
            {loading ? "Creating..." : "Create Pod"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPodPopup;

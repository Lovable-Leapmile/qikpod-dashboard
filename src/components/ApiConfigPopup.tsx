import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ApiConfigPopupProps {
  open: boolean;
  onConfigSubmit: (subdomain: string) => void;
}

export const ApiConfigPopup = ({ open, onConfigSubmit }: ApiConfigPopupProps) => {
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!subdomain.trim()) {
      setError("Please enter a valid subdomain");
      return;
    }
    
    // Basic validation for subdomain format
    if (!/^[a-zA-Z0-9.-]+$/.test(subdomain)) {
      setError("Invalid subdomain format");
      return;
    }

    onConfigSubmit(subdomain);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} modal={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Configure API Base URL</DialogTitle>
          <DialogDescription>
            Enter your API subdomain to connect to the backend services.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subdomain">API Subdomain</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">https://</span>
              <Input
                id="subdomain"
                placeholder="testhostharan.leapmile"
                value={subdomain}
                onChange={(e) => {
                  setSubdomain(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                className="flex-1"
                autoFocus
              />
              <span className="text-sm text-muted-foreground">.com/podcore</span>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              Example: Enter <span className="font-mono font-semibold">testhostharan.leapmile</span> to use
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              https://testhostharan.leapmile.com/podcore
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Connect</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

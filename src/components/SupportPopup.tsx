
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportPopup: React.FC<SupportPopupProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      // Only allow numeric input for phone
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [field]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.details.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create email content
      const emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .support-card {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              border: 2px solid #FDDC4E;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #FDDC4E 0%, #F5D020 100%);
              padding: 24px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              color: #000;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              padding: 24px;
            }
            .field {
              margin-bottom: 16px;
              padding: 16px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #FDDC4E;
            }
            .field-label {
              font-weight: bold;
              color: #333;
              margin-bottom: 8px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .field-value {
              color: #555;
              font-size: 16px;
              line-height: 1.5;
            }
            .footer {
              padding: 16px 24px;
              background: #f8f9fa;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="support-card">
            <div class="header">
              <h1>🎧 Support Request</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">👤 Contact Name</div>
                <div class="field-value">${formData.name}</div>
              </div>
              <div class="field">
                <div class="field-label">📞 Phone Number</div>
                <div class="field-value">${formData.phone}</div>
              </div>
              <div class="field">
                <div class="field-label">📝 Support Details</div>
                <div class="field-value">${formData.details}</div>
              </div>
            </div>
            <div class="footer">
              Submitted on ${new Date().toLocaleString()}
            </div>
          </div>
        </body>
        </html>
      `;

      // Create mailto link
      const subject = `Support Request from ${formData.name}`;
      const mailtoLink = `mailto:magesh.thalamurugan@qikpod.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Please view this support request in an HTML-capable email client.\n\nName: ${formData.name}\nPhone: ${formData.phone}\nDetails: ${formData.details}`)}`;
      
      // Open email client
      window.location.href = mailtoLink;

      toast({
        title: "Support Request Sent",
        description: "Your support request has been sent successfully. We'll get back to you soon!",
      });

      // Reset form and close popup
      setFormData({ name: '', phone: '', details: '' });
      onClose();

    } catch (error) {
      console.error('Error sending support request:', error);
      toast({
        title: "Error",
        description: "Failed to send support request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            🎧 Support
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="focus:ring-2 focus:ring-[#FDDC4E] focus:border-[#FDDC4E]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className="focus:ring-2 focus:ring-[#FDDC4E] focus:border-[#FDDC4E]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-medium text-gray-700">
              Details
            </Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => handleInputChange('details', e.target.value)}
              placeholder="Please describe your issue or question in detail..."
              className="min-h-[100px] focus:ring-2 focus:ring-[#FDDC4E] focus:border-[#FDDC4E]"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#FDDC4E] hover:bg-yellow-400 text-black"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportPopup;

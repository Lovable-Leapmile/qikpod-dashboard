
import React from 'react';
import { FileX, Inbox, Package, MapPin } from 'lucide-react';

interface NoDataIllustrationProps {
  title?: string;
  description?: string;
  icon?: 'inbox' | 'file' | 'package' | 'map-pin';
}

const NoDataIllustration: React.FC<NoDataIllustrationProps> = ({ 
  title = "No records found", 
  description = "There are no records to display at this time.",
  icon = 'inbox'
}) => {
  const IconComponent = icon === 'file' ? FileX : icon === 'package' ? Package : icon === 'map-pin' ? MapPin : Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 mb-4 text-gray-300">
        <IconComponent className="w-full h-full" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{description}</p>
    </div>
  );
};

export default NoDataIllustration;

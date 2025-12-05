import React from 'react';
import { FileX, Inbox, Package, MapPin, RefreshCw, Plus } from 'lucide-react';
import { Button } from './button';

interface NoDataIllustrationProps {
  title?: string;
  description?: string;
  icon?: 'inbox' | 'file' | 'package' | 'map-pin';
  actionLabel?: string;
  onAction?: () => void;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

const NoDataIllustration: React.FC<NoDataIllustrationProps> = ({ 
  title = "No records found", 
  description = "There are no records to display at this time.",
  icon = 'inbox',
  actionLabel,
  onAction,
  showRefresh = false,
  onRefresh
}) => {
  const IconComponent = icon === 'file' ? FileX : icon === 'package' ? Package : icon === 'map-pin' ? MapPin : Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 mb-4 text-muted-foreground/40">
        <IconComponent className="w-full h-full" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-4">{description}</p>
      
      {(actionLabel && onAction) || (showRefresh && onRefresh) ? (
        <div className="flex gap-2 mt-2">
          {showRefresh && onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction}>
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default NoDataIllustration;

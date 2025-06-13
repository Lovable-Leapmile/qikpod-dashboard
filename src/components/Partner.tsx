
import React from 'react';
import PartnerDashboard from './PartnerDashboard';

interface PartnerProps {
  onBack: () => void;
}

const Partner: React.FC<PartnerProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <PartnerDashboard />
    </div>
  );
};

export default Partner;

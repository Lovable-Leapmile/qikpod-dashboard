import React from 'react';
import Layout from '@/components/Layout';
import PaymentDetailComponent from '@/components/PaymentDetail';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentDetailPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/payments');
  };

  return (
    <Layout title="Payment Details" breadcrumb="Payments / Payment Details">
      <PaymentDetailComponent 
        paymentId={paymentId || ''} 
        onBack={handleBack}
      />
    </Layout>
  );
};

export default PaymentDetailPage;
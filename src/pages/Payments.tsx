import React from 'react';
import Layout from '@/components/Layout';
import PaymentsAgGrid from '@/components/PaymentsAgGrid';

const PaymentsPage = () => {
  return (
    <Layout title="Payments" breadcrumb="Payments">
      <PaymentsAgGrid />
    </Layout>
  );
};

export default PaymentsPage;
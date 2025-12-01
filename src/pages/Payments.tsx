import React from 'react';
import Layout from '@/components/Layout';
import PaymentsAgGrid from '@/components/PaymentsAgGrid';

const PaymentsPage = () => {
  return (
    <Layout title="Payments" breadcrumb="Payments">
      <div className="px-[4px]">
        <PaymentsAgGrid />
      </div>
    </Layout>
  );
};

export default PaymentsPage;
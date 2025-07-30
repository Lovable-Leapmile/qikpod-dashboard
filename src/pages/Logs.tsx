import React from 'react';
import Layout from '@/components/Layout';
import LogsAgGrid from '@/components/LogsAgGrid';

const LogsPage = () => {
  return (
    <Layout title="Logs" breadcrumb="Logs">
      <LogsAgGrid />
    </Layout>
  );
};

export default LogsPage;
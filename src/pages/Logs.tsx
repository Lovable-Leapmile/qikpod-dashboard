import React from 'react';
import Layout from '@/components/Layout';
import LogsAgGrid from '@/components/LogsAgGrid';

const LogsPage = () => {
  return (
    <Layout title="Logs" breadcrumb="Logs">
      <div className="px-[4px]">
        <LogsAgGrid />
      </div>
    </Layout>
  );
};

export default LogsPage;
'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// Lazy load the ReportGenerator component
const ReportGenerator = dynamic(() => import('./ReportGenerator'), {
  loading: () => (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin size="large" tip="Loading report generator..." />
    </div>
  ),
  ssr: false,
});

export default function ReportGeneratorLazy() {
  return <ReportGenerator />;
}

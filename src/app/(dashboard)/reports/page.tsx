'use client';

import { Typography } from 'antd';
import ReportGenerator from '@/components/reports/ReportGenerator';

const { Title } = Typography;

export default function ReportsPage() {
  return (
    <div>
      <Title level={2}>Reports</Title>
      <ReportGenerator />
    </div>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';
import type { PerformanceEvaluation } from '@/types/performance';

// Lazy load the PerformanceChart component
const PerformanceChart = dynamic(() => import('./PerformanceChart'), {
  loading: () => (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin size="large" tip="Loading chart..." />
    </div>
  ),
  ssr: false, // Disable server-side rendering for charts
});

interface PerformanceChartLazyProps {
  employeeId: string;
  type?: 'trend' | 'radar';
  evaluation?: PerformanceEvaluation;
}

export default function PerformanceChartLazy({
  employeeId,
  type = 'trend',
  evaluation,
}: PerformanceChartLazyProps) {
  return <PerformanceChart employeeId={employeeId} type={type} evaluation={evaluation} />;
}

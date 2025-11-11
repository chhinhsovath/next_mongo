'use client';

import dynamic from 'next/dynamic';
import { Spin } from 'antd';

// Lazy load the AttendanceCalendar component
const AttendanceCalendar = dynamic(() => import('./AttendanceCalendar'), {
  loading: () => (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin size="large" tip="Loading calendar..." />
    </div>
  ),
  ssr: false, // Disable server-side rendering for this component
});

interface AttendanceCalendarLazyProps {
  employeeId: string;
}

export default function AttendanceCalendarLazy({ employeeId }: AttendanceCalendarLazyProps) {
  return <AttendanceCalendar employeeId={employeeId} />;
}

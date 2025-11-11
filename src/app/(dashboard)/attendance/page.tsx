'use client';

import { useState } from 'react';
import { Typography, Tabs, Space } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import AttendanceForm from '@/components/attendance/AttendanceForm';
import AttendanceCalendar from '@/components/attendance/AttendanceCalendar';
import AttendanceReport from '@/components/attendance/AttendanceReport';

const { Title } = Typography;

export default function AttendancePage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAttendanceSuccess = () => {
    // Refresh calendar by changing key
    setRefreshKey((prev) => prev + 1);
  };

  const items = [
    {
      key: 'check-in-out',
      label: (
        <span>
          <ClockCircleOutlined />
          Check In/Out
        </span>
      ),
      children: user?.employee_id ? (
        <AttendanceForm
          employeeId={user.employee_id.toString()}
          onSuccess={handleAttendanceSuccess}
        />
      ) : (
        <p>Employee ID not found</p>
      ),
    },
    {
      key: 'calendar',
      label: (
        <span>
          <CalendarOutlined />
          Calendar
        </span>
      ),
      children: user?.employee_id ? (
        <AttendanceCalendar key={refreshKey} employeeId={user.employee_id.toString()} />
      ) : (
        <p>Employee ID not found</p>
      ),
    },
    {
      key: 'report',
      label: (
        <span>
          <FileTextOutlined />
          Report
        </span>
      ),
      children: user?.employee_id ? (
        <AttendanceReport employeeId={user.employee_id.toString()} />
      ) : (
        <p>Employee ID not found</p>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Attendance Tracking</Title>
      <Tabs defaultActiveKey="check-in-out" items={items} />
    </Space>
  );
}

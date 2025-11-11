'use client';

import { Typography } from 'antd';
import LeaveRequestList from '@/components/leave/LeaveRequestList';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;

export default function LeaveRequestsPage() {
  const { user } = useAuth();

  return (
    <div>
      <Title level={2}>My Leave Requests</Title>
      <LeaveRequestList employeeId={user?.employee_id} />
    </div>
  );
}

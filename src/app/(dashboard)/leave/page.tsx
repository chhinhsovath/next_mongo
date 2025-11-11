'use client';

import { useState } from 'react';
import { Typography, Row, Col, Tabs } from 'antd';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import LeaveRequestList from '@/components/leave/LeaveRequestList';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;

export default function LeavePage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div>
      <Title level={2}>Leave Management</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <LeaveRequestForm onSuccess={handleRequestSuccess} />
        </Col>
        <Col xs={24} lg={14}>
          <LeaveRequestList
            employeeId={user?.employee_id}
            refreshTrigger={refreshTrigger}
          />
        </Col>
      </Row>
    </div>
  );
}

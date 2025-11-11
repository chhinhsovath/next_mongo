'use client';

import { Typography } from 'antd';
import LeaveApprovalCard from '@/components/leave/LeaveApprovalCard';

const { Title } = Typography;

export default function LeaveApprovalsPage() {
  return (
    <div>
      <Title level={2}>Leave Approvals</Title>
      <LeaveApprovalCard />
    </div>
  );
}

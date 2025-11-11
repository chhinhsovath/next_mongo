'use client';

import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, message, Select, Card } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { LeaveStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface LeaveRequest {
  _id: string;
  leave_request_id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  leave_status: LeaveStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

interface LeaveRequestListProps {
  employeeId?: string;
  showEmployeeColumn?: boolean;
  refreshTrigger?: number;
}

const statusColors: Record<LeaveStatus, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
};

export default function LeaveRequestList({
  employeeId,
  showEmployeeColumn = false,
  refreshTrigger = 0,
}: LeaveRequestListProps) {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, [employeeId, statusFilter, refreshTrigger]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (employeeId) {
        params.append('employee_id', employeeId);
      }
      if (statusFilter !== 'all') {
        params.append('leave_status', statusFilter);
      }

      const response = await fetch(`/api/leave?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setLeaveRequests(data.data.leave_requests || []);
      } else {
        message.error(data.message || 'Failed to fetch leave requests');
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      message.error('An error occurred while fetching leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (leaveRequestId: string) => {
    Modal.confirm({
      title: 'Cancel Leave Request',
      content: 'Are you sure you want to cancel this leave request?',
      okText: 'Yes, Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/leave/${leaveRequestId}`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (data.success) {
            message.success('Leave request cancelled successfully');
            fetchLeaveRequests();
          } else {
            message.error(data.message || 'Failed to cancel leave request');
          }
        } catch (error) {
          console.error('Error cancelling leave request:', error);
          message.error('An error occurred while cancelling the leave request');
        }
      },
    });
  };

  const handleViewDetails = (record: LeaveRequest) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const columns = [
    ...(showEmployeeColumn
      ? [
          {
            title: 'Employee ID',
            dataIndex: 'employee_id',
            key: 'employee_id',
          },
        ]
      : []),
    {
      title: 'Request ID',
      dataIndex: 'leave_request_id',
      key: 'leave_request_id',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Total Days',
      dataIndex: 'total_days',
      key: 'total_days',
    },
    {
      title: 'Status',
      dataIndex: 'leave_status',
      key: 'leave_status',
      render: (status: LeaveStatus) => (
        <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LeaveRequest) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          {record.leave_status === 'pending' &&
            record.employee_id === user?.employee_id && (
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleCancelRequest(record.leave_request_id)}
              >
                Cancel
              </Button>
            )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Leave Requests"
        extra={
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'Cancelled', value: 'cancelled' },
            ]}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={leaveRequests}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} requests`,
          }}
        />
      </Card>

      <Modal
        title="Leave Request Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedRequest && (
          <div>
            <p>
              <strong>Request ID:</strong> {selectedRequest.leave_request_id}
            </p>
            <p>
              <strong>Employee ID:</strong> {selectedRequest.employee_id}
            </p>
            <p>
              <strong>Start Date:</strong>{' '}
              {dayjs(selectedRequest.start_date).format('YYYY-MM-DD')}
            </p>
            <p>
              <strong>End Date:</strong>{' '}
              {dayjs(selectedRequest.end_date).format('YYYY-MM-DD')}
            </p>
            <p>
              <strong>Total Days:</strong> {selectedRequest.total_days}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <Tag color={statusColors[selectedRequest.leave_status]}>
                {selectedRequest.leave_status.toUpperCase()}
              </Tag>
            </p>
            <p>
              <strong>Reason:</strong> {selectedRequest.reason}
            </p>
            {selectedRequest.approved_by && (
              <p>
                <strong>Approved By:</strong> {selectedRequest.approved_by}
              </p>
            )}
            {selectedRequest.approved_at && (
              <p>
                <strong>Approved At:</strong>{' '}
                {dayjs(selectedRequest.approved_at).format('YYYY-MM-DD HH:mm')}
              </p>
            )}
            {selectedRequest.rejection_reason && (
              <p>
                <strong>Rejection Reason:</strong> {selectedRequest.rejection_reason}
              </p>
            )}
            <p>
              <strong>Submitted:</strong>{' '}
              {dayjs(selectedRequest.created_at).format('YYYY-MM-DD HH:mm')}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

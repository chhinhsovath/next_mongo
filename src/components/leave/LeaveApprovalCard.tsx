'use client';

import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, Input, message } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { LeaveStatus } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const { TextArea } = Input;

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
  created_at: string;
}

const statusColors: Record<LeaveStatus, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
};

export default function LeaveApprovalCard() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leave?leave_status=pending');
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

  const handleApprove = async (leaveRequestId: string) => {
    if (!user?.user_id) {
      message.error('User information not available');
      return;
    }

    Modal.confirm({
      title: 'Approve Leave Request',
      content: 'Are you sure you want to approve this leave request?',
      okText: 'Yes, Approve',
      okType: 'primary',
      onOk: async () => {
        setActionLoading(true);
        try {
          const response = await fetch(`/api/leave/${leaveRequestId}/approve`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              approved_by: user.user_id,
            }),
          });

          const data = await response.json();

          if (data.success) {
            message.success('Leave request approved successfully');
            fetchPendingRequests();
          } else {
            message.error(data.message || 'Failed to approve leave request');
          }
        } catch (error) {
          console.error('Error approving leave request:', error);
          message.error('An error occurred while approving the leave request');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleRejectClick = (record: LeaveRequest) => {
    setSelectedRequest(record);
    setRejectionReason('');
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;

    if (!rejectionReason.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/leave/${selectedRequest.leave_request_id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejection_reason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Leave request rejected successfully');
        setRejectModalVisible(false);
        setSelectedRequest(null);
        setRejectionReason('');
        fetchPendingRequests();
      } else {
        message.error(data.message || 'Failed to reject leave request');
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      message.error('An error occurred while rejecting the leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (record: LeaveRequest) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'leave_request_id',
      key: 'leave_request_id',
    },
    {
      title: 'Employee ID',
      dataIndex: 'employee_id',
      key: 'employee_id',
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
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record.leave_request_id)}
            loading={actionLoading}
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleRejectClick(record)}
            loading={actionLoading}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card title="Pending Leave Approvals">
        <Table
          columns={columns}
          dataSource={leaveRequests}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} pending requests`,
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
            <p>
              <strong>Submitted:</strong>{' '}
              {dayjs(selectedRequest.created_at).format('YYYY-MM-DD HH:mm')}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title="Reject Leave Request"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedRequest(null);
          setRejectionReason('');
        }}
        onOk={handleRejectSubmit}
        confirmLoading={actionLoading}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <p>Please provide a reason for rejecting this leave request:</p>
        <TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection reason..."
          maxLength={500}
          showCount
        />
      </Modal>
    </>
  );
}

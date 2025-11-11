'use client';

import { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, message, Card } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface LeaveType {
  _id: string;
  leave_type_id: string;
  leave_type_name: string;
  leave_type_name_khmer?: string;
  annual_quota: number;
}

interface LeaveBalance {
  leave_type_id: string;
  remaining_days: number;
}

interface LeaveRequestFormProps {
  onSuccess?: () => void;
  employeeId?: string;
}

export default function LeaveRequestForm({ onSuccess, employeeId }: LeaveRequestFormProps) {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);

  const effectiveEmployeeId = employeeId || user?.employee_id;

  useEffect(() => {
    fetchLeaveTypes();
    if (effectiveEmployeeId) {
      fetchLeaveBalances();
    }
  }, [effectiveEmployeeId]);

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch('/api/leave-types');
      const data = await response.json();
      if (data.success) {
        setLeaveTypes(data.data.leave_types || []);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const response = await fetch(`/api/leave/balance?employee_id=${effectiveEmployeeId}`);
      const data = await response.json();
      if (data.success) {
        setLeaveBalances(data.data.balances || []);
      }
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    }
  };

  const getLeaveBalance = (leaveTypeId: string): number => {
    const balance = leaveBalances.find((b) => b.leave_type_id === leaveTypeId);
    return balance?.remaining_days || 0;
  };

  const handleSubmit = async (values: any) => {
    if (!effectiveEmployeeId) {
      message.error('Employee ID is required');
      return;
    }

    setLoading(true);
    try {
      const [startDate, endDate] = values.dateRange;

      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: effectiveEmployeeId,
          leave_type_id: values.leave_type_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          reason: values.reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Leave request submitted successfully');
        form.resetFields();
        setSelectedLeaveType(null);
        fetchLeaveBalances(); // Refresh balances
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(data.message || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      message.error('An error occurred while submitting the leave request');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: Dayjs) => {
    // Disable dates before today
    return current && current < dayjs().startOf('day');
  };

  return (
    <Card title="Submit Leave Request">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Leave Type"
          name="leave_type_id"
          rules={[{ required: true, message: 'Please select a leave type' }]}
        >
          <Select
            placeholder="Select leave type"
            onChange={(value) => setSelectedLeaveType(value)}
            options={leaveTypes.map((type) => ({
              label: `${type.leave_type_name} (${getLeaveBalance(type.leave_type_id)} days remaining)`,
              value: type.leave_type_id,
            }))}
          />
        </Form.Item>

        {selectedLeaveType && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 4 }}>
            <strong>Available Balance:</strong> {getLeaveBalance(selectedLeaveType)} days
          </div>
        )}

        <Form.Item
          label="Date Range"
          name="dateRange"
          rules={[{ required: true, message: 'Please select date range' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            disabledDate={disabledDate}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          label="Reason"
          name="reason"
          rules={[
            { required: true, message: 'Please provide a reason' },
            { max: 500, message: 'Reason must be less than 500 characters' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Please provide a reason for your leave request"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Submit Leave Request
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

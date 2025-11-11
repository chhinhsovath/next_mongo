'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Space, DatePicker, Select, message, Modal } from 'antd';
import { EyeOutlined, CheckOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { PayrollWithEmployee } from '@/types/payroll';

const { MonthPicker } = DatePicker;
const { Option } = Select;

interface PayrollTableProps {
  onViewPayslip: (payroll: PayrollWithEmployee) => void;
  onExport?: (payroll_month: string) => void;
}

export default function PayrollTable({ onViewPayslip, onExport }: PayrollTableProps) {
  const [payrolls, setPayrolls] = useState<PayrollWithEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Fetch payrolls
  const fetchPayrolls = async (month: Dayjs, status: string, page: number = 1) => {
    setLoading(true);
    try {
      const payroll_month = month.format('YYYY-MM');
      const params = new URLSearchParams({
        payroll_month,
        page: page.toString(),
        limit: pagination.pageSize.toString(),
      });

      if (status !== 'all') {
        params.append('payroll_status', status);
      }

      const response = await fetch(`/api/payroll?${params}`);
      const data = await response.json();

      if (data.success) {
        setPayrolls(data.data);
        setPagination({
          ...pagination,
          current: data.pagination.page,
          total: data.pagination.total,
        });
      } else {
        message.error(data.message || 'Failed to fetch payroll');
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      message.error('Failed to fetch payroll');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  React.useEffect(() => {
    fetchPayrolls(selectedMonth, statusFilter);
  }, []);

  // Handle month change
  const handleMonthChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedMonth(date);
      fetchPayrolls(date, statusFilter);
    }
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchPayrolls(selectedMonth, value);
  };

  // Handle table change (pagination)
  const handleTableChange = (newPagination: any) => {
    fetchPayrolls(selectedMonth, statusFilter, newPagination.current);
  };

  // Handle approve
  const handleApprove = async (payroll_id: string) => {
    Modal.confirm({
      title: 'Approve Payroll',
      content: 'Are you sure you want to approve this payroll?',
      onOk: async () => {
        try {
          const response = await fetch(`/api/payroll/${payroll_id}/approve`, {
            method: 'PUT',
          });
          const data = await response.json();

          if (data.success) {
            message.success('Payroll approved successfully');
            fetchPayrolls(selectedMonth, statusFilter, pagination.current);
          } else {
            message.error(data.message || 'Failed to approve payroll');
          }
        } catch (error) {
          console.error('Error approving payroll:', error);
          message.error('Failed to approve payroll');
        }
      },
    });
  };

  // Handle delete
  const handleDelete = async (payroll_id: string) => {
    Modal.confirm({
      title: 'Delete Payroll',
      content: 'Are you sure you want to delete this draft payroll?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/payroll/${payroll_id}`, {
            method: 'DELETE',
          });
          const data = await response.json();

          if (data.success) {
            message.success('Payroll deleted successfully');
            fetchPayrolls(selectedMonth, statusFilter, pagination.current);
          } else {
            message.error(data.message || 'Failed to delete payroll');
          }
        } catch (error) {
          console.error('Error deleting payroll:', error);
          message.error('Failed to delete payroll');
        }
      },
    });
  };

  // Handle export
  const handleExport = () => {
    if (onExport) {
      onExport(selectedMonth.format('YYYY-MM'));
    } else {
      message.info('Export functionality not implemented');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'approved':
        return 'blue';
      case 'paid':
        return 'green';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<PayrollWithEmployee> = [
    {
      title: 'Employee Code',
      dataIndex: ['employee', 'employee_code'],
      key: 'employee_code',
      width: 120,
    },
    {
      title: 'Employee Name',
      key: 'employee_name',
      width: 200,
      render: (_, record) => {
        const employee = record.employee;
        return (
          <div>
            <div>{`${employee.first_name} ${employee.last_name}`}</div>
            {employee.first_name_khmer && (
              <div style={{ fontSize: '12px', color: '#888' }}>
                {`${employee.first_name_khmer} ${employee.last_name_khmer}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Base Salary',
      dataIndex: 'base_salary',
      key: 'base_salary',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Allowances',
      dataIndex: 'allowances',
      key: 'allowances',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Bonuses',
      dataIndex: 'bonuses',
      key: 'bonuses',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Deductions',
      dataIndex: 'deductions',
      key: 'deductions',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Net Salary',
      dataIndex: 'net_salary',
      key: 'net_salary',
      width: 140,
      align: 'right',
      render: (amount: number) => (
        <strong style={{ color: '#52c41a' }}>{formatCurrency(amount)}</strong>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'payroll_status',
      key: 'payroll_status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewPayslip(record)}
          >
            View
          </Button>
          {record.payroll_status === 'draft' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.payroll_id)}
              >
                Approve
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.payroll_id)}
              >
                Delete
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <MonthPicker
            value={selectedMonth}
            onChange={handleMonthChange}
            format="YYYY-MM"
            placeholder="Select month"
          />
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            style={{ width: 150 }}
          >
            <Option value="all">All Status</Option>
            <Option value="draft">Draft</Option>
            <Option value="approved">Approved</Option>
            <Option value="paid">Paid</Option>
          </Select>
        </Space>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          Export
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={payrolls}
        rowKey="payroll_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}

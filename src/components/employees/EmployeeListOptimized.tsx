'use client';

import { useState, useMemo } from 'react';
import { Table, Button, Input, Select, Space, Tag, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import type { Employee } from '@/types/employee';
import dayjs from 'dayjs';

const { Search } = Input;

interface EmployeeListOptimizedProps {
  onEdit?: (employee: Employee) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EmployeeListOptimized({ onEdit }: EmployeeListOptimizedProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<string>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Build query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
    });
    if (search) params.set('search', search);
    if (departmentFilter) params.set('department_id', departmentFilter);
    if (statusFilter) params.set('employee_status', statusFilter);
    return params.toString();
  }, [page, pageSize, search, departmentFilter, statusFilter]);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/employees?${queryParams}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  const handleDelete = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        message.success('Employee deleted successfully');
        mutate();
      } else {
        message.error(result.message || 'Failed to delete employee');
      }
    } catch (error) {
      message.error('Failed to delete employee');
    }
  };

  // Memoize columns to prevent re-creation on every render
  const columns = useMemo(() => [
    {
      title: 'Employee Code',
      dataIndex: 'employee_code',
      key: 'employee_code',
      width: 120,
      fixed: 'left' as const,
    },
    {
      title: 'Name',
      key: 'name',
      width: 200,
      render: (_: any, record: Employee) => (
        <div>
          <div>{`${record.first_name} ${record.last_name}`}</div>
          {record.first_name_khmer && (
            <div className="text-gray-500 text-sm">
              {`${record.first_name_khmer} ${record.last_name_khmer}`}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
      width: 120,
    },
    {
      title: 'Type',
      dataIndex: 'employee_type',
      key: 'employee_type',
      width: 120,
      render: (type: string) => {
        const colors: Record<string, string> = {
          full_time: 'blue',
          part_time: 'cyan',
          contract: 'orange',
          intern: 'purple',
        };
        return <Tag color={colors[type]}>{type.replace('_', ' ').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'employee_status',
      key: 'employee_status',
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'green',
          inactive: 'orange',
          terminated: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Hire Date',
      dataIndex: 'hire_date',
      key: 'hire_date',
      width: 120,
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Employee) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/employees/${record.employee_id}`)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
          />
          <Popconfirm
            title="Delete employee"
            description="Are you sure you want to delete this employee?"
            onConfirm={() => handleDelete(record.employee_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ], [router, onEdit]);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Space>
          <Search
            placeholder="Search employees..."
            allowClear
            onSearch={setSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={setStatusFilter}
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Terminated', value: 'terminated' },
            ]}
          />
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/employees/new')}
        >
          Add Employee
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data?.employees || []}
        rowKey="employee_id"
        loading={isLoading}
        scroll={{ x: 1200, y: 600 }} // Enable virtual scrolling
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} employees`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />
    </div>
  );
}

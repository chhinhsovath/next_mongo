'use client';

import { useState } from 'react';
import { Card, Tabs, Button, Descriptions, Tag, Space, Modal, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import dayjs from 'dayjs';
import EmployeeForm from '@/components/employees/EmployeeForm';
import type { Employee } from '@/types/employee';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/employees/${employeeId}`,
    fetcher
  );

  const employee: Employee | undefined = data?.data?.employee;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !employee) {
    return <div>Employee not found</div>;
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    mutate();
    message.success('Employee updated successfully');
  };

  const items = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Employee Code">
            {employee.employee_code}
          </Descriptions.Item>
          <Descriptions.Item label="Employee ID">
            {employee.employee_id}
          </Descriptions.Item>
          <Descriptions.Item label="Full Name">
            {`${employee.first_name} ${employee.last_name}`}
          </Descriptions.Item>
          <Descriptions.Item label="Khmer Name">
            {employee.first_name_khmer && employee.last_name_khmer
              ? `${employee.first_name_khmer} ${employee.last_name_khmer}`
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{employee.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{employee.phone_number}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {dayjs(employee.date_of_birth).format('MMMM DD, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)}
          </Descriptions.Item>
          <Descriptions.Item label="National ID">
            {employee.national_id}
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>
            {employee.address}
          </Descriptions.Item>
          <Descriptions.Item label="Employee Type">
            <Tag color="blue">
              {employee.employee_type.replace('_', ' ').toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                employee.employee_status === 'active'
                  ? 'green'
                  : employee.employee_status === 'inactive'
                  ? 'orange'
                  : 'red'
              }
            >
              {employee.employee_status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Hire Date">
            {dayjs(employee.hire_date).format('MMMM DD, YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Termination Date">
            {employee.termination_date
              ? dayjs(employee.termination_date).format('MMMM DD, YYYY')
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Salary">
            ${employee.salary_amount.toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Department ID">
            {employee.department_id}
          </Descriptions.Item>
          <Descriptions.Item label="Position ID">
            {employee.position_id}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'attendance',
      label: 'Attendance',
      children: <div>Attendance records - Coming soon</div>,
    },
    {
      key: 'leave',
      label: 'Leave',
      children: <div>Leave requests - Coming soon</div>,
    },
    {
      key: 'performance',
      label: 'Performance',
      children: <div>Performance evaluations - Coming soon</div>,
    },
    {
      key: 'payroll',
      label: 'Payroll',
      children: <div>Payroll records - Coming soon</div>,
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/employees')}
        >
          Back to Employees
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => setIsEditModalOpen(true)}
        >
          Edit Employee
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        {`${employee.first_name} ${employee.last_name}`}
      </h1>

      <Card>
        <Tabs items={items} />
      </Card>

      <Modal
        title="Edit Employee"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <EmployeeForm
          employee={employee}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

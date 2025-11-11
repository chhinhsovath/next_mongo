'use client';

import { Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import EmployeeForm from '@/components/employees/EmployeeForm';

export default function NewEmployeePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/employees');
  };

  const handleCancel = () => {
    router.push('/employees');
  };

  return (
    <div>
      <div className="mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/employees')}
        >
          Back to Employees
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Add New Employee</h1>

      <Card>
        <EmployeeForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </Card>
    </div>
  );
}

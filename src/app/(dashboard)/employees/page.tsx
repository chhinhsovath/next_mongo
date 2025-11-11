'use client';

import { useState } from 'react';
import { Card, Modal } from 'antd';
import EmployeeList from '@/components/employees/EmployeeList';
import EmployeeForm from '@/components/employees/EmployeeForm';
import type { Employee } from '@/types/employee';

export default function EmployeesPage() {
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingEmployee(undefined);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingEmployee(undefined);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Employee Management</h1>
      
      <Card>
        <EmployeeList onEdit={handleEdit} />
      </Card>

      <Modal
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <EmployeeForm
          employee={editingEmployee}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  );
}

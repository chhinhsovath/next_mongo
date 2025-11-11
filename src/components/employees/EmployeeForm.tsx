'use client';

import { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button, Row, Col, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import dayjs from 'dayjs';
import type { Employee } from '@/types/employee';

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const [form] = Form.useForm();
  const isEdit = !!employee;

  // Fetch departments and positions
  const { data: departmentsData } = useSWR('/api/departments', fetcher);
  const { data: positionsData } = useSWR('/api/positions', fetcher);

  useEffect(() => {
    if (employee) {
      form.setFieldsValue({
        ...employee,
        date_of_birth: employee.date_of_birth ? dayjs(employee.date_of_birth) : null,
        hire_date: employee.hire_date ? dayjs(employee.hire_date) : null,
        termination_date: employee.termination_date ? dayjs(employee.termination_date) : null,
      });
    }
  }, [employee, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        date_of_birth: values.date_of_birth?.toISOString(),
        hire_date: values.hire_date?.toISOString(),
        termination_date: values.termination_date?.toISOString(),
      };

      const url = isEdit ? `/api/employees/${employee.employee_id}` : '/api/employees';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        message.success(isEdit ? 'Employee updated successfully' : 'Employee created successfully');
        form.resetFields();
        onSuccess?.();
      } else {
        // Display validation errors if available
        if (result.details && Array.isArray(result.details)) {
          result.details.forEach((detail: any) => {
            message.error(`${detail.field}: ${detail.message}`);
          });
        } else {
          message.error(result.message || 'Operation failed');
        }
      }
    } catch (error) {
      message.error('An error occurred. Please try again.');
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        employee_type: 'full_time',
        employee_status: 'active',
        gender: 'male',
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Employee Code"
            name="employee_code"
            rules={[{ required: true, message: 'Please enter employee code' }]}
          >
            <Input placeholder="e.g., EMP001" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' },
            ]}
          >
            <Input placeholder="employee@example.com" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="First Name"
            name="first_name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input placeholder="First name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Last Name"
            name="last_name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input placeholder="Last name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="First Name (Khmer)" name="first_name_khmer">
            <Input placeholder="នាមខ្លួន" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Last Name (Khmer)" name="last_name_khmer">
            <Input placeholder="នាមត្រកូល" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Phone Number"
            name="phone_number"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input placeholder="+855 12 345 678" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="National ID"
            name="national_id"
            rules={[{ required: true, message: 'Please enter national ID' }]}
          >
            <Input placeholder="National ID number" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Date of Birth"
            name="date_of_birth"
            rules={[{ required: true, message: 'Please select date of birth' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: 'Please select gender' }]}
          >
            <Select>
              <Select.Option value="male">Male</Select.Option>
              <Select.Option value="female">Female</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Hire Date"
            name="hire_date"
            rules={[{ required: true, message: 'Please select hire date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Address"
        name="address"
        rules={[{ required: true, message: 'Please enter address' }]}
      >
        <Input.TextArea rows={2} placeholder="Full address" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Department"
            name="department_id"
            rules={[{ required: true, message: 'Please select department' }]}
          >
            <Select
              placeholder="Select department"
              loading={!departmentsData}
              options={departmentsData?.data?.departments?.map((dept: any) => ({
                label: dept.department_name,
                value: dept.department_id,
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Position"
            name="position_id"
            rules={[{ required: true, message: 'Please select position' }]}
          >
            <Select
              placeholder="Select position"
              loading={!positionsData}
              options={positionsData?.data?.positions?.map((pos: any) => ({
                label: pos.position_name,
                value: pos.position_id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Employee Type"
            name="employee_type"
            rules={[{ required: true, message: 'Please select employee type' }]}
          >
            <Select>
              <Select.Option value="full_time">Full Time</Select.Option>
              <Select.Option value="part_time">Part Time</Select.Option>
              <Select.Option value="contract">Contract</Select.Option>
              <Select.Option value="intern">Intern</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Salary Amount"
            name="salary_amount"
            rules={[{ required: true, message: 'Please enter salary amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
            />
          </Form.Item>
        </Col>
        {isEdit && (
          <Col span={8}>
            <Form.Item label="Status" name="employee_status">
              <Select>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
                <Select.Option value="terminated">Terminated</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        )}
      </Row>

      {isEdit && (
        <Form.Item label="Termination Date" name="termination_date">
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
          {isEdit ? 'Update Employee' : 'Create Employee'}
        </Button>
        {onCancel && (
          <Button style={{ marginLeft: 8 }} onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Form.Item>
    </Form>
  );
}

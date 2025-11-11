'use client';

import React, { useState } from 'react';
import { Card, Button, Space, Modal, Form, DatePicker, InputNumber, message, Select, Tabs } from 'antd';
import { PlusOutlined, FileAddOutlined } from '@ant-design/icons';
import PayrollTable from '@/components/payroll/PayrollTable';
import PayslipView from '@/components/payroll/PayslipView';
import { PayrollWithEmployee } from '@/types/payroll';
import dayjs, { Dayjs } from 'dayjs';

const { MonthPicker } = DatePicker;
const { Option } = Select;

export default function PayrollPage() {
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollWithEmployee | null>(null);
  const [payslipVisible, setPayslipVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [generateForm] = Form.useForm();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch employees for dropdown
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch('/api/employees?limit=1000');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  React.useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle view payslip
  const handleViewPayslip = (payroll: PayrollWithEmployee) => {
    setSelectedPayroll(payroll);
    setPayslipVisible(true);
  };

  // Handle create payroll
  const handleCreatePayroll = async (values: any) => {
    try {
      const payload = {
        employee_id: values.employee_id,
        payroll_month: values.payroll_month.format('YYYY-MM'),
        base_salary: values.base_salary,
        allowances: values.allowances || 0,
        bonuses: values.bonuses || 0,
        deductions: values.deductions || 0,
        overtime_pay: values.overtime_pay || 0,
      };

      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Payroll created successfully');
        setCreateModalVisible(false);
        form.resetFields();
        setRefreshKey((prev) => prev + 1);
      } else {
        message.error(data.message || 'Failed to create payroll');
      }
    } catch (error) {
      console.error('Error creating payroll:', error);
      message.error('Failed to create payroll');
    }
  };

  // Handle generate payroll
  const handleGeneratePayroll = async (values: any) => {
    try {
      const payload = {
        payroll_month: values.payroll_month.format('YYYY-MM'),
        employee_ids: values.employee_ids,
      };

      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        const result = data.data;
        message.success(
          `Generated ${result.created.length} payroll records. Skipped: ${result.skipped.length}, Errors: ${result.errors.length}`
        );
        setGenerateModalVisible(false);
        generateForm.resetFields();
        setRefreshKey((prev) => prev + 1);
      } else {
        message.error(data.message || 'Failed to generate payroll');
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
      message.error('Failed to generate payroll');
    }
  };

  // Handle employee selection for auto-fill
  const handleEmployeeSelect = (employee_id: string) => {
    const employee = employees.find((e) => e._id === employee_id);
    if (employee) {
      form.setFieldsValue({
        base_salary: employee.salary_amount,
      });
    }
  };

  // Handle export
  const handleExport = (payroll_month: string) => {
    message.info(`Export functionality for ${payroll_month} will be implemented`);
    // TODO: Implement export to Excel/PDF
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Payroll Management</h1>
        <Space>
          <Button
            type="default"
            icon={<FileAddOutlined />}
            onClick={() => setGenerateModalVisible(true)}
          >
            Generate Payroll
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Payroll
          </Button>
        </Space>
      </div>

      <Card>
        <PayrollTable
          key={refreshKey}
          onViewPayslip={handleViewPayslip}
          onExport={handleExport}
        />
      </Card>

      {/* Payslip View Modal */}
      <PayslipView
        payroll={selectedPayroll}
        visible={payslipVisible}
        onClose={() => setPayslipVisible(false)}
      />

      {/* Create Payroll Modal */}
      <Modal
        title="Create Payroll"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePayroll}
        >
          <Form.Item
            name="employee_id"
            label="Employee"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select
              showSearch
              placeholder="Select employee"
              loading={loadingEmployees}
              onChange={handleEmployeeSelect}
              filterOption={(input, option) => {
                const label = option?.label;
                if (typeof label === 'string') {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {employees.map((emp) => (
                <Option key={emp._id} value={emp._id}>
                  {emp.employee_code} - {emp.first_name} {emp.last_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="payroll_month"
            label="Payroll Month"
            rules={[{ required: true, message: 'Please select payroll month' }]}
          >
            <MonthPicker format="YYYY-MM" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="base_salary"
            label="Base Salary"
            rules={[{ required: true, message: 'Please enter base salary' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item name="allowances" label="Allowances" initialValue={0}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item name="bonuses" label="Bonuses" initialValue={0}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item name="overtime_pay" label="Overtime Pay" initialValue={0}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item name="deductions" label="Deductions" initialValue={0}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Generate Payroll Modal */}
      <Modal
        title="Generate Payroll"
        open={generateModalVisible}
        onCancel={() => {
          setGenerateModalVisible(false);
          generateForm.resetFields();
        }}
        onOk={() => generateForm.submit()}
        width={600}
      >
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={handleGeneratePayroll}
        >
          <Form.Item
            name="payroll_month"
            label="Payroll Month"
            rules={[{ required: true, message: 'Please select payroll month' }]}
          >
            <MonthPicker format="YYYY-MM" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="employee_ids"
            label="Employees (Optional)"
            help="Leave empty to generate for all active employees"
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select employees (optional)"
              loading={loadingEmployees}
              filterOption={(input, option) => {
                const label = option?.label;
                if (typeof label === 'string') {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {employees.map((emp) => (
                <Option key={emp._id} value={emp._id}>
                  {emp.employee_code} - {emp.first_name} {emp.last_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

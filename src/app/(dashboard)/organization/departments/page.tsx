'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tree,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Tag,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

interface Department {
  _id: string;
  department_id: string;
  department_code: string;
  department_name: string;
  department_name_khmer?: string;
  manager_id?: string;
  parent_department_id?: string;
  department_status: string;
  children?: Department[];
  employee_count?: number;
  manager_name?: string;
}

interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
}

export default function DepartmentManagerPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/departments?hierarchy=true');
      const data = await response.json();

      if (data.success) {
        setDepartments(data.data.departments);
      } else {
        message.error('Failed to load departments');
      }
    } catch (error) {
      message.error('Error loading departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data.employees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleCreate = () => {
    setEditingDepartment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    form.setFieldsValue({
      department_code: dept.department_code,
      department_name: dept.department_name,
      department_name_khmer: dept.department_name_khmer,
      manager_id: dept.manager_id,
      parent_department_id: dept.parent_department_id,
    });
    setModalVisible(true);
  };

  const handleDelete = async (department_id: string) => {
    try {
      const response = await fetch(`/api/departments/${department_id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        message.success('Department deleted successfully');
        fetchDepartments();
        if (selectedDepartment?.department_id === department_id) {
          setSelectedDepartment(null);
        }
      } else {
        message.error(data.message || 'Failed to delete department');
      }
    } catch (error) {
      message.error('Error deleting department');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingDepartment
        ? `/api/departments/${editingDepartment.department_id}`
        : '/api/departments';

      const method = editingDepartment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        message.success(
          editingDepartment
            ? 'Department updated successfully'
            : 'Department created successfully'
        );
        setModalVisible(false);
        form.resetFields();
        fetchDepartments();
      } else {
        message.error(data.message || 'Operation failed');
      }
    } catch (error) {
      message.error('Error saving department');
    }
  };

  const convertToTreeData = (depts: Department[]): DataNode[] => {
    return depts.map((dept) => ({
      key: dept.department_id,
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{dept.department_name}</span>
          {dept.employee_count !== undefined && (
            <Tag color="blue">
              <TeamOutlined /> {dept.employee_count}
            </Tag>
          )}
        </div>
      ),
      children: dept.children ? convertToTreeData(dept.children) : undefined,
    }));
  };

  const findDepartmentById = (
    depts: Department[],
    id: string
  ): Department | null => {
    for (const dept of depts) {
      if (dept.department_id === id) {
        return dept;
      }
      if (dept.children) {
        const found = findDepartmentById(dept.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getAllDepartmentsFlat = (depts: Department[]): Department[] => {
    let result: Department[] = [];
    for (const dept of depts) {
      result.push(dept);
      if (dept.children) {
        result = result.concat(getAllDepartmentsFlat(dept.children));
      }
    }
    return result;
  };

  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const dept = findDepartmentById(departments, selectedKeys[0] as string);
      setSelectedDepartment(dept);
    } else {
      setSelectedDepartment(null);
    }
  };

  const treeData = convertToTreeData(departments);
  const flatDepartments = getAllDepartmentsFlat(departments);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          <ApartmentOutlined /> Department Management
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Department
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card title="Department Hierarchy" loading={loading}>
          {treeData.length > 0 ? (
            <Tree
              showLine
              defaultExpandAll
              treeData={treeData}
              onSelect={handleTreeSelect}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              No departments found. Create your first department to get started.
            </div>
          )}
        </Card>

        <Card
          title="Department Details"
          extra={
            selectedDepartment && (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(selectedDepartment)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Department"
                  description="Are you sure you want to delete this department?"
                  onConfirm={() => handleDelete(selectedDepartment.department_id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            )
          }
        >
          {selectedDepartment ? (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Department Code">
                {selectedDepartment.department_code}
              </Descriptions.Item>
              <Descriptions.Item label="Department Name">
                {selectedDepartment.department_name}
              </Descriptions.Item>
              {selectedDepartment.department_name_khmer && (
                <Descriptions.Item label="Khmer Name">
                  {selectedDepartment.department_name_khmer}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Manager">
                {selectedDepartment.manager_name || 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Employee Count">
                {selectedDepartment.employee_count || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedDepartment.department_status === 'active' ? 'green' : 'red'}>
                  {selectedDepartment.department_status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              Select a department from the tree to view details
            </div>
          )}
        </Card>
      </div>

      <Modal
        title={editingDepartment ? 'Edit Department' : 'Create Department'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="department_code"
            label="Department Code"
            rules={[{ required: true, message: 'Please enter department code' }]}
          >
            <Input placeholder="e.g., IT, HR, FIN" />
          </Form.Item>

          <Form.Item
            name="department_name"
            label="Department Name"
            rules={[{ required: true, message: 'Please enter department name' }]}
          >
            <Input placeholder="e.g., Information Technology" />
          </Form.Item>

          <Form.Item name="department_name_khmer" label="Khmer Name">
            <Input placeholder="ឈ្មោះជាភាសាខ្មែរ" />
          </Form.Item>

          <Form.Item name="parent_department_id" label="Parent Department">
            <Select
              placeholder="Select parent department (optional)"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={flatDepartments
                .filter((d) => d.department_id !== editingDepartment?.department_id)
                .map((d) => ({
                  label: d.department_name,
                  value: d.department_id,
                }))}
            />
          </Form.Item>

          <Form.Item name="manager_id" label="Department Manager">
            <Select
              placeholder="Select manager (optional)"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={employees.map((emp) => ({
                label: `${emp.first_name} ${emp.last_name}`,
                value: emp.employee_id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

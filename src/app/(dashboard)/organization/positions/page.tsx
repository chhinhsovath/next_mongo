'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Tag,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Position {
  _id: string;
  position_id: string;
  position_code: string;
  position_name: string;
  position_name_khmer?: string;
  department_id: string;
  position_level?: number;
  position_status: string;
  department_name?: string;
  employee_count?: number;
}

interface Department {
  department_id: string;
  department_name: string;
}

export default function PositionManagerPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPositions();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchPositions(selectedDepartment);
    } else {
      fetchPositions();
    }
  }, [selectedDepartment]);

  const fetchPositions = async (department_id?: string) => {
    setLoading(true);
    try {
      const url = department_id
        ? `/api/positions?department_id=${department_id}`
        : '/api/positions?with_details=true';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPositions(data.data.positions);
      } else {
        message.error('Failed to load positions');
      }
    } catch (error) {
      message.error('Error loading positions');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();

      if (data.success) {
        setDepartments(data.data.departments);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleCreate = () => {
    setEditingPosition(null);
    form.resetFields();
    if (selectedDepartment) {
      form.setFieldsValue({ department_id: selectedDepartment });
    }
    setModalVisible(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    form.setFieldsValue({
      position_code: position.position_code,
      position_name: position.position_name,
      position_name_khmer: position.position_name_khmer,
      department_id: position.department_id,
      position_level: position.position_level,
    });
    setModalVisible(true);
  };

  const handleDelete = async (position_id: string) => {
    try {
      const response = await fetch(`/api/positions/${position_id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        message.success('Position deleted successfully');
        fetchPositions(selectedDepartment || undefined);
      } else {
        message.error(data.message || 'Failed to delete position');
      }
    } catch (error) {
      message.error('Error deleting position');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const url = editingPosition
        ? `/api/positions/${editingPosition.position_id}`
        : '/api/positions';

      const method = editingPosition ? 'PUT' : 'POST';

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
          editingPosition
            ? 'Position updated successfully'
            : 'Position created successfully'
        );
        setModalVisible(false);
        form.resetFields();
        fetchPositions(selectedDepartment || undefined);
      } else {
        message.error(data.message || 'Operation failed');
      }
    } catch (error) {
      message.error('Error saving position');
    }
  };

  const columns: ColumnsType<Position> = [
    {
      title: 'Position Code',
      dataIndex: 'position_code',
      key: 'position_code',
      sorter: (a, b) => a.position_code.localeCompare(b.position_code),
    },
    {
      title: 'Position Name',
      dataIndex: 'position_name',
      key: 'position_name',
      sorter: (a, b) => a.position_name.localeCompare(b.position_name),
    },
    {
      title: 'Khmer Name',
      dataIndex: 'position_name_khmer',
      key: 'position_name_khmer',
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
      sorter: (a, b) => (a.department_name || '').localeCompare(b.department_name || ''),
    },
    {
      title: 'Level',
      dataIndex: 'position_level',
      key: 'position_level',
      sorter: (a, b) => (a.position_level || 0) - (b.position_level || 0),
      render: (level) => level || '-',
    },
    {
      title: 'Employees',
      dataIndex: 'employee_count',
      key: 'employee_count',
      sorter: (a, b) => (a.employee_count || 0) - (b.employee_count || 0),
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'position_status',
      key: 'position_status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Position"
            description="Are you sure you want to delete this position?"
            onConfirm={() => handleDelete(record.position_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          <IdcardOutlined /> Position Management
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Position
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <span>Filter by Department:</span>
            <Select
              style={{ width: 250 }}
              placeholder="All Departments"
              allowClear
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              options={departments.map((dept) => ({
                label: dept.department_name,
                value: dept.department_id,
              }))}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={positions}
          rowKey="position_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} positions`,
          }}
        />
      </Card>

      <Modal
        title={editingPosition ? 'Edit Position' : 'Create Position'}
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
            name="position_code"
            label="Position Code"
            rules={[{ required: true, message: 'Please enter position code' }]}
          >
            <Input placeholder="e.g., MGR, DEV, ANALYST" />
          </Form.Item>

          <Form.Item
            name="position_name"
            label="Position Name"
            rules={[{ required: true, message: 'Please enter position name' }]}
          >
            <Input placeholder="e.g., Software Developer" />
          </Form.Item>

          <Form.Item name="position_name_khmer" label="Khmer Name">
            <Input placeholder="ឈ្មោះជាភាសាខ្មែរ" />
          </Form.Item>

          <Form.Item
            name="department_id"
            label="Department"
            rules={[{ required: true, message: 'Please select a department' }]}
          >
            <Select
              placeholder="Select department"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={departments.map((dept) => ({
                label: dept.department_name,
                value: dept.department_id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="position_level"
            label="Position Level"
            help="Lower numbers indicate higher positions (1 = highest)"
          >
            <InputNumber
              min={1}
              max={10}
              placeholder="e.g., 1 for executive, 5 for staff"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

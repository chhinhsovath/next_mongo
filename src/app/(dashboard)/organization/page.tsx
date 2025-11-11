'use client';

import { useState, useEffect } from 'react';
import { Card, Button, message, Spin, Empty, Tree } from 'antd';
import {
  ApartmentOutlined,
  TeamOutlined,
  UserOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import type { DataNode } from 'antd/es/tree';

interface Department {
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

export default function OrganizationPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
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

  const convertToTreeData = (depts: Department[]): DataNode[] => {
    return depts.map((dept) => ({
      key: dept.department_id,
      title: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
            {dept.department_name}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <span style={{ marginRight: 16 }}>
              <UserOutlined /> Manager: {dept.manager_name || 'Not assigned'}
            </span>
            <span>
              <TeamOutlined /> Employees: {dept.employee_count || 0}
            </span>
          </div>
        </div>
      ),
      children: dept.children ? convertToTreeData(dept.children) : undefined,
    }));
  };

  const treeData = convertToTreeData(departments);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, marginBottom: 8 }}>
          <ApartmentOutlined /> Organization Structure
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          View and manage your organization's departments and positions
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <Link href="/organization/departments">
          <Card
            hoverable
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <ApartmentOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
              Department Management
            </h2>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>
              Create and manage departments with hierarchy
            </p>
          </Card>
        </Link>

        <Link href="/organization/positions">
          <Card
            hoverable
            style={{ textAlign: 'center', cursor: 'pointer' }}
          >
            <IdcardOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
              Position Management
            </h2>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>
              Define positions and link them to departments
            </p>
          </Card>
        </Link>
      </div>

      <Card title="Organizational Chart" loading={loading}>
        {treeData.length > 0 ? (
          <Tree
            showLine
            defaultExpandAll
            treeData={treeData}
            style={{ fontSize: 14 }}
          />
        ) : (
          <Empty
            description="No departments found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link href="/organization/departments">
              <Button type="primary">Create First Department</Button>
            </Link>
          </Empty>
        )}
      </Card>
    </div>
  );
}

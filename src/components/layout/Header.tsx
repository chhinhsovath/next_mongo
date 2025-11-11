'use client';

import { Layout, Dropdown, Avatar, Space, Typography, Button } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/contexts/AuthContext';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Header({ collapsed, onToggle }: HeaderProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => {
        // Navigate to profile page (to be implemented)
        console.log('Navigate to profile');
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        // Navigate to settings page (to be implemented)
        console.log('Navigate to settings');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const getUserDisplayName = () => {
    if (!user) return 'User';
    // If we have employee data, use it
    if (user.employee) {
      return `${user.employee.first_name} ${user.employee.last_name}`;
    }
    return user.username;
  };

  const getUserRole = () => {
    if (!user) return '';
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      hr_manager: 'HR Manager',
      manager: 'Manager',
      employee: 'Employee',
    };
    return roleMap[user.user_role] || user.user_role;
  };

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />

      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{getUserDisplayName()}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {getUserRole()}
            </Text>
          </Space>
        </Space>
      </Dropdown>
    </AntHeader>
  );
}

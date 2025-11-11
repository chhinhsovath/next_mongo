'use client';

import { Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TrophyOutlined,
  ApartmentOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/rbac';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const userRole = user?.user_role;

  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard'),
    },
    userRole && hasPermission(userRole, 'VIEW_EMPLOYEES') && {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
      onClick: () => router.push('/employees'),
    },
    userRole && hasPermission(userRole, 'VIEW_OWN_LEAVE') && {
      key: '/leave',
      icon: <CalendarOutlined />,
      label: 'Leave Management',
      children: [
        {
          key: '/leave/requests',
          label: 'My Requests',
          onClick: () => router.push('/leave/requests'),
        },
        userRole && hasPermission(userRole, 'APPROVE_LEAVE') && {
          key: '/leave/approvals',
          label: 'Approvals',
          onClick: () => router.push('/leave/approvals'),
        },
      ].filter(Boolean),
    },
    userRole && hasPermission(userRole, 'VIEW_OWN_ATTENDANCE') && {
      key: '/attendance',
      icon: <ClockCircleOutlined />,
      label: 'Attendance',
      onClick: () => router.push('/attendance'),
    },
    userRole && hasPermission(userRole, 'VIEW_OWN_PAYROLL') && {
      key: '/payroll',
      icon: <DollarOutlined />,
      label: 'Payroll',
      onClick: () => router.push('/payroll'),
    },
    userRole && hasPermission(userRole, 'VIEW_OWN_PERFORMANCE') && {
      key: '/performance',
      icon: <TrophyOutlined />,
      label: 'Performance',
      onClick: () => router.push('/performance'),
    },
    userRole && hasPermission(userRole, 'VIEW_ORGANIZATION') && {
      key: '/organization',
      icon: <ApartmentOutlined />,
      label: 'Organization',
      children: [
        {
          key: '/organization/departments',
          label: 'Departments',
          onClick: () => router.push('/organization/departments'),
        },
        {
          key: '/organization/positions',
          label: 'Positions',
          onClick: () => router.push('/organization/positions'),
        },
      ],
    },
    userRole && hasPermission(userRole, 'VIEW_REPORTS') && {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
      onClick: () => router.push('/reports'),
    },
  ].filter(Boolean) as MenuItem[];

  // Determine selected key based on current pathname
  const getSelectedKey = () => {
    if (pathname.startsWith('/leave/approvals')) return '/leave/approvals';
    if (pathname.startsWith('/leave/requests')) return '/leave/requests';
    if (pathname.startsWith('/leave')) return '/leave';
    if (pathname.startsWith('/organization/departments')) return '/organization/departments';
    if (pathname.startsWith('/organization/positions')) return '/organization/positions';
    if (pathname.startsWith('/organization')) return '/organization';
    if (pathname.startsWith('/employees')) return '/employees';
    if (pathname.startsWith('/attendance')) return '/attendance';
    if (pathname.startsWith('/payroll')) return '/payroll';
    if (pathname.startsWith('/performance')) return '/performance';
    if (pathname.startsWith('/reports')) return '/reports';
    return '/dashboard';
  };

  // Determine open keys for submenus
  const getOpenKeys = () => {
    if (pathname.startsWith('/leave')) return ['/leave'];
    if (pathname.startsWith('/organization')) return ['/organization'];
    return [];
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      defaultOpenKeys={getOpenKeys()}
      items={menuItems}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
}

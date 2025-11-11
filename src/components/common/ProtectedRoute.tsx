'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { PERMISSIONS } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: keyof typeof PERMISSIONS;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, hasRole, hasPermission } = useAuth();

  // Demo mode - bypass authentication for now
  // TODO: Re-enable after MongoDB is set up
  // if (isLoading) {
  //   return (
  //     <div
  //       style={{
  //         display: 'flex',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         minHeight: '100vh',
  //       }}
  //     >
  //       <Spin size="large" />
  //     </div>
  //   );
  // }

  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isLoading, isAuthenticated, router]);

  // if (!isAuthenticated) {
  //   return null;
  // }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div>
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div>
          <h2>Access Denied</h2>
          <p>You do not have permission to access this feature.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

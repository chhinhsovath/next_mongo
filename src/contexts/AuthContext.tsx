'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types';
import { hasRole, hasPermission, PERMISSIONS } from '@/lib/rbac';

interface AuthContextType {
  user: {
    user_id: string;
    employee_id: string;
    username: string;
    role: UserRole;
    user_role: UserRole; // Alias for compatibility
    employee?: {
      first_name: string;
      last_name: string;
      first_name_khmer?: string;
      last_name_khmer?: string;
    };
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (requiredRole: UserRole) => boolean;
  hasPermission: (permission: keyof typeof PERMISSIONS) => boolean;
  isAdmin: boolean;
  isHRManager: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const userRole = session?.user?.role;

  const value: AuthContextType = {
    user: session?.user ? {
      ...session.user,
      user_role: session.user.role, // Add alias for compatibility
    } : null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    hasRole: (requiredRole: UserRole) => {
      if (!userRole) return false;
      return hasRole(userRole, requiredRole);
    },
    hasPermission: (permission: keyof typeof PERMISSIONS) => {
      if (!userRole) return false;
      return hasPermission(userRole, permission);
    },
    isAdmin: userRole === 'admin',
    isHRManager: userRole === 'hr_manager' || userRole === 'admin',
    isManager: userRole === 'manager' || userRole === 'hr_manager' || userRole === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from './auth';
import { UserRole } from '@/types';
import { hasRole, hasPermission, PERMISSIONS } from './rbac';

/**
 * Get the current user session from API route
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Require authentication for API routes
 * Optionally check for specific roles
 */
export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await getSession();

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          error: 'You must be logged in to access this resource',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      ),
      session: null,
    };
  }

  // Check if user has one of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) => hasRole(session.user.role, role));
    
    if (!hasAllowedRole) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: 'Insufficient permissions',
            error: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
            code: 'FORBIDDEN',
          },
          { status: 403 }
        ),
        session: null,
      };
    }
  }

  return { error: null, session };
}

/**
 * Require specific role for API routes
 */
export async function requireRole(requiredRole: UserRole) {
  const { error, session } = await requireAuth();

  if (error) {
    return { error, session: null };
  }

  if (!session || !hasRole(session.user.role, requiredRole)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: `This action requires ${requiredRole} role or higher`,
          code: 'FORBIDDEN',
        },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

/**
 * Require specific permission for API routes
 */
export async function requirePermission(permission: keyof typeof PERMISSIONS) {
  const { error, session } = await requireAuth();

  if (error) {
    return { error, session: null };
  }

  if (!session || !hasPermission(session.user.role, permission)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: `You do not have permission to perform this action`,
          code: 'FORBIDDEN',
        },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

/**
 * Check if the current user can access a specific employee's data
 */
export function canAccessEmployeeData(
  session: { user: { role: UserRole; employee_id: string } },
  targetEmployeeId: string
): boolean {
  // Admins and HR managers can access all employee data
  if (hasRole(session.user.role, 'hr_manager')) {
    return true;
  }

  // Employees can only access their own data
  return session.user.employee_id === targetEmployeeId;
}

/**
 * Verify authentication and return user info
 */
export async function verifyAuth(request: NextRequest) {
  const session = await getSession();

  if (!session || !session.user) {
    return {
      authenticated: false,
      user: null,
    };
  }

  return {
    authenticated: true,
    user: {
      user_id: session.user.user_id,
      employee_id: session.user.employee_id,
      user_role: session.user.role,
      username: session.user.username,
    },
  };
}

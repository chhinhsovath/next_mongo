import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { handleApiError } from '@/lib/apiError';
import { verifyAuth } from '@/lib/apiAuth';
import { getEmployeeLeaveBalances } from '@/services/leaveService';

/**
 * GET /api/leave/balance - Get leave balances for an employee
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    await connectDB();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employee_id') || authResult.user.employee_id;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

    // Check authorization - employees can only view their own balances
    if (
      authResult.user.user_role === 'employee' &&
      employeeId !== authResult.user.employee_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to view this employee\'s leave balance',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const balances = await getEmployeeLeaveBalances(employeeId, year);

    return NextResponse.json({
      success: true,
      data: {
        balances,
        employee_id: employeeId,
        year: year || new Date().getFullYear(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

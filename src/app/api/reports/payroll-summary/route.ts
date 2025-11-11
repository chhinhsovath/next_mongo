import { NextRequest, NextResponse } from 'next/server';
import { generatePayrollSummaryReport } from '@/services/reportService';
import { handleApiError } from '@/lib/apiError';
import { verifyAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          error: 'Unauthorized access',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    // Only HR admins and managers can generate reports
    if (!['admin', 'hr_manager', 'manager'].includes(authResult.user.user_role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: 'You do not have permission to generate reports',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const payrollMonth = searchParams.get('payroll_month');

    if (!payrollMonth) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameter',
          error: 'payroll_month is required (format: YYYY-MM)',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const reportData = await generatePayrollSummaryReport(payrollMonth);

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

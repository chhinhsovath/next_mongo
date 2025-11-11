import { NextRequest, NextResponse } from 'next/server';
import { generateLeaveUtilizationReport } from '@/services/reportService';
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
    const startDate = searchParams.get('start_date')
      ? new Date(searchParams.get('start_date')!)
      : undefined;
    const endDate = searchParams.get('end_date')
      ? new Date(searchParams.get('end_date')!)
      : undefined;

    const reportData = await generateLeaveUtilizationReport(startDate, endDate);

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

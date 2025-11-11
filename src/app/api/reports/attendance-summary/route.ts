import { NextRequest, NextResponse } from 'next/server';
import { generateAttendanceSummaryReport } from '@/services/reportService';
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
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameters',
          error: 'start_date and end_date are required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const reportData = await generateAttendanceSummaryReport(
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

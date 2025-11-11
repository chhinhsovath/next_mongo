import { NextRequest, NextResponse } from 'next/server';
import { generateAttendanceReport } from '@/services/attendanceService';
import { handleApiError, apiErrors } from '@/lib/apiError';
import { requireAuth } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { error, session } = await requireAuth();
    if (error) {
      return error;
    }

    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const employeeId = searchParams.get('employee_id') || undefined;

    if (!startDate || !endDate) {
      throw apiErrors.validation('Start date and end date are required');
    }

    const report = await generateAttendanceReport(startDate, endDate, employeeId);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error('Generate report error:', error);
    return handleApiError(error);
  }
}

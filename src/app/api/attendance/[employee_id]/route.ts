import { NextRequest, NextResponse } from 'next/server';
import { getAttendanceRecords } from '@/services/attendanceService';
import { handleApiError } from '@/lib/apiError';
import { requireAuth } from '@/lib/apiAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employee_id: string }> }
) {
  try {
    // Verify authentication
    const { error, session } = await requireAuth();
    if (error) {
      return error;
    }

    const { employee_id } = await params;
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const attendanceStatus = searchParams.get('attendance_status') || undefined;

    const records = await getAttendanceRecords({
      employee_id,
      start_date: startDate,
      end_date: endDate,
      attendance_status: attendanceStatus,
    });

    return NextResponse.json({
      success: true,
      data: records,
      total: records.length,
    });
  } catch (error: any) {
    console.error('Get attendance error:', error);
    return handleApiError(error);
  }
}

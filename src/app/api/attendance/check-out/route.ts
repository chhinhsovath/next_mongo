import { NextRequest, NextResponse } from 'next/server';
import { checkOut, getWorkDate } from '@/services/attendanceService';
import { handleApiError, apiErrors } from '@/lib/apiError';
import { requireAuth } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { error, session } = await requireAuth();
    if (error) {
      return error;
    }

    const body = await request.json();
    const { employee_id, check_out_location_lat, check_out_location_lng } = body;

    if (!employee_id) {
      throw apiErrors.validation('Employee ID is required');
    }

    // Use current time as check-out time
    const checkOutTime = new Date();
    const workDate = getWorkDate(checkOutTime);

    const attendance = await checkOut({
      employee_id,
      work_date: workDate,
      check_out_time: checkOutTime,
      check_out_location_lat,
      check_out_location_lng,
    });

    return NextResponse.json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    console.error('Check-out error:', error);
    return handleApiError(error);
  }
}

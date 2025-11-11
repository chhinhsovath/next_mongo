import { NextRequest, NextResponse } from 'next/server';
import { checkIn } from '@/services/attendanceService';
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
    const { employee_id, check_in_location_lat, check_in_location_lng } = body;

    if (!employee_id) {
      throw apiErrors.validation('Employee ID is required');
    }

    // Use current time as check-in time
    const checkInTime = new Date();

    const attendance = await checkIn({
      employee_id,
      check_in_time: checkInTime,
      check_in_location_lat,
      check_in_location_lng,
    });

    return NextResponse.json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return handleApiError(error);
  }
}

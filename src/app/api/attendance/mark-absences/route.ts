import { NextRequest, NextResponse } from 'next/server';
import { markAbsences } from '@/services/attendanceService';
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
    const { work_date } = body;

    if (!work_date) {
      throw apiErrors.validation('Work date is required');
    }

    const markedCount = await markAbsences(work_date);

    return NextResponse.json({
      success: true,
      data: {
        work_date,
        marked_count: markedCount,
      },
    });
  } catch (error: any) {
    console.error('Mark absences error:', error);
    return handleApiError(error);
  }
}

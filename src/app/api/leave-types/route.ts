import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { handleApiError } from '@/lib/apiError';
import { verifyAuth } from '@/lib/apiAuth';
import LeaveType from '@/models/LeaveType';

/**
 * GET /api/leave-types - Get all active leave types
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
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

    const leaveTypes = await LeaveType.find({ leave_type_status: 'active' }).sort({
      leave_type_name: 1,
    });

    return NextResponse.json({
      success: true,
      data: {
        leave_types: leaveTypes,
        total: leaveTypes.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { handleApiError } from '@/lib/apiError';
import { verifyAuth } from '@/lib/apiAuth';
import { rejectLeaveRequest } from '@/services/leaveService';
import { rejectLeaveSchema } from '@/lib/validation/leaveSchemas';

/**
 * PUT /api/leave/[id]/reject - Reject a leave request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Check if user has manager or admin role
    if (!['manager', 'hr_manager', 'admin'].includes(authResult.user.user_role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Only managers and administrators can reject leave requests',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate request body
    const validatedData = rejectLeaveSchema.parse(body);

    const leaveRequest = await rejectLeaveRequest(id, validatedData);

    return NextResponse.json({
      success: true,
      data: { leave_request: leaveRequest },
      message: 'Leave request rejected successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { handleApiError } from '@/lib/apiError';
import { verifyAuth } from '@/lib/apiAuth';
import { getLeaveRequestById, cancelLeaveRequest } from '@/services/leaveService';

/**
 * GET /api/leave/[id] - Get a specific leave request
 */
export async function GET(
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

    await connectDB();

    const leaveRequest = await getLeaveRequestById(id);

    if (!leaveRequest) {
      return NextResponse.json(
        {
          success: false,
          message: 'Leave request not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Check authorization - employees can only view their own requests
    if (
      authResult.user.user_role === 'employee' &&
      leaveRequest.employee_id !== authResult.user.employee_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to view this leave request',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { leave_request: leaveRequest },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/leave/[id] - Cancel a leave request
 */
export async function DELETE(
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

    await connectDB();

    const leaveRequest = await cancelLeaveRequest(id, authResult.user.employee_id);

    return NextResponse.json({
      success: true,
      data: { leave_request: leaveRequest },
      message: 'Leave request cancelled successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { handleApiError } from '@/lib/apiError';
import { verifyAuth } from '@/lib/apiAuth';
import { createLeaveRequest, getLeaveRequests } from '@/services/leaveService';
import { createLeaveRequestSchema, leaveRequestQuerySchema } from '@/lib/validation/leaveSchemas';

/**
 * GET /api/leave - Get leave requests with filters
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      employee_id: searchParams.get('employee_id') || undefined,
      leave_status: searchParams.get('leave_status') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    };

    // Validate query parameters
    const validatedQuery = leaveRequestQuerySchema.parse(queryParams);

    // If user is employee role, only show their own requests
    let filters = validatedQuery;
    if (authResult.user.user_role === 'employee' && !validatedQuery.employee_id) {
      filters = { ...validatedQuery, employee_id: authResult.user.employee_id };
    }

    const leaveRequests = await getLeaveRequests(filters);

    return NextResponse.json({
      success: true,
      data: {
        leave_requests: leaveRequests,
        total: leaveRequests.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/leave - Create a new leave request
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate request body
    const validatedData = createLeaveRequestSchema.parse(body);

    // If user is employee role, ensure they can only create requests for themselves
    if (authResult.user.user_role === 'employee' && validatedData.employee_id !== authResult.user.employee_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'You can only create leave requests for yourself',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    const leaveRequest = await createLeaveRequest(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: { leave_request: leaveRequest },
        message: 'Leave request created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

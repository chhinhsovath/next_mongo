import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/apiAuth';
import { apiErrors, handleApiError } from '@/lib/apiError';
import { approvePayroll } from '@/services/payrollService';

/**
 * PUT /api/payroll/[id]/approve - Approve payroll
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated, user } = await verifyAuth(request);
    if (!authenticated || !user) {
      throw apiErrors.unauthorized();
    }

    // Only HR admin and managers can approve payroll
    if (!['admin', 'hr_manager', 'manager'].includes(user.user_role)) {
      throw apiErrors.forbidden();
    }

    await connectDB();

    const { id } = await params;
    const payroll = await approvePayroll(id);

    return NextResponse.json({
      success: true,
      data: payroll,
      message: 'Payroll approved successfully',
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

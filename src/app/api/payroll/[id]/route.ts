import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/apiAuth';
import { apiErrors, handleApiError } from '@/lib/apiError';
import { getPayrollById, updatePayroll, deletePayroll } from '@/services/payrollService';

/**
 * GET /api/payroll/[id] - Get payroll by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated, user } = await verifyAuth(request);
    if (!authenticated || !user) {
      throw apiErrors.unauthorized();
    }

    await connectDB();

    const { id } = await params;
    const payroll: any = await getPayrollById(id);

    // Regular employee can only view their own payroll
    const payrollEmployeeId = typeof payroll.employee_id === 'object' && payroll.employee_id !== null
      ? payroll.employee_id._id?.toString()
      : payroll.employee_id?.toString();
    
    if (user.user_role === 'employee' && user.employee_id !== payrollEmployeeId) {
      throw apiErrors.forbidden();
    }

    return NextResponse.json({
      success: true,
      data: payroll,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/payroll/[id] - Update payroll
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

    // Only HR admin and managers can update payroll
    if (!['admin', 'hr_manager', 'manager'].includes(user.user_role)) {
      throw apiErrors.forbidden();
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const payroll = await updatePayroll(id, body);

    return NextResponse.json({
      success: true,
      data: payroll,
      message: 'Payroll updated successfully',
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/payroll/[id] - Delete payroll (only draft)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated, user } = await verifyAuth(request);
    if (!authenticated || !user) {
      throw apiErrors.unauthorized();
    }

    // Only HR admin can delete payroll
    if (user.user_role !== 'admin') {
      throw apiErrors.forbidden();
    }

    await connectDB();

    const { id } = await params;
    await deletePayroll(id);

    return NextResponse.json({
      success: true,
      message: 'Payroll deleted successfully',
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

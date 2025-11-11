import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/apiAuth';
import { apiErrors, handleApiError } from '@/lib/apiError';
import { getPayrolls } from '@/services/payrollService';

/**
 * GET /api/payroll/employee/[employee_id] - Get payroll records for a specific employee
 * Query params: payroll_month, payroll_status, page, limit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employee_id: string }> }
) {
  try {
    const { authenticated, user } = await verifyAuth(request);
    if (!authenticated || !user) {
      throw apiErrors.unauthorized();
    }

    await connectDB();
    
    const { employee_id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const payroll_month = searchParams.get('payroll_month') || undefined;
    const payroll_status = searchParams.get('payroll_status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await getPayrolls({
      employee_id,
      payroll_month,
      payroll_status,
      page,
      limit
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
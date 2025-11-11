import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/apiAuth';
import { apiErrors, handleApiError } from '@/lib/apiError';
import {
  createPayroll,
  getPayrolls,
  generatePayroll,
  getPayrollSummary,
} from '@/services/payrollService';

/**
 * GET /api/payroll - Get payroll records with filters
 * Query params: employee_id, payroll_month, payroll_status, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request);
    if (!authenticated || !user) {
      throw apiErrors.unauthorized();
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const employee_id = searchParams.get('employee_id') || undefined;
    const payroll_month = searchParams.get('payroll_month') || undefined;
    const payroll_status = searchParams.get('payroll_status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const summary = searchParams.get('summary') === 'true';

    // If summary is requested
    if (summary && payroll_month) {
      const summaryData = await getPayrollSummary(payroll_month);
      return NextResponse.json({
        success: true,
        data: summaryData,
      });
    }

    // Regular employee can only view their own payroll
    let finalEmployeeId = employee_id;
    if (user.user_role === 'employee' && user.employee_id) {
      finalEmployeeId = user.employee_id.toString();
    }

    const result = await getPayrolls({
      employee_id: finalEmployeeId,
      payroll_month,
      payroll_status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.payrolls,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * POST /api/payroll - Create payroll or generate for multiple employees
 * Body: CreatePayrollRequest or GeneratePayrollRequest
 */
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request);
    if (!authenticated || !user) {
      throw apiErrors.unauthorized();
    }

    // Only HR admin and managers can create payroll
    if (!['admin', 'hr_manager', 'manager'].includes(user.user_role)) {
      throw apiErrors.forbidden();
    }

    await connectDB();

    const body = await request.json();

    // Check if this is a generate request (has payroll_month but no employee_id)
    if (body.payroll_month && !body.employee_id) {
      // Generate payroll for multiple employees
      const result = await generatePayroll(body.payroll_month, body.employee_ids);
      return NextResponse.json({
        success: true,
        data: result,
        message: `Generated ${result.created.length} payroll records`,
      });
    }

    // Create single payroll
    const payroll = await createPayroll(body);

    return NextResponse.json({
      success: true,
      data: payroll,
      message: 'Payroll created successfully',
    }, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}

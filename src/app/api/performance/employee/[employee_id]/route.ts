import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPerformanceEvaluationsByEmployee } from '@/services/performanceService';
import { createErrorResponse } from '@/lib/apiError';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employee_id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        createErrorResponse('Authentication required', 'AUTH_REQUIRED'),
        { status: 401 }
      );
    }

    const { employee_id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    const result = await getPerformanceEvaluationsByEmployee(employee_id, {
      limit,
      skip,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching employee performance evaluations:', error);
    return NextResponse.json(
      createErrorResponse(
        'Failed to fetch employee performance evaluations',
        'SERVER_ERROR',
        error.message
      ),
      { status: 500 }
    );
  }
}

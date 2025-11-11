import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPerformanceTrend } from '@/services/performanceService';
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
    const limit = parseInt(searchParams.get('limit') || '5');

    const trend = await getPerformanceTrend(employee_id, limit);

    return NextResponse.json({
      success: true,
      data: trend,
    });
  } catch (error: any) {
    console.error('Error fetching performance trend:', error);
    return NextResponse.json(
      createErrorResponse(
        'Failed to fetch performance trend',
        'SERVER_ERROR',
        error.message
      ),
      { status: 500 }
    );
  }
}

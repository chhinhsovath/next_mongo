/**
 * Change Password API (for authenticated users)
 * POST /api/auth/change-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { 
  validatePasswordStrength, 
  hashPassword, 
  verifyPassword,
  isCommonPassword 
} from '@/lib/security/password';
import { applyRateLimit, rateLimitConfigs } from '@/lib/security/rateLimit';
import { logAuthEvent, AuditEventType } from '@/lib/security/audit';

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.user_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          error: 'Not authenticated',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }
    
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, rateLimitConfigs.auth);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    const body = await request.json();
    const { current_password, new_password } = changePasswordSchema.parse(body);
    
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(new_password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password does not meet security requirements',
          error: passwordValidation.errors.join(', '),
          code: 'WEAK_PASSWORD',
          details: {
            errors: passwordValidation.errors,
            strength: passwordValidation.strength,
          },
        },
        { status: 400 }
      );
    }
    
    // Check for common passwords
    if (isCommonPassword(new_password)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password is too common',
          error: 'Please choose a more unique password',
          code: 'COMMON_PASSWORD',
        },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find user
    const user = await User.findOne({ user_id: session.user.user_id });
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
          error: 'Invalid user',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }
    
    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(current_password, user.password_hash);
    
    if (!isCurrentPasswordValid) {
      logAuthEvent(
        AuditEventType.PASSWORD_CHANGE,
        request,
        user.user_id,
        user.username,
        'failure',
        { reason: 'Invalid current password' }
      );
      
      return NextResponse.json(
        {
          success: false,
          message: 'Current password is incorrect',
          error: 'Authentication failed',
          code: 'INVALID_PASSWORD',
        },
        { status: 400 }
      );
    }
    
    // Check if new password is same as current
    const isSamePassword = await verifyPassword(new_password, user.password_hash);
    if (isSamePassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'New password must be different from current password',
          error: 'Password unchanged',
          code: 'SAME_PASSWORD',
        },
        { status: 400 }
      );
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(new_password);
    
    // Update user password
    user.password_hash = hashedPassword;
    user.updated_at = new Date();
    await user.save();
    
    // Log audit event
    logAuthEvent(
      AuditEventType.PASSWORD_CHANGE,
      request,
      user.user_id,
      user.username,
      'success'
    );
    
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          error: error.issues[0].message,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }
    
    console.error('Change password error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to change password',
        error: 'Internal server error',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

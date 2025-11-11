/**
 * Password Reset Completion API
 * POST /api/auth/password-reset/complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import User from '@/models/User';
import { PasswordReset } from '@/models/PasswordReset';
import { connectDB } from '@/lib/mongodb';
import { 
  validatePasswordStrength, 
  hashPassword, 
  verifyResetToken,
  isCommonPassword 
} from '@/lib/security/password';
import { applyRateLimit, rateLimitConfigs } from '@/lib/security/rateLimit';
import { logAuthEvent, AuditEventType } from '@/lib/security/audit';

const completeSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, rateLimitConfigs.auth);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    const body = await request.json();
    const { token, new_password } = completeSchema.parse(body);
    
    // Validate password strength
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
    
    // Find valid reset token
    const resetRequests = await PasswordReset.find({
      used: false,
      expires_at: { $gt: new Date() },
    });
    
    let validResetRequest = null;
    
    for (const resetRequest of resetRequests) {
      const isValid = await verifyResetToken(token, resetRequest.reset_token_hash);
      
      if (isValid) {
        validResetRequest = resetRequest;
        break;
      }
    }
    
    if (!validResetRequest) {
      logAuthEvent(
        AuditEventType.PASSWORD_RESET_COMPLETE,
        request,
        undefined,
        undefined,
        'failure',
        { reason: 'Invalid or expired token' }
      );
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired reset token',
          error: 'Token verification failed',
          code: 'INVALID_TOKEN',
        },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await User.findOne({ user_id: validResetRequest.user_id });
    
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
    
    // Hash new password
    const hashedPassword = await hashPassword(new_password);
    
    // Update user password
    user.password_hash = hashedPassword;
    user.updated_at = new Date();
    await user.save();
    
    // Mark reset token as used
    validResetRequest.used = true;
    await validResetRequest.save();
    
    // Log audit event
    logAuthEvent(
      AuditEventType.PASSWORD_RESET_COMPLETE,
      request,
      user.user_id,
      user.username,
      'success'
    );
    
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
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
    
    console.error('Password reset completion error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reset password',
        error: 'Internal server error',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

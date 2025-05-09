import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { UserService } from '@/services/UserService';
import { z } from 'zod';

// Schema for password change validation
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * POST /api/user/password
 * Change the current authenticated user's password
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const validation = passwordChangeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    // Call service to change password
    const result = await UserService.changePassword(
      session.user.id,
      validation.data.currentPassword,
      validation.data.newPassword
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (error instanceof Error && error.message.includes('incorrect')) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
} 
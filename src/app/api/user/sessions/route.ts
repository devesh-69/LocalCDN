import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { UserService } from '@/services/UserService';

/**
 * DELETE /api/user/sessions
 * Logout the user from all other sessions by invalidating all session tokens
 * by incrementing the sessionVersion on the user document.
 */
export async function DELETE(request: NextRequest) {
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
    
    // Call service to invalidate all other sessions
    await UserService.invalidateAllSessions(session.user.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully logged out from all other devices'
    });
  } catch (error) {
    console.error('Error logging out from other sessions:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to logout from other sessions' },
      { status: 500 }
    );
  }
} 
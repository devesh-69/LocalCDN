import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { UserService } from '@/services/UserService';
import { z } from 'zod';

// Schema for profile update validation
const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
  website: z.string().url('Website must be a valid URL').max(200, 'Website URL cannot exceed 200 characters').optional(),
});

/**
 * GET /api/user/profile
 * Get the current authenticated user's profile
 */
export async function GET(request: NextRequest) {
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
    
    // Get stats query parameter
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    
    // Call service to get user profile
    const profile = await UserService.getUserProfile(session.user.id, includeStats);
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update the current authenticated user's profile
 */
export async function PATCH(request: NextRequest) {
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
    const validation = profileUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    // Call service to update user profile
    const updatedProfile = await UserService.updateUserProfile(
      session.user.id,
      validation.data
    );
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 
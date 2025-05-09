import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { UserService } from '@/services/UserService';
import { z } from 'zod';

// Schema for preferences update validation
const preferencesUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  defaultPrivacy: z.enum(['public', 'private']).optional(),
  galleryView: z.enum(['grid', 'masonry']).optional(),
  itemsPerPage: z.number().min(6).max(100).optional(),
  autoMetadataStrip: z.boolean().optional(),
});

/**
 * GET /api/user/preferences
 * Get the current authenticated user's preferences
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
    
    // Call service to get user profile (which includes preferences)
    const profile = await UserService.getUserProfile(session.user.id, false);
    
    // Return just the preferences part
    return NextResponse.json(profile.preferences || {
      theme: 'system',
      defaultPrivacy: 'private',
      galleryView: 'grid',
      itemsPerPage: 12,
      autoMetadataStrip: false,
    });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/preferences
 * Update the current authenticated user's preferences
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
    const validation = preferencesUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    // Call service to update user preferences
    const updatedPreferences = await UserService.updateUserPreferences(
      session.user.id,
      validation.data
    );
    
    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
} 
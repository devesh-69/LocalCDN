import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StorageService } from '@/services/StorageService';
import { UserService } from '@/services/UserService';
import User from '@/models/User';
import { v4 as uuidv4 } from 'uuid';

// Max avatar file size (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed mime types for avatars
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * POST /api/user/avatar
 * Upload or update user avatar
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
    
    // Parse multipart form data
    const formData = await request.formData();
    
    // Get avatar file from form data
    const avatarFile = formData.get('avatar') as File | null;
    if (!avatarFile) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (avatarFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Avatar file size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(avatarFile.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Supported types: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Generate a unique file name for the avatar
    const fileExtension = avatarFile.name.split('.').pop() || 'jpg';
    const fileName = `avatar-${session.user.id}-${uuidv4().slice(0, 8)}.${fileExtension}`;
    
    // Upload avatar to storage service
    const uploadResult = await StorageService.uploadAvatar(
      avatarFile,
      fileName,
      session.user.id
    );
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload avatar' },
        { status: 500 }
      );
    }
    
    // Update user profile with new avatar URL
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // If user had a previous avatar, attempt to delete it
    if (user.image) {
      try {
        await StorageService.deleteFile(user.image);
      } catch (error) {
        // Log but don't fail the request if old avatar deletion fails
        console.warn('Failed to delete old avatar:', error);
      }
    }
    
    // Update user with new avatar URL
    user.image = uploadResult.url;
    await user.save();
    
    // Clear the user profile cache
    const memoryCache = (await import('@/lib/cache')).memoryCache;
    memoryCache.delete(`user:${session.user.id}:profile:true`);
    memoryCache.delete(`user:${session.user.id}:profile:false`);
    
    return NextResponse.json({
      success: true,
      avatarUrl: uploadResult.url,
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
} 
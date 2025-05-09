import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { MetadataService } from '@/services/MetadataService';

/**
 * POST /api/images/[id]/metadata/strip
 * Strip all metadata from an image
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Get the image ID from params
    const { id } = params;
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Call metadata service to strip metadata
    const result = await MetadataService.stripImageMetadata(id, {
      userId: session.user.id,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Metadata stripped successfully',
      result,
    });
  } catch (error) {
    console.error('Error stripping metadata:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    if (error instanceof Error && error.message.includes('not authorized')) {
      return NextResponse.json(
        { error: 'Not authorized to modify this image' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to strip metadata' },
      { status: 500 }
    );
  }
} 
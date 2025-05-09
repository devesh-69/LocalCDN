import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { StorageService } from '@/services/StorageService';
import { MetadataService } from '@/services/MetadataService';
import { ImageProcessor } from '@/services/ImageProcessor';

/**
 * GET /api/images/[id]/metadata
 * Retrieve metadata for an image
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Get the image ID from params
    const { id } = params;
    
    // Extract version ID from query params if present
    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get('versionId');
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Call metadata service to get image metadata
    const metadata = await MetadataService.getImageMetadata(id, {
      userId: session?.user.id,
      versionId: versionId || undefined,
    });
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching image metadata:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    if (error instanceof Error && error.message.includes('not authorized')) {
      return NextResponse.json(
        { error: 'Not authorized to view this image metadata' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch image metadata' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/images/[id]/metadata
 * Update metadata for an image
 */
export async function PUT(
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
    
    // Get request body
    const body = await request.json();
    const { metadata, restoreFromVersionId } = body;
    
    // Update image metadata
    const result = await MetadataService.updateImageMetadata(id, {
      userId: session.user.id,
      metadata,
      restoreFromVersionId,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Metadata updated successfully',
      result,
    });
  } catch (error) {
    console.error('Error updating image metadata:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    if (error instanceof Error && error.message.includes('not authorized')) {
      return NextResponse.json(
        { error: 'Not authorized to update this image metadata' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update image metadata' },
      { status: 500 }
    );
  }
} 
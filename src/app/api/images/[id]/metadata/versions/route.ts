import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { MetadataService } from '@/services/MetadataService';

/**
 * GET /api/images/[id]/metadata/versions
 * Retrieve version history for image metadata
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Get the image ID from params
    const { id } = params;
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // Call metadata service to get version history
    const versions = await MetadataService.getMetadataVersions(id, {
      userId: session?.user.id,
    });
    
    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching metadata versions:', error);
    
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
      { error: 'Failed to fetch metadata versions' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { MetadataService } from '@/services/MetadataService';

/**
 * GET /api/images/[id]/metadata/export
 * Export metadata for an image as a JSON file
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
      includeBasicInfo: true,
    });
    
    // Create a JSON string from the metadata
    const jsonData = JSON.stringify(metadata, null, 2);
    
    // Create a response with the JSON data as a downloadable file
    const response = new NextResponse(jsonData);
    
    // Set the appropriate headers for file download
    response.headers.set('Content-Disposition', `attachment; filename="metadata_${id}.json"`);
    response.headers.set('Content-Type', 'application/json');
    
    return response;
  } catch (error) {
    console.error('Error exporting metadata:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    if (error instanceof Error && error.message.includes('not authorized')) {
      return NextResponse.json(
        { error: 'Not authorized to access this image metadata' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to export metadata' },
      { status: 500 }
    );
  }
} 
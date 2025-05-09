import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ImageProcessor } from '@/services/ImageProcessor';

/**
 * POST /api/metadata/extract
 * Extract metadata from an uploaded image
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the form data
    const formData = await request.formData();
    
    // Get the file from the form data
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File is not an image' },
        { status: 400 }
      );
    }
    
    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Extract metadata from the image
    const extractedMetadata = await ImageProcessor.extractMetadata(buffer);
    
    // Normalize the metadata
    const normalizedMetadata = ImageProcessor.normalizeMetadata(extractedMetadata);
    
    return NextResponse.json({
      success: true,
      metadata: normalizedMetadata,
    });
  } catch (error) {
    console.error('Error extracting metadata:', error);
    
    return NextResponse.json(
      { error: 'Failed to extract metadata' },
      { status: 500 }
    );
  }
}

// Increase the maximum request body size for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 
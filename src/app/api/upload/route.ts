import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StorageService } from '@/services/StorageService';
import { ImageProcessor } from '@/services/ImageProcessor';
import { withUploadValidation, getMaxFileSize, getAllowedFileTypes } from './middleware';

// Use environment variables or defaults
const MAX_FILE_SIZE = getMaxFileSize();
const ALLOWED_FILE_TYPES = getAllowedFileTypes();

// Handler function for the upload endpoint
async function uploadHandler(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    
    // Get file from form data
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Supported types: ${ALLOWED_FILE_TYPES.join(', ')}` 
      }, { status: 400 });
    }
    
    // Get metadata from form data
    const title = formData.get('title') as string || file.name;
    const description = formData.get('description') as string || '';
    const isPublic = formData.get('isPublic') === 'true';
    
    // Parse tags
    let tags: string[] = [];
    const tagsValue = formData.get('tags');
    if (tagsValue && typeof tagsValue === 'string') {
      try {
        tags = JSON.parse(tagsValue);
      } catch (error) {
        console.warn('Invalid tags format:', error);
      }
    }
    
    // Get processing options
    const stripMetadata = formData.get('stripMetadata') === 'true';
    const optimizeImage = formData.get('optimizeImage') === 'true';
    
    // Convert file to Buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process the image with Sharp
    let processedImage;
    try {
      processedImage = await ImageProcessor.processImage(buffer, {
        stripMetadata,
        // Apply some optimization if requested
        ...(optimizeImage ? {
          format: 'webp',
          quality: 85,
        } : {}),
      });
      
      // Extract metadata
      const extractedMetadata = await ImageProcessor.extractMetadata(buffer);
      console.log('Image metadata:', {
        dimensions: `${extractedMetadata.width}x${extractedMetadata.height}`,
        format: extractedMetadata.format,
        hasExif: !!extractedMetadata.exif,
      });
    } catch (error) {
      console.error('Image processing error:', error);
      // Continue with upload even if processing fails
      processedImage = { buffer, metadata: { width: 0, height: 0, format: 'unknown' } };
    }
    
    // Prepare additional metadata from extracted image info
    const extraMetadata: Record<string, any> = {};
    
    if (processedImage.metadata.width && processedImage.metadata.height) {
      extraMetadata.dimensions = {
        width: processedImage.metadata.width,
        height: processedImage.metadata.height,
      };
    }
    
    // Upload image via StorageService
    const image = await StorageService.uploadImage(
      processedImage.buffer,
      {
        title,
        description,
        ownerId: userId,
        tags,
        isPublic,
        metadata: {
          captureDate: new Date(), // In real app, this would come from EXIF
          ...extraMetadata,
        },
      }
    );
    
    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        id: image._id.toString(),
        url: image.url,
        publicId: image.publicId,
        title: image.title,
        size: image.size,
        width: image.width,
        height: image.height,
        format: image.format,
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    }, { status: 500 });
  }
}

// Export the POST handler with middleware validation
export const POST = (request: NextRequest) => withUploadValidation(request, uploadHandler);

// Increase payload size limit for image uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
}; 
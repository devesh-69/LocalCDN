import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Middleware to validate requests to the upload API
 */
export async function withUploadValidation(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  // Check if the request method is allowed
  if (request.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  // Verify authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Validate content type for multipart uploads
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Content type must be multipart/form-data' },
      { status: 400 }
    );
  }

  // Pass to the handler if all validations pass
  return handler(request);
}

/**
 * Helper function to parse allowed file types from environment variables
 */
export function getAllowedFileTypes(): string[] {
  const defaultTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  const envTypes = process.env.ALLOWED_FILE_TYPES;
  if (!envTypes) return defaultTypes;
  
  return envTypes.split(',').map(type => type.trim());
}

/**
 * Helper function to get maximum file size from environment variables
 */
export function getMaxFileSize(): number {
  const defaultSize = 5 * 1024 * 1024; // 5MB
  
  const envSize = process.env.MAX_FILE_SIZE_MB;
  if (!envSize) return defaultSize;
  
  const size = parseInt(envSize, 10);
  if (isNaN(size)) return defaultSize;
  
  return size * 1024 * 1024;
} 
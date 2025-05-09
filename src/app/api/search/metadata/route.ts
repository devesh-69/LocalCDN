import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { MetadataService } from '@/services/MetadataService';

/**
 * GET /api/search/metadata
 * Search images by metadata criteria
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('q') || undefined;
    const limit = Number(searchParams.get('limit')) || 20;
    const page = Number(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    
    // Get date range parameters
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    
    // Extract field search parameters
    // Format is field.subfield=value (e.g., camera=Canon, exif.iso=100)
    const fields: Record<string, any> = {};
    
    for (const [key, value] of searchParams.entries()) {
      if (
        key !== 'q' &&
        key !== 'limit' &&
        key !== 'page' &&
        key !== 'includePrivate' &&
        key !== 'sort' &&
        key !== 'dateFrom' &&
        key !== 'dateTo'
      ) {
        // Handle tag filtering specially
        if (key === 'tags') {
          if (!fields.tags) {
            fields.tags = [];
          }
          fields.tags.push(value);
          continue;
        }
        
        // Build nested object structure from dot notation
        const parts = key.split('.');
        let current = fields;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = value;
      }
    }
    
    // Parse sort parameter (field:direction, e.g., createdAt:desc)
    const sortParam = searchParams.get('sort');
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    
    if (sortParam) {
      const [field, direction] = sortParam.split(':');
      sort = { [field]: direction === 'asc' ? 1 : -1 };
    }
    
    // Get session for user ID
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    
    // Determine if we should include private images
    const includePrivate = searchParams.get('includePrivate') === 'true' && userId;
    
    // Create date range filter if specified
    const dateFilter: Record<string, any> = {};
    
    if (dateFrom || dateTo) {
      dateFilter.captureDate = {};
      
      if (dateFrom) {
        dateFilter.captureDate.$gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        // Add one day to include the end date fully
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.captureDate.$lt = endDate;
      }
    }
    
    // Search for images
    const images = await MetadataService.searchByMetadata(
      {
        text,
        fields: Object.keys(fields).length > 0 ? fields : undefined,
        userId: includePrivate ? userId : undefined,
        isPublic: !includePrivate,
        dateFilter: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      {
        limit,
        skip,
        sort,
      }
    );
    
    // Get total count for pagination
    const totalCount = await MetadataService.countSearchResults({
      text,
      fields: Object.keys(fields).length > 0 ? fields : undefined,
      userId: includePrivate ? userId : undefined,
      isPublic: !includePrivate,
      dateFilter: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
    });
    
    // Format response
    const formattedImages = images.map(image => ({
      id: image._id.toString(),
      title: image.title,
      description: image.description,
      url: image.url,
      width: image.width,
      height: image.height,
      format: image.format,
      size: image.size,
      tags: image.tags,
      isPublic: image.isPublic,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
      metadata: {
        // Include a subset of metadata for search results
        // Full metadata can be fetched separately for a specific image
        ...image.metadata?.exif ? { 
          camera: image.metadata.exif.camera,
          captureDate: image.metadata.exif.captureDate,
          location: image.metadata.exif.location,
        } : {},
      },
    }));
    
    return NextResponse.json({
      results: formattedImages,
      total: totalCount,
      page,
      limit,
      filters: {
        query: text,
        dateRange: dateFilter.captureDate ? {
          from: dateFrom,
          to: dateTo
        } : undefined,
        fields: fields
      }
    });
  } catch (error) {
    console.error('Error searching images by metadata:', error);
    
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
} 
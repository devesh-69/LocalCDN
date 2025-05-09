import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Image from '@/models/Image';

/**
 * GET /api/filters/options
 * Retrieves available options for metadata filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get field parameter
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field');
    const limit = Number(searchParams.get('limit')) || 30;
    
    // Get user session for permission checks
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    
    // Create base query (public or user's private images)
    const baseQuery: any = {};
    
    if (userId) {
      baseQuery.$or = [
        { owner: userId },
        { isPublic: true },
      ];
    } else {
      baseQuery.isPublic = true;
    }
    
    // Check which field options to fetch
    if (!field) {
      // If no field is specified, return options for common filters
      const [cameras, locations, formats] = await Promise.all([
        fetchDistinctValues('metadata.camera', baseQuery, limit),
        fetchDistinctValues('metadata.location', baseQuery, limit),
        fetchDistinctValues('format', baseQuery, limit),
      ]);
      
      // Get dimensions distribution
      const dimensions = await fetchDimensionsDistribution(baseQuery);
      
      return NextResponse.json({
        success: true,
        options: {
          cameras: cameras.map(camera => ({ 
            value: camera, 
            label: camera 
          })),
          locations: locations.map(location => ({ 
            value: location, 
            label: location 
          })),
          formats: formats.map(format => ({ 
            value: format, 
            label: format.toUpperCase() 
          })),
          dimensions
        }
      });
    } else {
      // Fetch options for a specific field
      let values: any[] = [];
      
      switch (field) {
        case 'camera':
          values = await fetchDistinctValues('metadata.camera', baseQuery, limit);
          break;
        case 'location':
          values = await fetchDistinctValues('metadata.location', baseQuery, limit);
          break;
        case 'format':
          values = await fetchDistinctValues('format', baseQuery, limit);
          break;
        case 'lens':
          values = await fetchDistinctValues('metadata.lens', baseQuery, limit);
          break;
        case 'make':
          values = await fetchDistinctValues('metadata.make', baseQuery, limit);
          break;
        default:
          // For custom metadata fields
          if (field.startsWith('metadata.')) {
            values = await fetchDistinctValues(field, baseQuery, limit);
          } else {
            return NextResponse.json(
              { error: 'Invalid field parameter' },
              { status: 400 }
            );
          }
      }
      
      // Format options with value and label
      const options = values.map(value => ({
        value,
        label: value
      }));
      
      return NextResponse.json({
        success: true,
        options
      });
    }
  } catch (error) {
    console.error('Error fetching filter options:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to fetch distinct values for a field
 */
async function fetchDistinctValues(field: string, baseQuery: any, limit: number) {
  const fieldExists: any = { ...baseQuery };
  fieldExists[field] = { $exists: true, $ne: null };
  
  // Use aggregation to get distinct values with counts, then sort by frequency
  const results = await Image.aggregate([
    { $match: fieldExists },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: limit }
  ]);
  
  // Map results to just the values
  return results.map(result => result._id).filter(Boolean);
}

/**
 * Helper function to get image dimension distributions
 */
async function fetchDimensionsDistribution(baseQuery: any) {
  // Create dimensions categories by aspect ratio
  const dimensions = [
    { value: 'landscape', label: 'Landscape', count: 0 },
    { value: 'portrait', label: 'Portrait', count: 0 },
    { value: 'square', label: 'Square', count: 0 },
    { value: 'panorama', label: 'Panorama', count: 0 },
  ];
  
  // Get counts for each orientation category
  const landscapeQuery = { ...baseQuery, width: { $gt: { $multiply: ['$height', 1.1] } } };
  const portraitQuery = { ...baseQuery, height: { $gt: { $multiply: ['$width', 1.1] } } };
  const squareQuery = { 
    ...baseQuery, 
    $expr: {
      $and: [
        { $gte: [{ $divide: ['$width', '$height'] }, 0.9] },
        { $lte: [{ $divide: ['$width', '$height'] }, 1.1] }
      ]
    }
  };
  const panoramaQuery = { ...baseQuery, width: { $gt: { $multiply: ['$height', 2] } } };
  
  const [landscapeCount, portraitCount, squareCount, panoramaCount] = await Promise.all([
    Image.countDocuments(landscapeQuery),
    Image.countDocuments(portraitQuery),
    Image.countDocuments(squareQuery),
    Image.countDocuments(panoramaQuery),
  ]);
  
  dimensions[0].count = landscapeCount;
  dimensions[1].count = portraitCount;
  dimensions[2].count = squareCount;
  dimensions[3].count = panoramaCount;
  
  // Return only dimensions that have images
  return dimensions.filter(dim => dim.count > 0);
} 
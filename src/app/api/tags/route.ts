import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Image from '@/models/Image';

/**
 * GET /api/tags
 * Retrieve all unique tags used across images
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get search parameters for optional filtering
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Number(searchParams.get('limit')) || 50;
    
    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;
    
    // Build the query
    const matchQuery: any = {};
    
    // If user is logged in, include their private images and all public images
    if (userId) {
      matchQuery.$or = [
        { owner: userId },
        { isPublic: true },
      ];
    } else {
      // Otherwise only show public images' tags
      matchQuery.isPublic = true;
    }
    
    // If there's a search query, filter tags
    const tagFilter = query ? { $match: { tags: { $regex: query, $options: 'i' } } } : null;
    
    // Use aggregation to get unique tags
    const pipeline: any[] = [
      { $match: matchQuery },
      { $unwind: '$tags' },
    ];
    
    // Add tag filter if present
    if (tagFilter) {
      pipeline.push(tagFilter);
    }
    
    // Complete the pipeline to count and sort tags
    pipeline.push(
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, tag: '$_id', count: 1 } }
    );
    
    const tagResults = await Image.aggregate(pipeline);
    
    // Extract just the tag names for the response
    const tags = tagResults.map(result => result.tag);
    
    return NextResponse.json({
      tags,
      total: tags.length,
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
} 
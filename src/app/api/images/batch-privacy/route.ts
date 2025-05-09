import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/database';
import ImageModel from '@/models/Image';
import mongoose from 'mongoose';

// Update privacy settings for multiple images
export async function PATCH(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { imageIds, isPublic } = await req.json();
    
    // Validate input
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: 'No image IDs provided' },
        { status: 400 }
      );
    }
    
    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid privacy setting' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Convert string IDs to ObjectIds for MongoDB
    const objectIds = imageIds.map((id: string) => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (error) {
        console.error(`Invalid ID format: ${id}`);
        return null;
      }
    }).filter(Boolean);
    
    if (objectIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid image IDs provided' },
        { status: 400 }
      );
    }
    
    // Update all images owned by this user with the provided IDs
    const result = await ImageModel.updateMany(
      { 
        _id: { $in: objectIds },
        userId: userId
      },
      { 
        $set: { isPublic }
      }
    );
    
    // If no images were modified, the user might not own all the images
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'No matching images found' },
        { status: 404 }
      );
    }
    
    // Respond with success
    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} images`,
      modifiedCount: result.modifiedCount,
    });
    
  } catch (error) {
    console.error('Error updating image privacy settings:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
} 
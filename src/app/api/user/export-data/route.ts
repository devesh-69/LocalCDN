import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { ImageService } from '@/services/ImageService';
import { UserService } from '@/services/UserService';
import JSZip from 'jszip';

/**
 * POST /api/user/export-data
 * Exports user data based on specified options
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const body = await request.json();
    const options = {
      includeMetadata: body.includeMetadata ?? true,
      includeOriginals: body.includeOriginals ?? true,
      format: body.format ?? 'zip'
    };
    
    // Get user data
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get user's images
    const images = await ImageService.getUserImages(userId);
    
    // Prepare the metadata
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio,
      location: user.location,
      website: user.website,
      preferences: user.preferences,
      createdAt: user.createdAt,
      images: images.map(img => ({
        id: img._id.toString(),
        title: img.title,
        description: img.description,
        url: img.url,
        publicId: img.publicId,
        thumbnail: img.thumbnail,
        mimeType: img.mimeType,
        width: img.width,
        height: img.height,
        size: img.size,
        originalFilename: img.originalFilename,
        tags: img.tags,
        isPrivate: img.isPrivate,
        createdAt: img.createdAt,
        updatedAt: img.updatedAt
      }))
    };
    
    // Handle different export formats
    if (options.format === 'json') {
      // Return JSON data
      const jsonData = JSON.stringify(userData, null, 2);
      
      return new NextResponse(jsonData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="localcdn-export-${new Date().toISOString().split('T')[0]}.json"`
        }
      });
    } else if (options.format === 'csv') {
      // Create CSV data
      // Header row
      let csvData = 'id,title,description,url,size,width,height,private,created_at\n';
      
      // Data rows
      userData.images.forEach(img => {
        // Escape fields that might contain commas
        const description = img.description ? `"${img.description.replace(/"/g, '""')}"` : '';
        
        csvData += [
          img.id,
          img.title ? `"${img.title.replace(/"/g, '""')}"` : '',
          description,
          img.url,
          img.size,
          img.width,
          img.height,
          img.isPrivate ? 'true' : 'false',
          new Date(img.createdAt).toISOString()
        ].join(',') + '\n';
      });
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="localcdn-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // Create ZIP archive
      const zip = new JSZip();
      
      // Add metadata JSON if requested
      if (options.includeMetadata) {
        zip.file('metadata.json', JSON.stringify(userData, null, 2));
      }
      
      // Add original images if requested
      if (options.includeOriginals) {
        const imagesFolder = zip.folder('images');
        
        // This would normally fetch the actual image files from storage
        // For demo purposes, we're simulating this by adding placeholders
        for (const img of images) {
          // In a real app, fetch the image data and add it to the zip
          // For now, add a placeholder telling the user how to download the actual images
          const imgName = img.originalFilename || `image-${img._id}.${img.mimeType?.split('/')[1] || 'jpg'}`;
          
          try {
            // In a real implementation, you would fetch the image content here
            // const imageResponse = await fetch(img.url);
            // const imageBuffer = await imageResponse.arrayBuffer();
            // imagesFolder.file(imgName, imageBuffer);
            
            // For demo, just add a placeholder text file
            const imagePlaceholder = `Image URL: ${img.url}\nDownload this image manually from the URL above.`;
            imagesFolder.file(`${imgName}.txt`, imagePlaceholder);
          } catch (err) {
            console.error(`Error adding image ${img._id} to zip:`, err);
            // Continue with other images
          }
        }
      }
      
      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
      
      return new NextResponse(zipBlob, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="localcdn-export-${new Date().toISOString().split('T')[0]}.zip"`
        }
      });
    }
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    );
  }
} 
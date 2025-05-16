
import { supabase } from '@/lib/supabase';
import { ImageStats } from '@/types/mongodb';

export interface ImageResponse {
  images: ImageItem[];
  stats: ImageStats;
}

export interface ImageItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  userId: string;
  isOwner: boolean;
}

// Maximum file size in bytes (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Validate file before uploading
export const validateFile = (file: File): {valid: boolean; error?: string} => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false, 
      error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.map(t => t.split('/')[1]).join(', ')}`
    };
  }
  
  return { valid: true };
};

// Fetch images from Supabase with improved error handling
export const fetchImages = async (filter: string = 'all'): Promise<ImageResponse> => {
  try {
    // Get current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Build query based on filter
    let query = supabase.from('images').select('*');
    
    if (filter === 'public') {
      query = query.eq('is_public', true);
    } else if (filter === 'private') {
      query = query.eq('is_public', false).eq('user_id', user.id);
    } else if (filter === 'all') {
      // For "all", we want all public images + user's private images
      query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
    }
    
    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database query error:', error);
      throw error;
    }
    
    // Get image stats for the current user
    const { data: statsData, error: statsError } = await supabase
      .from('images')
      .select('is_public')
      .eq('user_id', user.id);
    
    if (statsError) {
      console.error('Failed to fetch image stats:', statsError);
    }
    
    const totalImages = statsData ? statsData.length : 0;
    const publicImages = statsData ? statsData.filter(img => img.is_public).length : 0;
    
    // Map response and check ownership
    const images = data ? data.map((item: any) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      description: item.description,
      isPublic: item.is_public,
      createdAt: item.created_at,
      userId: item.user_id,
      isOwner: item.user_id === user.id
    })) : [];
    
    return {
      images,
      stats: {
        totalImages,
        publicImages,
        privateImages: totalImages - publicImages
      }
    };
  } catch (error) {
    console.error('Error in fetchImages:', error);
    throw error;
  }
};

// Upload image with enhanced validation and error handling
export const uploadImage = async (
  file: File, 
  title: string, 
  description: string = '',
  isPublic: boolean = true
): Promise<ImageItem> => {
  try {
    // First validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Get current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Generate a unique file name based on user ID for improved organization
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random().toString(36).slice(2)}-${Date.now()}.${fileExt}`;
    
    // Add public/private path based on visibility
    const filePath = isPublic ? 
      `public/${fileName}` : 
      `private/${fileName}`;
    
    // Upload file to storage with more detailed error tracking
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
      
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Failed to generate public URL for the uploaded image');
    }
    
    const imageUrl = publicUrlData.publicUrl;
    
    // Create database record with ownership
    const { data, error } = await supabase
      .from('images')
      .insert([
        {
          title,
          description,
          url: imageUrl,
          is_public: isPublic,
          user_id: user.id,
          owner_id: user.id
        }
      ])
      .select();
      
    if (error) {
      console.error('Database insert error:', error);
      // Delete the uploaded file if database insert fails
      await supabase.storage.from('images').remove([filePath]);
      throw new Error(`Database record creation failed: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      // Delete the uploaded file if database insert fails
      await supabase.storage.from('images').remove([filePath]);
      throw new Error('Failed to create image record');
    }
    
    // Return the created image with ownership info
    return {
      id: data[0].id,
      url: imageUrl,
      title: data[0].title,
      description: data[0].description,
      isPublic: data[0].is_public,
      createdAt: data[0].created_at,
      userId: data[0].user_id,
      isOwner: true // User is owner of newly created image
    };
  } catch (error: any) {
    console.error('Upload image error:', error);
    throw new Error(error.message || 'Image upload failed');
  }
};

// Delete image with permission checks
export const deleteImage = async (id: string): Promise<void> => {
  try {
    // First verify the current user owns this image
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check ownership
    const { data: imageData, error: fetchError } = await supabase
      .from('images')
      .select('url, user_id')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching image:', fetchError);
      throw fetchError;
    }
    
    if (!imageData) {
      throw new Error('Image not found');
    }
    
    if (imageData.user_id !== user.id) {
      throw new Error('You do not have permission to delete this image');
    }
    
    // Extract file path from URL
    const url = new URL(imageData.url);
    const pathname = url.pathname;
    // The path will be something like /storage/v1/object/public/images/filename
    // We need to extract just the filename
    const parts = pathname.split('/');
    const filename = parts.slice(parts.indexOf('images') + 1).join('/');
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('images')
      .remove([filename]);
      
    if (storageError) {
      console.error('Failed to delete image from storage:', storageError);
      // Continue to delete the database record even if storage deletion fails
    }
    
    // Delete database record
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', id);
      
    if (dbError) {
      throw dbError;
    }
  } catch (error: any) {
    console.error('Delete image error:', error);
    throw new Error(error.message || 'Failed to delete image');
  }
};

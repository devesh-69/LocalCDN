
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
}

// Fetch images from Supabase
export const fetchImages = async (filter: string = 'all'): Promise<ImageResponse> => {
  let query = supabase.from('images').select('*');
  
  // Get current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Filter by user
  query = query.eq('user_id', user.id);
  
  // Apply visibility filter
  if (filter === 'public') {
    query = query.eq('is_public', true);
  } else if (filter === 'private') {
    query = query.eq('is_public', false);
  }
  
  // Order by creation date (newest first)
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  // Get image stats
  const { data: statsData } = await supabase
    .from('images')
    .select('is_public')
    .eq('user_id', user.id);
  
  const totalImages = statsData ? statsData.length : 0;
  const publicImages = statsData ? statsData.filter(img => img.is_public).length : 0;
  
  // Map the Supabase response to our ImageItem format
  const images = data ? data.map((item: any) => ({
    id: item.id,
    url: item.url,
    title: item.title,
    description: item.description,
    isPublic: item.is_public,
    createdAt: item.created_at,
    userId: item.user_id
  })) : [];
  
  return {
    images,
    stats: {
      totalImages,
      publicImages,
      privateImages: totalImages - publicImages
    }
  };
};

// Upload image to Supabase storage and create database record
export const uploadImage = async (
  file: File, 
  title: string, 
  description: string = '',
  isPublic: boolean = true
): Promise<ImageItem> => {
  // Get current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Generate a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Math.random().toString(36).slice(2)}-${Date.now()}.${fileExt}`;
  const filePath = `images/${fileName}`;
  
  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file);
    
  if (uploadError) {
    throw uploadError;
  }
  
  // Get public URL for the uploaded image
  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);
    
  const imageUrl = publicUrlData.publicUrl;
  
  // Create database record
  const { data, error } = await supabase
    .from('images')
    .insert([
      {
        title,
        description,
        url: imageUrl,
        is_public: isPublic,
        user_id: user.id
      }
    ])
    .select();
    
  if (error) {
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error('Failed to create image record');
  }
  
  // Return the created image
  return {
    id: data[0].id,
    url: imageUrl,
    title: data[0].title,
    description: data[0].description,
    isPublic: data[0].is_public,
    createdAt: data[0].created_at,
    userId: data[0].user_id
  };
};

// Delete image from Supabase
export const deleteImage = async (id: string): Promise<void> => {
  // First get the image details to get the storage path
  const { data, error } = await supabase
    .from('images')
    .select('url')
    .eq('id', id)
    .single();
    
  if (error) {
    throw error;
  }
  
  // Extract file path from URL
  const url = new URL(data.url);
  const pathParts = url.pathname.split('/');
  const filePath = pathParts[pathParts.length - 2] + '/' + pathParts[pathParts.length - 1];
  
  // Delete from storage
  try {
    const { error: storageError } = await supabase.storage
      .from('images')
      .remove([filePath]);
      
    if (storageError) {
      console.error('Failed to delete image from storage:', storageError);
    }
  } catch (e) {
    console.error('Error deleting from storage:', e);
  }
  
  // Delete database record
  const { error: dbError } = await supabase
    .from('images')
    .delete()
    .eq('id', id);
    
  if (dbError) {
    throw dbError;
  }
};

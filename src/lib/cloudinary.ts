import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
});

// Type definitions for upload response
export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
}

export interface CloudinaryError {
  message: string;
  http_code?: number;
}

/**
 * Upload a file to Cloudinary
 * @param file The file to upload (Buffer or string path/URL)
 * @param options Upload options
 * @returns The upload result
 */
export async function uploadImage(
  file: string | Buffer,
  options: {
    folder?: string;
    publicId?: string;
    transformation?: any[];
    tags?: string[];
    resourceType?: "image" | "video" | "raw" | "auto";
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions: any = {
      resource_type: options.resourceType || "image",
      use_filename: true,
      unique_filename: true,
    };

    if (options.folder) {
      uploadOptions.folder = options.folder;
    }

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    if (options.tags) {
      uploadOptions.tags = options.tags;
    }

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploader =
        typeof file === "string"
          ? cloudinary.uploader.upload
          : cloudinary.uploader.upload_stream;

      const handleUpload = (error: CloudinaryError | null, result: any) => {
        if (error) return reject(error);
        resolve(result);
      };

      if (typeof file === "string") {
        uploader(file, uploadOptions, handleUpload);
      } else {
        const stream = uploader(uploadOptions, handleUpload);
        stream.end(file);
      }
    });

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId The public ID of the image to delete
 * @returns The deletion result
 */
export async function deleteImage(publicId: string): Promise<{ result: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

/**
 * Generate a URL for an image with transformations
 * @param publicId The public ID of the image
 * @param options Transformation options
 * @returns The transformed image URL
 */
export function generateImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
    effect?: string;
  } = {}
): string {
  const transformationOptions: any = {};

  if (options.width) transformationOptions.width = options.width;
  if (options.height) transformationOptions.height = options.height;
  if (options.crop) transformationOptions.crop = options.crop;
  if (options.quality) transformationOptions.quality = options.quality;
  if (options.format) transformationOptions.format = options.format;
  if (options.effect) transformationOptions.effect = options.effect;

  return cloudinary.url(publicId, {
    secure: true,
    ...transformationOptions,
  });
}

export default cloudinary; 
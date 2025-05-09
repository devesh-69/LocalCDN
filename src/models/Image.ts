import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

// Define the interface for Image document
export interface IImage extends Document {
  title: string;
  description?: string;
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  size: number;
  owner: mongoose.Types.ObjectId | IUser;
  tags: string[];
  isPublic: boolean;
  metadata: {
    location?: string;
    captureDate?: Date;
    camera?: string;
    [key: string]: any;
  };
  versions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Image schema
const ImageSchema = new Schema<IImage>(
  {
    title: {
      type: String,
      required: [true, "Image title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    size: {
      type: Number, // in bytes
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    metadata: {
      location: String,
      captureDate: Date,
      camera: String,
      // Additional metadata can be added as needed
    },
    versions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Version",
    }],
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

// Create text index for search functionality
ImageSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  'metadata.location': 'text',
  'metadata.camera': 'text',
}, {
  weights: {
    title: 10,
    description: 5,
    tags: 8,
    'metadata.location': 6,
    'metadata.camera': 4,
  },
  name: 'text_search_index'
});

// Create indices for faster queries
ImageSchema.index({ owner: 1 });
ImageSchema.index({ tags: 1 });
ImageSchema.index({ isPublic: 1 });
ImageSchema.index({ "metadata.location": 1 });
ImageSchema.index({ "metadata.captureDate": 1 });

// Create compound indices for common query patterns
ImageSchema.index({ isPublic: 1, createdAt: -1 }); // For public gallery with sorting
ImageSchema.index({ owner: 1, createdAt: -1 }); // For user's images with sorting
ImageSchema.index({ tags: 1, createdAt: -1 }); // For tag-based searches with sorting
ImageSchema.index({ isPublic: 1, tags: 1 }); // For public images with specific tags
ImageSchema.index({ "metadata.camera": 1 }); // For camera-specific searches
ImageSchema.index({ "metadata.camera": 1, "metadata.captureDate": -1 }); // For camera + date range
ImageSchema.index({ format: 1 }); // For format-specific searches
ImageSchema.index({ size: 1 }); // For size-based sorting and filtering

// Create Image model
const Image = mongoose.models.Image || mongoose.model<IImage>("Image", ImageSchema);

export default Image; 
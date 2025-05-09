import mongoose, { Schema, Document } from "mongoose";
import { IImage } from "./Image";

// Define the interface for Version document
export interface IVersion extends Document {
  originalImage: mongoose.Types.ObjectId | IImage;
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  size: number;
  transformation: {
    type: string; // crop, resize, filter, etc.
    params: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Define Version schema
const VersionSchema = new Schema<IVersion>(
  {
    originalImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
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
    transformation: {
      type: {
        type: String,
        required: true,
        enum: ["crop", "resize", "filter", "watermark", "other"],
      },
      params: {
        type: Schema.Types.Mixed,
        required: true,
      },
    },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

// Create indices for faster queries
VersionSchema.index({ originalImage: 1 });
VersionSchema.index({ "transformation.type": 1 });

// Create Version model
const Version = mongoose.models.Version || mongoose.model<IVersion>("Version", VersionSchema);

export default Version; 